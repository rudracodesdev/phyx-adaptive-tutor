import os
import sys
import traceback
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = HERE if os.path.isdir(os.path.join(HERE, "backend")) else os.path.abspath(os.path.join(HERE, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

STARTUP_ERROR: Optional[str] = None
store = None

try:
    from syllabus_graph import CONCEPT_NODES, DIAGNOSTIC_QUESTIONS
    from learner_model import LearnerModelStore
    from ai_engine import generate_targeted_question, analyze_student_reasoning
    from chatbot_engine import answer_user_query, answer_lecture_doubt
    from voice_engine import transcribe_wav_bytes
    from security import (
        generate_captcha,
        verify_captcha,
        verify_password,
        create_session_token,
        verify_session_token,
    )
    store = LearnerModelStore()
except Exception:
    STARTUP_ERROR = traceback.format_exc()
    CONCEPT_NODES = []
    DIAGNOSTIC_QUESTIONS = []

app = FastAPI(title="PHYX — Adaptive Exam-Prep Tutor")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
}


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "startup_error": STARTUP_ERROR},
    )


def _read_static_file(filename: str) -> Optional[Response]:
    clean_name = (filename or "index.html").lstrip("/") or "index.html"
    base_dir = os.path.abspath(FRONTEND_DIR)
    safe_path = os.path.abspath(os.path.join(base_dir, clean_name))
    if not (safe_path == base_dir or safe_path.startswith(base_dir + os.sep)):
        return None
    if not os.path.isfile(safe_path):
        return None
    ext = os.path.splitext(safe_path)[1].lower()
    media_type = MIME_TYPES.get(ext, "application/octet-stream")
    with open(safe_path, "rb") as f:
        data = f.read()
    return Response(content=data, media_type=media_type, headers={"Cache-Control": "no-store"})


def _build_edges() -> List[dict]:
    edges = []
    for node in CONCEPT_NODES:
        for prereq in node.get("prereqs", []):
            edges.append({"from": prereq, "to": node["id"]})
    return edges


def _state_payload(student_id: str) -> Dict[str, Any]:
    return {
        "student": store.get_student(student_id),
        "graph": {"nodes": CONCEPT_NODES, "edges": _build_edges()},
        "due_concepts": store.get_due_concepts(student_id),
        "next_recommendation": store.select_next_target_concept(student_id),
    }


@app.get("/api/health")
def api_health():
    return {
        "status": "ok" if not STARTUP_ERROR else "degraded",
        "startup_error": STARTUP_ERROR,
        "state_path": getattr(store, "path", None),
        "index_exists": os.path.isfile(os.path.join(FRONTEND_DIR, "index.html")),
    }


@app.get("/api/auth/captcha")
def api_captcha():
    return generate_captcha()


