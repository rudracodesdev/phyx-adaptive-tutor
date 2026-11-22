import json
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional
from syllabus_graph import CONCEPT_NODES, CONCEPT_MAP
from security import hash_password

STATE_FILE = os.path.join(os.path.dirname(__file__), "learner_state.json")

# Bayesian Knowledge Tracing (BKT) parameters
P_TRANSIT = 0.22
P_SLIP = 0.10
P_GUESS = 0.20


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _create_default_concept_state(initial_mastery: float = 0.25) -> Dict[str, Any]:
    return {
        "mastery": round(initial_mastery, 3),
        "attempts": 0,
        "correct": 0,
        "streak": 0,
        "ef": 2.5,
        "interval_days": 0.0,
        "repetitions": 0,
        "next_review_at": _now_utc().isoformat(),
        "misconceptions": [],
    }


def _seed_state() -> Dict[str, Any]:
    pw_hash, pw_salt = hash_password("Physics@123")
    users: Dict[str, Any] = {
        "student@physicsmind.edu": {
            "id": "student_1",
            "email": "student@physicsmind.edu",
            "name": "Aarav Sharma",
            "role": "student",
            "plan": "pro",
            "password_hash": pw_hash,
            "password_salt": pw_salt,
        },
        "teacher@physicsmind.edu": {
            "id": "teacher_1",
            "email": "teacher@physicsmind.edu",
            "name": "Dr. Kavita Rao",
            "role": "teacher",
            "plan": "pro",
            "password_hash": pw_hash,
            "password_salt": pw_salt,
        },
    }

    students: Dict[str, Any] = {
        "student_1": {
            "id": "student_1",
            "name": "Aarav Sharma (You)",
            "diagnostic_completed": False,
            "sim_offset_hours": 0,
            "concepts": {c["id"]: _create_default_concept_state(0.25) for c in CONCEPT_NODES},
            "history": [],
        }
    }

    cohort_profiles = [
        (
            "stu_ananya",
            "Ananya Verma",
            {"P1": 0.88, "P2": 0.42, "P3": 0.79, "P4": 0.35, "P11": 0.40, "P12": 0.75, "P5": 0.91, "P6": 0.76, "P7": 0.38, "P8": 0.44, "P9": 0.82, "P10": 0.51, "P13": 0.62},
            [
                {"concept_id": "P2", "label": "Sign convention error: took concave mirror f as positive", "reasoning": "Since concave mirror is converging, focal length is positive."},
                {"concept_id": "P7", "label": "Added parallel resistances directly (R1 + R2) instead of reciprocals", "reasoning": "Total resistance in parallel is R1 + R2."},
            ],
        ),
        (
            "stu_rohan",
            "Rohan Das",
            {"P1": 0.92, "P2": 0.81, "P3": 0.85, "P4": 0.74, "P11": 0.78, "P12": 0.83, "P5": 0.72, "P6": 0.45, "P7": 0.31, "P8": 0.29, "P9": 0.64, "P10": 0.40, "P13": 0.37},
            [
                {"concept_id": "P7", "label": "Added parallel resistances directly (R1 + R2) instead of reciprocals", "reasoning": "Parallel resistors add up directly to give higher resistance."},
                {"concept_id": "P8", "label": "Used P = I²R instead of P = V²/R for parallel bulbs", "reasoning": "Higher resistance means more power dissipated even in parallel."},
            ],
        ),
        (
            "stu_meera",
            "Meera Nair",
            {"P1": 0.95, "P2": 0.89, "P3": 0.91, "P4": 0.84, "P11": 0.86, "P12": 0.90, "P5": 0.93, "P6": 0.88, "P7": 0.82, "P8": 0.79, "P9": 0.52, "P10": 0.39, "P13": 0.81},
            [
                {"concept_id": "P10", "label": "Confused Fleming's Left-Hand Rule with Right-Hand Thumb Rule", "reasoning": "Thumb points in current direction so fingers curl towards force."},
            ],
        ),
        (
            "stu_kabir",
            "Kabir Patel",
            {"P1": 0.68, "P2": 0.34, "P3": 0.51, "P4": 0.28, "P11": 0.32, "P12": 0.54, "P5": 0.65, "P6": 0.49, "P7": 0.33, "P8": 0.30, "P9": 0.58, "P10": 0.36, "P13": 0.48},
            [
                {"concept_id": "P2", "label": "Sign convention error: took concave mirror f as positive", "reasoning": "Object distance is negative but focal length is always positive."},
                {"concept_id": "P4", "label": "Used mirror formula (+1/u) instead of lens formula (-1/u)", "reasoning": "1/f = 1/v + 1/u works for both lenses and mirrors."},
            ],
        ),
        (
            "stu_diya",
            "Diya Sen",
            {"P1": 0.85, "P2": 0.73, "P3": 0.77, "P4": 0.66, "P11": 0.69, "P12": 0.80, "P5": 0.89, "P6": 0.83, "P7": 0.47, "P8": 0.55, "P9": 0.79, "P10": 0.61, "P13": 0.74},
            [
                {"concept_id": "P5", "label": "Assumed current is consumed across resistors", "reasoning": "The first resistor uses up half the current before it reaches the second."},
            ],
        ),
    ]

    for sid, name, masteries, miscs in cohort_profiles:
        concepts = {}
        for cid, m in masteries.items():
            cstate = _create_default_concept_state(m)
            cstate["attempts"] = 4
            cstate["correct"] = int(round(m * 4))
            concepts[cid] = cstate
        for item in miscs:
            concepts[item["concept_id"]]["misconceptions"].append(
                {
                    "label": item["label"],
                    "student_reasoning": item["reasoning"],
                    "timestamp": _now_utc().isoformat(),
                    "resolved": False,
                }
            )
        students[sid] = {
            "id": sid,
            "name": name,
            "diagnostic_completed": True,
            "sim_offset_hours": 0,
            "concepts": concepts,
            "history": [],
        }

    return {"users": users, "students": students}


