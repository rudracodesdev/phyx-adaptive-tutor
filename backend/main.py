import json
import mimetypes
import os
import re
import socket
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

class DualStackServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6
    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()
from typing import Any, Dict, List
from urllib.parse import parse_qs, urlparse

from syllabus_graph import CONCEPT_NODES, DIAGNOSTIC_QUESTIONS
from learner_model import LearnerModelStore
from ai_engine import generate_targeted_question, analyze_student_reasoning
from chatbot_engine import answer_user_query
from voice_engine import transcribe_wav_bytes
from security import (
    generate_captcha,
    verify_captcha,
    verify_password,
    create_session_token,
    verify_session_token,
)

store = LearnerModelStore()
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))


def _build_edges() -> List[dict]:
    edges = []
    for node in CONCEPT_NODES:
        for prereq in node["prereqs"]:
            edges.append({"from": prereq, "to": node["id"]})
    return edges


def get_student_state_payload(student_id: str) -> Dict[str, Any]:
    student = store.get_student(student_id)
    due = store.get_due_concepts(student_id)
    return {
        "student": student,
        "graph": {
            "nodes": CONCEPT_NODES,
            "edges": _build_edges(),
        },
        "due_concepts": due,
        "next_recommendation": store.select_next_target_concept(student_id),
    }


class PhysicsMindRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:
        print(f"[PhysicsMind] {self.address_string()} - {format % args}")

    def _send_json(self, status_code: int, payload: Dict[str, Any]) -> None:
        raw = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(raw)

    def _read_json_body(self) -> Dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw) if raw else {}

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == "/api/auth/captcha":
            return self._send_json(200, generate_captcha())

        if path == "/api/auth/me":
            auth = self.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                return self._send_json(200, {"authenticated": False, "user": None})
            claims = verify_session_token(auth.split(" ", 1)[1].strip())
            if not claims:
                return self._send_json(200, {"authenticated": False, "user": None})
            return self._send_json(
                200,
                {
                    "authenticated": True,
                    "user": {
                        "id": claims["uid"],
                        "email": claims["email"],
                        "name": claims["name"],
                        "role": claims["role"],
                        "plan": "pro",
                    },
                },
            )

        if path == "/api/diagnostic":
            return self._send_json(200, {"questions": DIAGNOSTIC_QUESTIONS})

        if path == "/api/teacher/dashboard":
            return self._send_json(200, store.get_teacher_dashboard())

        m_state = re.match(r"^/api/state/([a-zA-Z0-9_-]+)$", path)
        if m_state:
            return self._send_json(200, get_student_state_payload(m_state.group(1)))

        m_next = re.match(r"^/api/next-question/([a-zA-Z0-9_-]+)$", path)
        if m_next:
            student_id = m_next.group(1)
            concept_id = qs.get("concept_id", [None])[0]
            rec = store.select_next_target_concept(student_id)
            target_cid = concept_id if concept_id else rec["concept_id"]
            student = store.get_student(student_id)
            if target_cid not in student["concepts"]:
                return self._send_json(404, {"detail": f"Unknown concept_id: {target_cid}"})
            mastery = student["concepts"][target_cid]["mastery"]
            requested_diff = qs.get("difficulty", [None])[0]
            difficulty = requested_diff if requested_diff in ("easy", "medium", "hard") else ("easy" if mastery < 0.45 else ("medium" if mastery < 0.75 else "hard"))
            active_misc = next(
                (m["label"] for m in reversed(student["concepts"][target_cid]["misconceptions"]) if not m.get("resolved", False)),
                None,
            )
            requested_fmt = qs.get("format", ["mixed"])[0]
            question = generate_targeted_question(
                concept_id=target_cid,
                difficulty=difficulty,
                target_misconception=active_misc,
                question_format=requested_fmt,
            )
            return self._send_json(
                200,
                {
                    "question": question,
                    "recommendation_reason": {
                        "is_spaced_repetition_due": target_cid in store.get_due_concepts(student_id),
                        "target_misconception": active_misc,
                        "current_mastery": mastery,
                        "selection_reason": rec.get("selection_reason", "Targeted Weak Concept"),
                    },
                },
            )

        if not path.startswith("/api/"):
            rel_path = "index.html" if path == "/" else path.lstrip("/")
            safe_path = os.path.abspath(os.path.join(FRONTEND_DIR, rel_path))
            if safe_path.startswith(FRONTEND_DIR) and os.path.isfile(safe_path):
                mime_type, _ = mimetypes.guess_type(safe_path)
                with open(safe_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", mime_type or "application/octet-stream")
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Cache-Control", "no-store, must-revalidate")
                self.end_headers()
                self.wfile.write(content)
                return

        self._send_json(404, {"detail": "Not found"})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            body = self._read_json_body()
        except Exception:
            return self._send_json(400, {"detail": "Invalid JSON body"})

        if path == "/api/auth/signup":
            name = (body.get("name") or "").strip()
            email = (body.get("email") or "").strip()
            password = body.get("password") or ""
            role = body.get("role") or "student"
            if len(name) < 2 or len(email) < 5 or len(password) < 6:
                return self._send_json(400, {"detail": "Please provide valid name, email, and password (min 6 chars)."})
            if not verify_captcha(body.get("captcha_token", ""), body.get("captcha_answer", "")):
                return self._send_json(400, {"detail": "Invalid or expired CAPTCHA answer. Please solve the new challenge."})
            try:
                user = store.register_user(name, email, password, role)
            except ValueError as e:
                return self._send_json(409, {"detail": str(e)})
            token = create_session_token(user["id"], user["email"], user["name"], user["role"])
            return self._send_json(
                200,
                {
                    "token": token,
                    "user": {
                        "id": user["id"],
                        "email": user["email"],
                        "name": user["name"],
                        "role": user["role"],
                        "plan": user["plan"],
                    },
                },
            )

        if path == "/api/auth/login":
            if not verify_captcha(body.get("captcha_token", ""), body.get("captcha_answer", "")):
                return self._send_json(400, {"detail": "Invalid or expired CAPTCHA answer. Please solve the new challenge."})
            user = store.get_user_by_email(body.get("email", ""))
            if not user or not verify_password(body.get("password", ""), user["password_hash"], user["password_salt"]):
                return self._send_json(401, {"detail": "Invalid email or password."})
            token = create_session_token(user["id"], user["email"], user["name"], user["role"])
            return self._send_json(
                200,
                {
                    "token": token,
                    "user": {
                        "id": user["id"],
                        "email": user["email"],
                        "name": user["name"],
                        "role": user["role"],
                        "plan": user["plan"],
                    },
                },
            )

        if path == "/api/auth/demo":
            role = body.get("role", "student")
            email = "teacher@physicsmind.edu" if role == "teacher" else "student@physicsmind.edu"
            user = store.get_user_by_email(email)
            token = create_session_token(user["id"], user["email"], user["name"], user["role"])
            return self._send_json(
                200,
                {
                    "token": token,
                    "user": {
                        "id": user["id"],
                        "email": user["email"],
                        "name": user["name"],
                        "role": user["role"],
                        "plan": user["plan"],
                    },
                },
            )

        m_reset = re.match(r"^/api/reset/([a-zA-Z0-9_-]+)$", path)
        if m_reset:
            student = store.reset_student(m_reset.group(1))
            return self._send_json(200, {"status": "reset", "student": student})

        if path == "/api/diagnostic/submit":
            student_id = body.get("student_id", "student_1")
            answers = body.get("answers", [])
            results = []
            for ans in answers:
                diag = analyze_student_reasoning(
                    concept_id=ans["concept_id"],
                    question_prompt=ans["prompt"],
                    selected_option=ans.get("selected_option", ""),
                    correct_option=ans["correct_option"],
                    student_reasoning=ans.get("reasoning", ""),
                )
                bkt_update = store.update_mastery(
                    student_id=student_id,
                    concept_id=ans["concept_id"],
                    is_correct=diag["is_correct"],
                    reasoning_flawed=diag["reasoning_flawed"],
                    misconception_label=diag["misconception_label"],
                    student_reasoning=ans.get("reasoning", ""),
                    question_prompt=ans["prompt"],
                )
                results.append(
                    {
                        "question_id": ans["question_id"],
                        "concept_id": ans["concept_id"],
                        **diag,
                        **bkt_update,
                    }
                )
            student = store.get_student(student_id)
            student["diagnostic_completed"] = True
            store._save()
            return self._send_json(200, {"results": results, "state": get_student_state_payload(student_id)})

        if path == "/api/submit-answer":
            student_id = body.get("student_id", "student_1")
            diag = analyze_student_reasoning(
                concept_id=body["concept_id"],
                question_prompt=body["prompt"],
                selected_option=body.get("selected_option", ""),
                correct_option=body["correct_option"],
                student_reasoning=body.get("reasoning", ""),
                question_type=body.get("question_type", "mcq"),
                expected_keywords=body.get("expected_keywords", []),
            )
            bkt_update = store.update_mastery(
                student_id=student_id,
                concept_id=body["concept_id"],
                is_correct=diag["is_correct"],
                reasoning_flawed=diag["reasoning_flawed"],
                misconception_label=diag["misconception_label"],
                student_reasoning=body.get("reasoning", ""),
                question_prompt=body["prompt"],
                difficulty=body.get("difficulty", "medium"),
            )
            return self._send_json(
                200,
                {
                    "correct_option": body["correct_option"],
                    **diag,
                    **bkt_update,
                    "state": get_student_state_payload(student_id),
                },
            )

        if path == "/api/simulate-time":
            student_id = body.get("student_id", "student_1")
            hours = int(body.get("hours", 24))
            store.advance_time(student_id, hours)
            return self._send_json(200, get_student_state_payload(student_id))

        if path == "/api/voice-transcribe":
            length = int(self.headers.get("Content-Length", "0"))
            wav_bytes = self.rfile.read(length) if length > 0 else b""
            return self._send_json(200, transcribe_wav_bytes(wav_bytes))

        if path == "/api/chatbot":
            student_id = body.get("student_id", "guest")
            query = body.get("query", "")
            student = store.get_student(student_id)
            return self._send_json(200, answer_user_query(query, student_state=student))

        self._send_json(404, {"detail": "Not found"})


def run_server(port: int = 8000) -> None:
    server = DualStackServer(("::", port), PhysicsMindRequestHandler)
    print("============================================================")
    print(f" PhysicsMind Pro Server running at: http://localhost:{port}")
    print(" Zero API keys & zero external dependencies required.")
    print("============================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()


if __name__ == "__main__":
    run_server(int(os.environ.get("PORT", "8000")))