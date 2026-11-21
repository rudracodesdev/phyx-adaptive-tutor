from typing import Dict, Any, Optional
from syllabus_graph import CONCEPT_MAP


def answer_user_query(query: str, student_state: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Personal GenAI Assistant & Voice Intent Router.
    Solves:
      1) Instant website navigation & troubleshooting queries
      2) Personalized learner-model progress & weakness diagnostics
      3) Class 10 Physics conceptual study doubts (Light, Electricity, Magnetism)
    """
    q = (query or "").strip()
    q_low = q.lower()

    # 1. Website Navigation & Action Intents (for Voice & Chat commands)
    if any(k in q_low for k in ["live class", "zoom", "ai teacher", "video class", "classroom"]):
        return {
            "reply": "Opening the AI Teacher Live Video Classroom (Zoom Studio). You can toggle your mic/camera, draw on the live physics whiteboard, raise your hand, or ask Prof. Aria to lecture on any Class 10 Physics topic.",
            "action": {"type": "switch_tab", "tab": "classroom"},
            "category": "website-navigation",
        }
    if any(k in q_low for k in ["visualizer", "simulation", "ray diagram", "circuit lab", "visualize"]):
        return {
            "reply": "Opening the Interactive Physics Visualizer! Free users have full access to the Ray Optics Lab and Ohm's Law Circuit Lab; logging in unlocks Refraction/TIR and Fleming's Lorentz Force labs.",
            "action": {"type": "switch_tab", "tab": "visualizer"},
            "category": "website-navigation",
        }
    if any(k in q_low for k in ["how does it work", "how it works", "architecture", "bkt formula", "explain system"]):
        return {
            "reply": "Opening the 'How Does It Work?' architectural breakdown—covering Diagnostic Calibration, Prerequisite DAG propagation, Bayesian Knowledge Tracing (BKT), Reasoning NLP, and SM-2 Spaced Repetition.",
            "action": {"type": "switch_tab", "tab": "how"},
            "category": "website-navigation",
        }
    if any(k in q_low for k in ["teacher dashboard", "class gap", "cohort", "roster"]):
        return {
            "reply": "Switching to the Teacher Cohort Dashboard showing class-wide concept bottlenecks, top reasoning misconceptions, and student intervention alerts.",
            "action": {"type": "switch_tab", "tab": "teacher"},
            "category": "website-navigation",
        }
    if any(k in q_low for k in ["concept graph", "spaced repetition", "sm-2", "sm2", "schedule"]):
        return {
            "reply": "Opening the Class 10 Physics Prerequisite Concept Graph & SM-2 Spaced-Repetition Schedule.",
            "action": {"type": "switch_tab", "tab": "graph"},
            "category": "website-navigation",
        }
    if any(k in q_low for k in ["login", "sign up", "signup", "register", "captcha", "unlock"]):
        return {
            "reply": "Opening the Secure Login / Sign-Up & CAPTCHA Verification portal. You can create a new account or click '1-Click Demo Student' to unlock all 4 interactive Physics visualizers immediately.",
            "action": {"type": "open_auth"},
            "category": "website-support",
        }
    if any(k in q_low for k in ["simulate 24", "fast forward", "advance clock", "+24"]):
        return {
            "reply": "Advancing the spaced-repetition review clock by +24 hours so due concepts trigger immediately.",
            "action": {"type": "simulate_time", "hours": 24},
            "category": "website-action",
        }
    if any(k in q_low for k in ["reset progress", "reset demo", "restart diagnostic"]):
        return {
            "reply": "Resetting your learner profile and reopening the 5-question Class 10 Physics Diagnostic Placement Test.",
            "action": {"type": "reset_demo"},
            "category": "website-action",
        }

    # 2. Website Troubleshooting / FAQ
    if any(k in q_low for k in ["lock", "locked", "free access", "premium", "pro"]):
        return {
            "reply": "Free Guest Access includes the Adaptive Tutor, Concept Graph, Live AI Classroom, and 2 Interactive Visualizers (Ray Optics & Ohm's Law Circuits). Sign up or use 1-Click Demo Login (with CAPTCHA verification) to unlock the Refraction/TIR and Solenoid/Fleming Force labs.",
            "action": None,
            "category": "website-support",
        }
    if any(k in q_low for k in ["camera", "mic", "microphone", "voice", "not working", "error"]):
        return {
            "reply": "Troubleshooting tip: Make sure your browser allows microphone/camera access on localhost. If a webcam isn't attached, PhysicsMind automatically renders a simulated HD student tile and lets you type or speak queries seamlessly.",
            "action": None,
            "category": "website-support",
        }

    # 3. Personalized Learner State Queries
    if student_state and any(k in q_low for k in ["weak", "weakest", "my mastery", "my progress", "misconception", "study next", "recommend"]):
        concepts = student_state.get("concepts", {})
        if concepts:
            weakest_id = min(concepts.keys(), key=lambda k: concepts[k]["mastery"])
            w_node = CONCEPT_MAP[weakest_id]
            w_pct = round(concepts[weakest_id]["mastery"] * 100)
            active_miscs = []
            for cid, cdata in concepts.items():
                for m in cdata.get("misconceptions", []):
                    if not m.get("resolved", False):
                        active_miscs.append(f"{cid}: {m['label']}")
            misc_summary = (
                f"Active misconceptions flagged: {'; '.join(active_miscs[:2])}."
                if active_miscs
                else "No unresolved misconceptions right now!"
            )
            return {
                "reply": f"Your weakest concept right now is {weakest_id} ({w_node['name']}) at {w_pct}% mastery. Key formula: {w_node['formula']}. {misc_summary} Switching you to targeted practice now.",
                "action": {"type": "practice_concept", "concept_id": weakest_id},
                "category": "learner-insight",
            }

    # 4. Class 10 Physics Study Doubts
    physics_kb = [
        (
            ["sign convention", "mirror formula", "concave", "convex mirror", "1/f"],
            "New Cartesian Sign Convention for Mirrors: (1) Object distance u is ALWAYS negative (-u). (2) Concave mirror focal length f is NEGATIVE (-f); Convex mirror f is POSITIVE (+f). (3) Mirror formula: 1/f = 1/v + 1/u, and magnification m = -v/u (negative m = real & inverted; positive m = virtual & erect).",
        ),
        (
            ["lens formula", "dioptre", "power of lens", "convex lens", "concave lens"],
            "Lens Formula & Power: 1/f = 1/v - 1/u (note the minus sign, unlike mirrors!). Magnification m = +v/u. Optical power P = 1 / f(in meters) measured in Dioptres (D). Convex lens has +f and +P; Concave lens has -f and -P.",
        ),
        (
            ["snell", "refraction", "refractive index", "total internal reflection", "critical angle"],
            "Snell's Law & Refraction: n₁·sin(i) = n₂·sin(r), where n = c/v. When light enters an optically denser medium (higher n), it slows down and bends TOWARDS the normal. Total Internal Reflection occurs only when light travels from denser to rarer medium at i > critical angle θc.",
        ),
        (
            ["ohm", "resistivity", "stretch", "resistance", "rho"],
            "Ohm's Law & Resistivity: V = I·R (for ohmic conductors at constant temperature, R is constant even if V changes). Resistance R = ρL/A. If a wire is stretched to n times its length at constant volume, area becomes A/n, so new resistance becomes n²·R!",
        ),
        (
            ["series", "parallel", "equivalent resistance", "resistor"],
            "Series vs Parallel Circuits: In Series, current I is identical through all resistors and R_eq = R₁ + R₂ + ... In Parallel, voltage V is identical across all branches and 1/R_eq = 1/R₁ + 1/R₂ + ... (so R_eq is always smaller than the smallest individual resistor).",
        ),
        (
            ["power", "joule", "bulb", "kwh", "heating"],
            "Electric Power & Joule Heating: H = I²Rt. Power P = VI = I²R = V²/R. Pro tip: For bulbs connected in PARALLEL across fixed mains voltage V, use P = V²/R—the higher wattage bulb has LOWER resistance and glows brighter! In SERIES, current I is same, so use P = I²R.",
        ),
        (
            ["fleming", "left hand", "right hand", "solenoid", "magnetic", "lorentz"],
            "Magnetism Rules: (1) Maxwell's Right-Hand Thumb Rule gives magnetic field direction around a current-carrying wire (thumb = current, fingers = field). (2) Fleming's Left-Hand Rule gives motor force direction: Forefinger = Field, Middle finger = Current, Thumb = Force (Motion). Inside a long solenoid, field lines are parallel and uniform.",
        ),
    ]

    for keywords, explanation in physics_kb:
        if any(kw in q_low for kw in keywords):
            return {
                "reply": explanation,
                "action": None,
                "category": "physics-tutor",
            }

    for cid, node in CONCEPT_MAP.items():
        if cid.lower() in q_low or node["name"].lower() in q_low:
            return {
                "reply": f"{cid} — {node['name']} ({node['unit']}): {node['description']} Key Formula: {node['formula']}. Common pitfall to avoid: {node['common_misconceptions'][0]}.",
                "action": None,
                "category": "physics-tutor",
            }

    return {
        "reply": (
            f"I heard: \"{q}\". I can help you with:\n"
            "• Class 10 Physics Doubts (e.g., 'Explain mirror sign convention', 'Why does stretching a wire 2x quadruple resistance?', 'Fleming left hand rule')\n"
            "• Your Learner Model (e.g., 'What is my weakest topic?')\n"
            "• Website Navigation & Tools (e.g., 'Open live class', 'Open visualizer', 'How does it work?', 'Show teacher dashboard')."
        ),
        "action": None,
        "category": "general-help",
    }