class LearnerModelStore:
    def __init__(self, path: str = STATE_FILE):
        self.path = path
        try:
            test_probe = f"{self.path}.probe"
            with open(test_probe, "w", encoding="utf-8") as f:
                f.write("ok")
            os.remove(test_probe)
        except OSError:
            self.path = "/tmp/phyx_learner_state.json" 
        self.data = self._load()

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    if "users" not in loaded:
                        seeded = _seed_state()
                        loaded["users"] = seeded["users"]
                    for s in loaded.get("students", {}).values():
                        for c in CONCEPT_NODES:
                            if c["id"] not in s.get("concepts", {}):
                                s["concepts"][c["id"]] = _create_default_concept_state(0.25)
                    return loaded
            except Exception:
                pass
        seeded = _seed_state()
        self._save(seeded)
        return seeded

    def _save(self, data: Optional[Dict[str, Any]] = None) -> None:
        target = data if data is not None else self.data
        try:
            tmp_path = f"{self.path}.tmp"
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(target, f, indent=2)
            os.replace(tmp_path, self.path)
        except OSError:
            fallback_path = "/tmp/phyx_learner_state.json"
            try:
                with open(fallback_path, "w", encoding="utf-8") as f:
                    json.dump(target, f, indent=2)
            except OSError:
                pass

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self.data["users"].get(email.strip().lower())

    def register_user(self, name: str, email: str, password: str, role: str = "student") -> Dict[str, Any]:
        clean_email = email.strip().lower()
        if clean_email in self.data["users"]:
            raise ValueError("An account with this email already exists.")
        pw_hash, pw_salt = hash_password(password)
        user_id = f"usr_{os.urandom(4).hex()}"
        user_rec = {
            "id": user_id,
            "email": clean_email,
            "name": name.strip(),
            "role": role if role in ("student", "teacher") else "student",
            "plan": "pro",
            "password_hash": pw_hash,
            "password_salt": pw_salt,
        }
        self.data["users"][clean_email] = user_rec
        if user_rec["role"] == "student":
            self.data["students"][user_id] = {
                "id": user_id,
                "name": user_rec["name"],
                "diagnostic_completed": False,
                "sim_offset_hours": 0,
                "concepts": {c["id"]: _create_default_concept_state(0.25) for c in CONCEPT_NODES},
                "history": [],
            }
        self._save()
        return user_rec

    def get_student(self, student_id: str) -> Dict[str, Any]:
        if student_id not in self.data["students"]:
            self.data["students"][student_id] = {
                "id": student_id,
                "name": "Guest Learner" if student_id == "guest" else f"Student ({student_id})",
                "diagnostic_completed": False,
                "sim_offset_hours": 0,
                "concepts": {c["id"]: _create_default_concept_state(0.25) for c in CONCEPT_NODES},
                "history": [],
            }
            self._save()
        return self.data["students"][student_id]

    def reset_student(self, student_id: str) -> Dict[str, Any]:
        name = self.get_student(student_id)["name"]
        self.data["students"][student_id] = {
            "id": student_id,
            "name": name,
            "diagnostic_completed": False,
            "sim_offset_hours": 0,
            "concepts": {c["id"]: _create_default_concept_state(0.25) for c in CONCEPT_NODES},
            "history": [],
        }
        self._save()
        return self.data["students"][student_id]

    def advance_time(self, student_id: str, hours: int) -> Dict[str, Any]:
        student = self.get_student(student_id)
        student["sim_offset_hours"] = student.get("sim_offset_hours", 0) + hours
        self._save()
        return student

    def get_effective_now(self, student: Dict[str, Any]) -> datetime:
        return _now_utc() + timedelta(hours=student.get("sim_offset_hours", 0))

    def get_due_concepts(self, student_id: str) -> List[str]:
        student = self.get_student(student_id)
        eff_now = self.get_effective_now(student)
        due = []
        for cid, cstate in student["concepts"].items():
            if cstate["attempts"] > 0:
                due_dt = datetime.fromisoformat(cstate["next_review_at"])
                if eff_now >= due_dt:
                    due.append(cid)
        return due

    def update_mastery(
        self,
        student_id: str,
        concept_id: str,
        is_correct: bool,
        reasoning_flawed: bool = False,
        misconception_label: Optional[str] = None,
        student_reasoning: str = "",
        question_prompt: str = "",
        difficulty: str = "medium",
    ) -> Dict[str, Any]:
        student = self.get_student(student_id)
        cstate = student["concepts"][concept_id]
        prior = cstate["mastery"]

        effective_correct = is_correct and not reasoning_flawed

        # Calibrate BKT Slip & Guess probabilities by question difficulty
        diff_slip = 0.06 if difficulty == "easy" else (0.14 if difficulty == "hard" else P_SLIP)
        diff_guess = 0.25 if difficulty == "easy" else (0.12 if difficulty == "hard" else P_GUESS)

        if effective_correct:
            num = prior * (1.0 - diff_slip)
            den = num + (1.0 - prior) * diff_guess
        else:
            num = prior * diff_slip
            den = num + (1.0 - prior) * (1.0 - diff_guess)

        posterior = num / den if den > 0 else prior

        if effective_correct:
            updated = posterior + (1.0 - posterior) * P_TRANSIT
        else:
            penalty_factor = 0.04 if reasoning_flawed else 0.08
            updated = max(0.05, posterior + (1.0 - posterior) * penalty_factor)

        updated = round(min(0.99, max(0.05, updated)), 3)
        cstate["mastery"] = updated
        cstate["attempts"] += 1
        if is_correct:
            cstate["correct"] += 1
        cstate["streak"] = (cstate["streak"] + 1) if effective_correct else 0

        # Prerequisite graph belief propagation
        node = CONCEPT_MAP[concept_id]
        if effective_correct:
            for prereq_id in node["prereqs"]:
                p_state = student["concepts"][prereq_id]
                p_state["mastery"] = round(min(0.99, p_state["mastery"] + 0.04 * (1.0 - p_state["mastery"])), 3)
        else:
            for other in CONCEPT_NODES:
                if concept_id in other["prereqs"]:
                    d_state = student["concepts"][other["id"]]
                    d_state["mastery"] = round(max(0.05, d_state["mastery"] - 0.03 * d_state["mastery"]), 3)

        if reasoning_flawed and misconception_label:
            cstate["misconceptions"].append(
                {
                    "label": misconception_label,
                    "student_reasoning": student_reasoning,
                    "timestamp": self.get_effective_now(student).isoformat(),
                    "resolved": False,
                }
            )
        elif effective_correct:
            for m in cstate["misconceptions"]:
                m["resolved"] = True

        # SM-2 Spaced-Repetition Scheduling
        quality = 5 if (is_correct and not reasoning_flawed) else (3 if is_correct else 1)
        ef = cstate["ef"]
        reps = cstate["repetitions"]

        if quality >= 3:
            if reps == 0:
                interval = 1.0
            elif reps == 1:
                interval = 3.0
            else:
                interval = round(cstate["interval_days"] * ef, 1)
            reps += 1
        else:
            reps = 0
            interval = 0.5

        ef = max(1.3, round(ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)), 2))
        cstate["ef"] = ef
        cstate["repetitions"] = reps
        cstate["interval_days"] = interval
        eff_now = self.get_effective_now(student)
        cstate["next_review_at"] = (eff_now + timedelta(days=interval)).isoformat()

        student["history"].insert(
            0,
            {
                "timestamp": eff_now.isoformat(),
                "concept_id": concept_id,
                "concept_name": node["name"],
                "prompt": question_prompt,
                "is_correct": is_correct,
                "reasoning_flawed": reasoning_flawed,
                "misconception_label": misconception_label,
                "student_reasoning": student_reasoning,
                "mastery_before": prior,
                "mastery_after": updated,
            },
        )
        student["history"] = student["history"][:30]

        self._save()
        return {
            "mastery_before": prior,
            "mastery_after": updated,
            "next_review_days": interval,
            "ef": ef,
        }

    def select_next_target_concept(self, student_id: str) -> Dict[str, Any]:
        student = self.get_student(student_id)
        concepts = student["concepts"]
        due_ids = set(self.get_due_concepts(student_id))

        candidates = []
        for node in CONCEPT_NODES:
            cid = node["id"]
            cstate = concepts[cid]
            mastery = cstate["mastery"]
            prereqs_met = all(concepts[p]["mastery"] >= 0.55 for p in node["prereqs"])
            has_unresolved_misc = any(not m.get("resolved", False) for m in cstate["misconceptions"])
            is_due = cid in due_ids

            priority = (1.0 - mastery) * 100
            if is_due:
                priority += 35
            if has_unresolved_misc:
                priority += 25
            if not prereqs_met:
                priority -= 40

            candidates.append((priority, cid, is_due, has_unresolved_misc))

        candidates.sort(key=lambda x: x[0], reverse=True)
        _, best_cid, is_due, has_unresolved_misc = candidates[0]
        best_mastery = concepts[best_cid]["mastery"]

        if best_mastery < 0.45:
            difficulty = "easy"
        elif best_mastery < 0.75:
            difficulty = "medium"
        else:
            difficulty = "hard"

        active_misc = next(
            (m["label"] for m in reversed(concepts[best_cid]["misconceptions"]) if not m.get("resolved", False)),
            None,
        )

        reasons = []
        if is_due:
            reasons.append("SM-2 Spaced Review Due")
        if has_unresolved_misc:
            reasons.append("Active Misconception Remediation")
        if not reasons:
            reasons.append(f"Weakest Ready Concept ({round(best_mastery * 100)}% mastery)")

        return {
            "concept_id": best_cid,
            "difficulty": difficulty,
            "is_spaced_repetition_due": is_due,
            "target_misconception": active_misc,
            "current_mastery": best_mastery,
            "selection_reason": " + ".join(reasons),
        }

    def get_teacher_dashboard(self) -> Dict[str, Any]:
        students = [s for sid, s in self.data["students"].items() if sid != "guest"]
        if not students:
            students = list(self.data["students"].values())
        total_students = len(students)

        concept_gaps = []
        for node in CONCEPT_NODES:
            cid = node["id"]
            scores = [s["concepts"][cid]["mastery"] for s in students]
            avg_m = round(sum(scores) / total_students, 3)
            struggling = sum(1 for sc in scores if sc < 0.60)
            concept_gaps.append(
                {
                    "concept_id": cid,
                    "unit": node["unit"],
                    "name": node["name"],
                    "avg_mastery": avg_m,
                    "struggling_count": struggling,
                    "total_students": total_students,
                }
            )
        concept_gaps.sort(key=lambda x: x["avg_mastery"])

        misc_counter: Dict[str, Dict[str, Any]] = {}
        for s in students:
            for cid, cstate in s["concepts"].items():
                for m in cstate["misconceptions"]:
                    if m.get("resolved", False):
                        continue
                    key = m["label"]
                    if key not in misc_counter:
                        misc_counter[key] = {
                            "label": key,
                            "concept_id": cid,
                            "concept_name": CONCEPT_MAP[cid]["name"],
                            "count": 0,
                            "students": [],
                            "sample_reasoning": m["student_reasoning"],
                        }
                    if s["name"] not in misc_counter[key]["students"]:
                        misc_counter[key]["count"] += 1
                        misc_counter[key]["students"].append(s["name"])

        top_misconceptions = sorted(misc_counter.values(), key=lambda x: x["count"], reverse=True)

        roster = []
        for s in students:
            c_items = list(s["concepts"].items())
            avg_student = round(sum(v["mastery"] for _, v in c_items) / len(c_items), 3)
            weakest_cid, weakest_val = min(c_items, key=lambda x: x[1]["mastery"])
            unresolved_count = sum(
                sum(1 for m in v["misconceptions"] if not m.get("resolved", False))
                for _, v in c_items
            )
            roster.append(
                {
                    "id": s["id"],
                    "name": s["name"],
                    "avg_mastery": avg_student,
                    "weakest_concept": f"{weakest_cid}: {CONCEPT_MAP[weakest_cid]['name']}",
                    "weakest_score": weakest_val["mastery"],
                    "active_misconceptions": unresolved_count,
                }
            )
        roster.sort(key=lambda x: x["avg_mastery"])

        unit_summary = []
        for unit_name in ["Light", "Human Eye", "Electricity", "Magnetism"]:
            unit_items = [g for g in concept_gaps if g["unit"] == unit_name]
            unit_avg = round(sum(u["avg_mastery"] for u in unit_items) / len(unit_items), 3) if unit_items else 0.0
            weakest_in_unit = min(unit_items, key=lambda x: x["avg_mastery"]) if unit_items else None
            unit_summary.append(
                {
                    "unit": unit_name,
                    "avg_mastery": unit_avg,
                    "bottleneck_concept": f"{weakest_in_unit['concept_id']}: {weakest_in_unit['name']}" if weakest_in_unit else "",
                }
            )

        return {
            "total_students": total_students,
            "unit_summary": unit_summary,
            "concept_gaps": concept_gaps,
            "top_misconceptions": top_misconceptions,
            "roster": roster,
        }