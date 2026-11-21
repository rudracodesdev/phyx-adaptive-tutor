# PHYX — Adaptive Exam-Prep Tutor, Learner Model & Simulation Labs (Class 10 Physics)

**PHYX** is a full-stack, offline-capable adaptive exam-preparation platform built around the **2026–27 NCERT Class 10 Physics syllabus** (4 chapters, 13 prerequisite-linked concepts). It runs natively on Python 3 with **zero external API keys** and **zero third-party `pip` dependencies**.

---

## Key Capabilities

1. **Interactive Landing Home Page**:
   - Features a live 60fps HTML5 Canvas physics/electromagnetic field animation with cursor interaction and click ripples.
   - Provides direct workspace navigation cards and an unboxed **How Does PHYX Work?** architectural guide.

2. **Cross-Syllabus Diagnostic Placement Test**:
   - 5 diagnostic questions spanning Light, Human Eye, Electricity, and Magnetism to initialize prior mastery and surface early misconceptions, complete with a placement summary report.

3. **13-Node Prerequisite Concept Graph (DAG)**:
   - Models dependencies across:
     - **Ch 9: Light – Reflection and Refraction** (`P1`–`P4`)
     - **Ch 10: The Human Eye and the Colourful World** (`P11`–`P12`)
     - **Ch 11: Electricity** (`P5`–`P8`)
     - **Ch 12: Magnetic Effects of Electric Current** (`P9`, `P10`, `P13`)
   - Propagates mastery updates along prerequisite edges and includes an interactive node inspector.

4. **Bayesian Knowledge Tracing (BKT) Learner Model**:
   - Updates concept mastery dynamically after every submission using difficulty-calibrated Slip and Guess probabilities while preventing single lucky guesses from inflating scores.

5. **MCQ + Subjective Question Generation & Rubric Grading**:
   - Supports **Mixed (MCQ + Subjective)**, **MCQ Only**, and **Subjective Only** modes with difficulty calibration (`Auto`, `Easy`, `Medium`, `Hard`).
   - Grades step-by-step subjective derivations/numericals against concept rubrics and displays board-exam model solutions.

6. **Reasoning-Based Misconception Detection**:
   - Evaluates the student's written reasoning alongside their answer—catching sign-convention errors, parallel-resistor addition mistakes, wire-stretching traps, and lucky guesses with flawed logic.

7. **SM-2 Spaced-Repetition Scheduler**:
   - Tracks Easiness Factor (EF) and review intervals per concept, with a `+24h` simulation clock and one-click practice for due reviews.

8. **Teacher Cohort Intelligence Dashboard**:
   - Ranks class-wide concept gaps, summarizes unit-level mastery, aggregates recurring reasoning misconceptions, provides one-click remediation drills/lectures, and exports cohort reports as CSV.

9. **Prof. Aria Interactive AI Lecture, 8 Simulation Labs, Voice Input & Auth/CAPTCHA**:
   - **Prof. Aria AI Lecture**: Step-by-step smart-board explanations with exact word-level **Pause / Resume From Where Left** and live mid-lecture doubt interruption (`/api/lecture-doubt`).
   - **8 HTML5 Canvas Simulation Labs**: 4 free labs (one per NCERT chapter) plus 4 member-unlocked labs.
   - **User Voice-to-Text Input & Personal AI Chatbot**: Dictate doubts, reasoning, or navigation commands via microphone or text (`/api/chatbot`, `/api/voice-transcribe`).
   - **Security**: `PBKDF2-HMAC-SHA256` password hashing, HMAC-signed session tokens, and server-verified SVG Math CAPTCHA (`/api/auth/*`).

---

## Project Structure

```text
adaptive-physics-tutor/
├── backend/
│   ├── main.py              # Multi-threaded HTTP + REST API server & static file host
│   ├── security.py          # PBKDF2-HMAC-SHA256 hashing, signed tokens & SVG Math CAPTCHA
│   ├── syllabus_graph.py    # 2026-27 NCERT Class 10 Physics 13-node DAG & diagnostic bank
│   ├── learner_model.py     # BKT mastery engine, DAG propagation, SM-2 & cohort store
│   ├── ai_engine.py         # MCQ + Subjective generator & reasoning misconception analyzer
│   ├── chatbot_engine.py    # Personal AI assistant, voice intent router & lecture doubt Q&A
│   └── voice_engine.py      # Local offline 16kHz WAV speech-to-text transcriber
├── frontend/
│   ├── index.html           # Single-page application, Auth/CAPTCHA modal & AI Chatbot drawer
│   ├── styles.css           # Custom styling, animations & focus states
│   ├── offline.css          # Instant offline base layout & color utilities
│   ├── visualizers.js       # 8 interactive 60fps HTML5 Canvas physics simulation labs
│   ├── aria_lecture.js      # Prof. Aria step-by-step smart-board lecture & pause/resume engine
│   └── app.js               # State client, BKT tutor, SVG graph, SM-2, teacher CSV & voice input
└── tests/
    └── test_suite.py        # Automated end-to-end HTTP & learner-model test suite
