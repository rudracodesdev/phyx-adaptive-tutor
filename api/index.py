import os
import sys
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from syllabus_graph import CONCEPT_NODES, DIAGNOSTIC_QUESTIONS # noqa: E402
from learner_model import LearnerModelStore # noqa: E402
from ai_engine import generate_targeted_question, analyze_student_reasoning # noqa: E402
from chatbot_engine import answer_user_query, answer_lecture_doubt # noqa: E402
from voice_engine import transcribe_wav_bytes # noqa: E402
from security import ( # noqa: E402
    generate_captcha,
    verify_captcha,
    verify_password,
    create_session_token,
    verify_session_token,
)

app = FastAPI(title="PHYX — Adaptive Exam-Prep Tutor")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

store = LearnerModelStore()


def _build_edges() -> List[dict]:
    edges = []
    for node in CONCEPT_NODES:
        for prereq in node["prereqs"]:
            edges.append({"from": prereq, "to": node["id"]})
    return edges


def _state_payload(student_id: str) -> Dict[str, Any]:
    return {
        "student": store.get_student(student_id),
        "graph": {"nodes": CONCEPT_NODES, "edges": _build_edges()},
        "due_concepts": store.get_due_concepts(student_id),
        "next_recommendation": store.select_next_target_concept(student_id),
    }


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    role: str = "student"
    captcha_token: str
    captcha_answer: str


class LoginRequest(BaseModel):
    email: str
    password: str
    captcha_token: str
    captcha_answer: str


class DemoLoginRequest(BaseModel):
    role: str = "student"


class DiagnosticItem(BaseModel):
    question_id: str
    concept_id: str
    prompt: str
    selected_option: str
    correct_option: str
    reasoning: str = ""


class DiagnosticSubmit(BaseModel):
    student_id: str = "student_1"
    answers: List[DiagnosticItem]


class AnswerSubmit(BaseModel):
    student_id: str = "student_1"
    question_id: str
    concept_id: str
    question_type: str = "mcq"
    difficulty: str = "medium"
    prompt: str
    selected_option: str = ""
    correct_option: str
    reasoning: str = ""
    expected_keywords: List[str] = []


class TimeSimRequest(BaseModel):
    student_id: str = "student_1"
    hours: int = 24


class ChatbotReq(BaseModel):
    student_id: str = "guest"
    query: str = Field(..., min_length=1, max_length=500)


class DoubtReq(BaseModel):
    student_id: str = "guest"
    topic_id: str = "P2"
    step_heading: str = ""
    step_speech: str = ""
    doubt: str = ""


@app.get("/api/auth/captcha")
def api_captcha():
    return generate_captcha()


@app.post("/api/auth/signup")
def api_signup(payload: SignupRequest):
    if not verify_captcha(payload.captcha_token, payload.captcha_answer):
        raise HTTPException(status_code=400, detail="Invalid or expired CAPTCHA answer.")
    try:
        user = store.register_user(payload.name, payload.email, payload.password, payload.role)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    token = create_session_token(user["id"], user["email"], user["name"], user["role"])
    return {"token": token, "user": {k: user[k] for k in ("id", "email", "name", "role", "plan")}}


@app.post("/api/auth/login")
def api_login(payload: LoginRequest):
    if not verify_captcha(payload.captcha_token, payload.captcha_answer):
        raise HTTPException(status_code=400, detail="Invalid or expired CAPTCHA answer.")
    user = store.get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"], user["password_salt"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_session_token(user["id"], user["email"], user["name"], user["role"])
    return {"token": token, "user": {k: user[k] for k in ("id", "email", "name", "role", "plan")}}


@app.post("/api/auth/demo")
def api_demo(payload: DemoLoginRequest):
    email = "teacher@physicsmind.edu" if payload.role == "teacher" else "student@physicsmind.edu"
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
def api_diag_submit(payload: DiagnosticSubmit):
    results = []
    for ans in payload.answers:
        diag = analyze_student_reasoning(
            concept_id=ans.concept_id,
            question_prompt=ans.prompt,
            selected_option=ans.selected_option,
            correct_option=ans.correct_option,
            student_reasoning=ans.reasoning,
        )
        bkt = store.update_mastery(
            student_id=payload.student_id,
            concept_id=ans.concept_id,
            is_correct=diag["is_correct"],
            reasoning_flawed=diag["reasoning_flawed"],
            misconception_label=diag["misconception_label"],
            student_reasoning=ans.reasoning,
            question_prompt=ans.prompt,
        )
        results.append({"question_id": ans.question_id, "concept_id": ans.concept_id, **diag, **bkt})
    store.get_student(payload.student_id)["diagnostic_completed"] = True
    store._save()
    return {"results": results, "state": _state_payload(payload.student_id)}


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
def api_submit_answer(payload: AnswerSubmit):
    diag = analyze_student_reasoning(
        concept_id=payload.concept_id,
        question_prompt=payload.prompt,
        selected_option=payload.selected_option,
        correct_option=payload.correct_option,
        student_reasoning=payload.reasoning,
        question_type=payload.question_type,
        expected_keywords=payload.expected_keywords,
    )
    bkt = store.update_mastery(
        student_id=payload.student_id,
        concept_id=payload.concept_id,
        is_correct=diag["is_correct"],
        reasoning_flawed=diag["reasoning_flawed"],
        misconception_label=diag["misconception_label"],
        student_reasoning=payload.reasoning,
        question_prompt=payload.prompt,
        difficulty=payload.difficulty,
    )
    return {
        "correct_option": payload.correct_option,
        **diag,
        **bkt,
        "state": _state_payload(payload.student_id),
    }


@app.post("/api/simulate-time")
def api_simulate_time(payload: TimeSimRequest):
    store.advance_time(payload.student_id, payload.hours)
    return _state_payload(payload.student_id)


@app.get("/api/teacher/dashboard")
def api_teacher_dashboard():
    return store.get_teacher_dashboard()


@app.post("/api/chatbot")
def api_chatbot(payload: ChatbotReq):
    student = store.get_student(payload.student_id)
    return answer_user_query(payload.query, student_state=student)


@app.post("/api/lecture-doubt")
def api_lecture_doubt(payload: DoubtReq):
    student = store.get_student(payload.student_id)
    return answer_lecture_doubt(
        topic_id=payload.topic_id,
        step_heading=payload.step_heading,
        step_speech=payload.step_speech,
        doubt=payload.doubt,
        student_state=student,
    )


@app.post("/api/voice-transcribe")
async def api_voice_transcribe(request: Request):
    wav_bytes = await request.body()
    return transcribe_wav_bytes(wav_bytes)


@app.get("/")
def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


@app.get("/{full_path:path}")
def serve_static(full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    safe_path = os.path.abspath(os.path.join(FRONTEND_DIR, full_path))
    if safe_path.startswith(FRONTEND_DIR) and os.path.isfile(safe_path):
        return FileResponse(safe_path)
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
