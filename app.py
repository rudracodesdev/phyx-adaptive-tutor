import os
import sys
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from pydantic import BaseModel, Field

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = HERE if os.path.isdir(os.path.join(HERE, "backend")) else os.path.abspath(os.path.join(HERE, ".."))
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
    clean_name = filename.lstrip("/")
    if not clean_name:
        clean_name = "index.html"
    safe_path = os.path.abspath(os.path.join(FRONTEND_DIR, clean_name))
    if not safe_path.startswith(os.path.abspath(FRONTEND_DIR) + os.sep) and safe_path != os.path.abspath(os.path.join(FRONTEND_DIR, "index.html")):
        return None
    if not os.path.isfile(safe_path):
        return None
    ext = os.path.splitext(safe_path)[1].lower()
    media_type = MIME_TYPES.get(ext, "application/octet-stream")
    with open(safe_path, "rb") as f:
        data = f.read()
    return Response(content=data, media_type=media_type, headers={"Cache-Control": "no-cache"})
@app.get("/api/health")
def api_health():
    return {"status": "ok", "frontend_exists": os.path.isfile(os.path.join(FRONTEND_DIR, "index.html"))}
    resp = _read_static_file("index.html")
    return resp if resp else JSONResponse(status_code=500, content={"error": "index.html not found"})


@app.get("/{full_path:path}")
def serve_static(full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    resp = _read_static_file(full_path)
    if resp:
        return resp
    index_resp = _read_static_file("index.html")
    return index_resp if index_resp else JSONResponse(status_code=404, content={"detail": "Not found"})
