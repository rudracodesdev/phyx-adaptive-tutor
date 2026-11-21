import os
import sys
import traceback
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

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
    return Response(content=data, media_type=media_type, headers={"Cache-Control": "no-cache"})


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


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "startup_error": STARTUP_ERROR},
    )
        "status": "ok" if not STARTUP_ERROR else "degraded",
        "startup_error": STARTUP_ERROR,
        "frontend_dir": FRONTEND_DIR,
        "index_exists": os.path.isfile(os.path.join(FRONTEND_DIR, "index.html")),
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