@app.post("/api/auth/signup")
async def api_signup(request: Request):
    body = await request.json()
    if not verify_captcha(body.get("captcha_token", ""), body.get("captcha_answer", "")):
        raise HTTPException(status_code=400, detail="Invalid or expired CAPTCHA answer.")
    try:
        user = store.register_user(
            body.get("name", ""),
            body.get("email", ""),
            body.get("password", ""),
            body.get("role", "student"),
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    token = create_session_token(user["id"], user["email"], user["name"], user["role"])
    return {"token": token, "user": {k: user[k] for k in ("id", "email", "name", "role", "plan")}}


@app.post("/api/auth/login")
async def api_login(request: Request):
    body = await request.json()
    if not verify_captcha(body.get("captcha_token", ""), body.get("captcha_answer", "")):
        raise HTTPException(status_code=400, detail="Invalid or expired CAPTCHA answer.")
    user = store.get_user_by_email(body.get("email", ""))
    if not user or not verify_password(body.get("password", ""), user["password_hash"], user["password_salt"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_session_token(user["id"], user["email"], user["name"], user["role"])
    return {"token": token, "user": {k: user[k] for k in ("id", "email", "name", "role", "plan")}}


@app.post("/api/auth/demo")
async def api_demo(request: Request):
    body = await request.json()
    role = body.get("role", "student")
    email = "teacher@physicsmind.edu" if role == "teacher" else "student@physicsmind.edu"
    user = store.get_user_by_email(email)
    token = create_session_token(user["id"], user["email"], user["name"], user["role"])
    return {"token": token, "user": {k: user[k] for k in ("id", "email", "name", "role", "plan")}}


@app.get("/api/auth/me")
def api_me(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        return {"authenticated": False, "user": None}
    claims = verify_session_token(authorization.split(" ", 1)[1].strip())
    if not claims:
        return {"authenticated": False, "user": None}
    return {
        "authenticated": True,
        "user": {
            "id": claims["uid"],
            "email": claims["email"],
            "name": claims["name"],
            "role": claims["role"],
            "plan": "pro",
        },
    }


@app.get("/api/diagnostic")
def api_diagnostic():
    return {"questions": DIAGNOSTIC_QUESTIONS}


@app.post("/api/diagnostic/submit")
async def api_diag_submit(request: Request):
    body = await request.json()
    student_id = body.get("student_id", "student_1")
    results = []
    for ans in body.get("answers", []):
        diag = analyze_student_reasoning(
            concept_id=ans["concept_id"],
            question_prompt=ans["prompt"],
            selected_option=ans.get("selected_option", ""),
            correct_option=ans["correct_option"],
            student_reasoning=ans.get("reasoning", ""),
        )
        bkt = store.update_mastery(
            student_id=student_id,
            concept_id=ans["concept_id"],
            is_correct=diag["is_correct"],
            reasoning_flawed=diag["reasoning_flawed"],
            misconception_label=diag["misconception_label"],
            student_reasoning=ans.get("reasoning", ""),
            question_prompt=ans["prompt"],
        )
        results.append({"question_id": ans["question_id"], "concept_id": ans["concept_id"], **diag, **bkt})
    store.get_student(student_id)["diagnostic_completed"] = True
    store._save()
    return {"results": results, "state": _state_payload(student_id)}


@app.get("/api/state/{student_id}")
def api_state(student_id: str):
    return _state_payload(student_id)


@app.post("/api/reset/{student_id}")
def api_reset(student_id: str):
    return {"status": "reset", "student": store.reset_student(student_id)}


@app.get("/api/next-question/{student_id}")
def api_next_question(
    student_id: str,
    concept_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    format: str = "mixed",
):
    rec = store.select_next_target_concept(student_id)
    target_cid = concept_id if concept_id else rec["concept_id"]
    student = store.get_student(student_id)
    if target_cid not in student["concepts"]:
        raise HTTPException(status_code=404, detail=f"Unknown concept_id: {target_cid}")
    mastery = student["concepts"][target_cid]["mastery"]
    diff = difficulty if difficulty in ("easy", "medium", "hard") else (
        "easy" if mastery < 0.45 else ("medium" if mastery < 0.75 else "hard")
    )
    active_misc = next(
        (m["label"] for m in reversed(student["concepts"][target_cid]["misconceptions"]) if not m.get("resolved", False)),
        None,
    )
    question = generate_targeted_question(
        concept_id=target_cid,
        difficulty=diff,
        target_misconception=active_misc,
        question_format=format,
    )
    return {
        "question": question,
        "recommendation_reason": {
            "is_spaced_repetition_due": target_cid in store.get_due_concepts(student_id),
            "target_misconception": active_misc,
            "current_mastery": mastery,
            "selection_reason": rec.get("selection_reason", "Weakest Ready Concept"),
        },
    }


@app.post("/api/submit-answer")
async def api_submit_answer(request: Request):
    body = await request.json()
    student_id = body.get("student_id", "student_1")
    diag = analyze_student_reasoning(
        concept_id=body["concept_id"],
        question_prompt=body["prompt"],
        selected_option=body.get("selected_option", ""),
        correct_option=body["correct_option"],
        student_reasoning=body.get("reasoning", ""),
        question_type=body.get("question_type", "mcq"),
        expected_keywords=body.get("expected_keywords") or [],
    )
    bkt = store.update_mastery(
        student_id=student_id,
        concept_id=body["concept_id"],
        is_correct=diag["is_correct"],
        reasoning_flawed=diag["reasoning_flawed"],
        misconception_label=diag["misconception_label"],
        student_reasoning=body.get("reasoning", ""),
        question_prompt=body["prompt"],
        difficulty=body.get("difficulty", "medium"),
    )
    return {
        "correct_option": body["correct_option"],
        **diag,
        **bkt,
        "state": _state_payload(student_id),
    }


@app.post("/api/simulate-time")
async def api_simulate_time(request: Request):
    body = await request.json()
    student_id = body.get("student_id", "student_1")
    store.advance_time(student_id, int(body.get("hours", 24)))
    return _state_payload(student_id)


@app.get("/api/teacher/dashboard")
def api_teacher_dashboard():
    return store.get_teacher_dashboard()


@app.post("/api/chatbot")
async def api_chatbot(request: Request):
    body = await request.json()
    student = store.get_student(body.get("student_id", "guest"))
    return answer_user_query(body.get("query", ""), student_state=student)


@app.post("/api/lecture-doubt")
async def api_lecture_doubt(request: Request):
    body = await request.json()
    student = store.get_student(body.get("student_id", "guest"))
    return answer_lecture_doubt(
        topic_id=body.get("topic_id", "P2"),
        step_heading=body.get("step_heading", ""),
        step_speech=body.get("step_speech", ""),
        doubt=body.get("doubt", ""),
        student_state=student,
    )


@app.post("/api/voice-transcribe")
async def api_voice_transcribe(request: Request):
    wav_bytes = await request.body()
    return transcribe_wav_bytes(wav_bytes)


@app.get("/")
def serve_index():
    resp = _read_static_file("index.html")
    if resp:
        return resp
    return JSONResponse(status_code=500, content={"error": "index.html not found", "frontend_dir": FRONTEND_DIR})


@app.get("/{full_path:path}")
def serve_static(full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    resp = _read_static_file(full_path)
    if resp:
        return resp
    index_resp = _read_static_file("index.html")
    if index_resp:
        return index_resp
    return JSONResponse(status_code=404, content={"detail": "Not found"})
