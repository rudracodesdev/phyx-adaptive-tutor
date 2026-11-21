import random
import uuid
from typing import Dict, Any, Optional, Tuple, List
from syllabus_graph import CONCEPT_MAP

SUBJECTIVE_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {
    "P1": [
        {
            "difficulty": "easy",
            "prompt": "[Subjective Numerical] A ray of light strikes a plane mirror making an angle of 35° with the mirror surface. Calculate the angle of reflection and state the law used.",
            "expected_keywords": ["55", "normal"],
            "model_solution": "1) Angle of incidence ∠i = 90° - 35° = 55° (measured from the normal).\n2) By the First Law of Reflection, angle of reflection ∠r = ∠i = 55°.",
        },
        {
            "difficulty": "medium",
            "prompt": "[Subjective Reasoning] You walk towards a plane mirror at 1.5 m/s. Derive the speed at which your image approaches you and state two properties of the image.",
            "expected_keywords": ["3", "virtual"],
            "model_solution": "1) As you move 1.5 m/s towards the mirror, your virtual image also moves 1.5 m/s towards the mirror, so relative approach speed = 1.5 + 1.5 = 3.0 m/s.\n2) Image is virtual, erect, same size, and laterally inverted.",
        },
    ],
    "P2": [
        {
            "difficulty": "medium",
            "prompt": "[Subjective Numerical] An object is placed 30 cm in front of a concave mirror of focal length 15 cm. Using New Cartesian Sign Convention and the mirror formula, calculate image distance (v) and magnification (m).",
            "expected_keywords": ["-30", "-1"],
            "model_solution": "1) Given: u = -30 cm, f = -15 cm.\n2) 1/f = 1/v + 1/u => 1/v = 1/(-15) - 1/(-30) = -1/30 => v = -30 cm.\n3) Magnification m = -v/u = -(-30)/(-30) = -1 (real, inverted, same size).",
        },
    ],
    "P3": [
        {
            "difficulty": "medium",
            "prompt": "[Subjective Numerical] Light enters from air (n = 1.0) into glass of refractive index 1.50. Calculate the speed of light in glass (c = 3.0 × 10⁸ m/s) and state how the ray bends.",
            "expected_keywords": ["2", "towards"],
            "model_solution": "1) Using n = c / v => v = (3.0 × 10⁸) / 1.50 = 2.0 × 10⁸ m/s.\n2) Since glass is optically denser than air, light slows down and bends towards the normal.",
        },
    ],
    "P4": [
        {
            "difficulty": "medium",
            "prompt": "[Subjective Numerical] An optometrist prescribes a corrective lens of power -2.5 D. Calculate its focal length in centimeters and identify the type of lens.",
            "expected_keywords": ["-40", "concave"],
            "model_solution": "1) P = 1 / f(m) => f = 1 / (-2.5) = -0.40 m = -40 cm.\n2) Negative focal length indicates a diverging concave lens.",
        },
    ],
    "P5": [
        {
            "difficulty": "easy",
            "prompt": "[Subjective Numerical] A steady current of 0.5 A flows through a filament for 10 minutes. Calculate the total electric charge passing through the circuit.",
            "expected_keywords": ["300", "600"],
            "model_solution": "1) Convert time to seconds: t = 10 × 60 = 600 s.\n2) Charge Q = I × t = 0.5 A × 600 s = 300 C.",
        },
    ],
    "P6": [
        {
            "difficulty": "hard",
            "prompt": "[Subjective Derivation] A copper wire of resistance 4 Ω is stretched uniformly to double its original length while keeping volume constant. Derive and calculate its new resistance.",
            "expected_keywords": ["16", "area"],
            "model_solution": "1) At constant volume (A·L = A'·L'), doubling length (L' = 2L) halves cross-sectional area (A' = A/2).\n2) R' = ρ(2L)/(A/2) = 4(ρL/A) = 4 × 4 Ω = 16 Ω.",
        },
    ],
    "P7": [
        {
            "difficulty": "medium",
            "prompt": "[Subjective Numerical] Two resistors of 6 Ω and 3 Ω are connected in parallel across a 6 V battery. Calculate equivalent resistance and total current drawn.",
            "expected_keywords": ["2", "3"],
            "model_solution": "1) 1/R_eq = 1/6 + 1/3 = 3/6 => R_eq = 2 Ω.\n2) Total current I = V / R_eq = 6 V / 2 Ω = 3 A.",
        },
    ],
    "P8": [
        {
            "difficulty": "hard",
            "prompt": "[Subjective Reasoning] Two bulbs rated (100 W, 220 V) and (60 W, 220 V) are connected in parallel to a 220 V mains supply. Prove with formula which bulb glows brighter.",
            "expected_keywords": ["100", "v"],
            "model_solution": "1) In parallel, potential difference V = 220 V is identical across both bulbs.\n2) Using P = V²/R, the 100 W bulb has lower resistance (484 Ω vs 806.7 Ω), draws more current, and glows brighter.",
        },
    ],
    "P9": [
        {
            "difficulty": "easy",
            "prompt": "[Subjective Concept] State Maxwell's Right-Hand Thumb Rule and describe the pattern of magnetic field lines inside a long current-carrying solenoid.",
            "expected_keywords": ["thumb", "uniform"],
            "model_solution": "1) Right-Hand Thumb Rule: Point right thumb in conventional current direction; curled fingers show circular magnetic field direction.\n2) Inside a long solenoid, field lines are parallel and equidistant, indicating a uniform magnetic field.",
        },
    ],
    "P10": [
        {
            "difficulty": "hard",
            "prompt": "[Subjective Reasoning] An electron moves from left to right into a uniform magnetic field directed into the page. Apply Fleming's Left-Hand Rule to find the force direction.",
            "expected_keywords": ["down", "opposite"],
            "model_solution": "1) Conventional current flows opposite to electron motion (right to left).\n2) By Fleming's Left-Hand Rule (Forefinger into page, Middle finger left), Thumb points downwards.",
        },
    ],
    "P11": [
        {
            "difficulty": "medium",
            "prompt": "[Subjective Numerical] A myopic eye has a far point of 80 cm in front of the eye. Calculate the focal length and power of the corrective lens required to view distant objects clearly.",
            "expected_keywords": ["-80", "-1.25"],
            "model_solution": "1) For distant object (u = -∞) imaged at far point v = -80 cm: 1/f = 1/(-80) - 0 => f = -80 cm = -0.80 m.\n2) Power P = 1 / (-0.80) = -1.25 D (Concave lens).",
        },
    ],
    "P12": [
        {
            "difficulty": "medium",
            "prompt": "[Subjective Reasoning] Explain why white light splits into seven colors through a glass prism and why the clear sky appears blue.",
            "expected_keywords": ["wavelength", "scatter"],
            "model_solution": "1) Different colors travel at different speeds in glass; violet (shortest wavelength) bends most and red (longest) bends least.\n2) Fine air molecules scatter shorter blue wavelengths strongly (∝ 1/λ⁴) into our eyes.",
        },
    ],
    "P13": [
        {
            "difficulty": "medium",
            "prompt": "[Subjective Numerical & Safety] An electric geyser rated 2.2 kW, 220 V is connected to a domestic circuit fitted with a 5 A fuse. Calculate the current drawn and state what happens.",
            "expected_keywords": ["10", "melt"],
            "model_solution": "1) Current drawn I = P / V = 2200 W / 220 V = 10 A.\n2) Since 10 A exceeds the 5 A fuse rating, the fuse wire melts due to Joule heating and safely breaks the live circuit.",
        },
    ],
}


def _parametric_mcq(concept_id: str, difficulty: str) -> Tuple[str, List[str], str]:
    if concept_id == "P1":
        glancing = random.choice([20, 25, 30, 35, 40])
        correct = f"{90 - glancing}°"
        return (
            f"A ray of light strikes a plane mirror making an angle of {glancing}° with the mirror surface. What is the angle of reflection?",
            [correct, f"{glancing}°", f"{2 * glancing}°", "90°"],
            correct,
        )
    if concept_id == "P2":
        f_val = random.choice([10, 12, 15, 20])
        u_val = f_val * 2
        correct = f"v = -{u_val} cm (real, inverted, same size)"
        return (
            f"An object is placed {u_val} cm in front of a concave mirror of focal length {f_val} cm. Where is the image formed (New Cartesian Sign Convention)?",
            [correct, f"v = +{u_val} cm (virtual, behind mirror)", f"v = -{f_val} cm (at focus)", f"v = -{round(u_val / 3, 1)} cm"],
            correct,
        )
    if concept_id == "P3":
        n_med = random.choice([1.5, 2.0, 2.4])
        v_med = round(3.0 / n_med, 2)
        correct = f"{v_med} × 10⁸ m/s"
        return (
            f"The refractive index of a transparent medium is {n_med}. What is the speed of light in this medium (c = 3.0 × 10⁸ m/s)?",
            [correct, f"{round(3.0 * n_med, 2)} × 10⁸ m/s", f"{round(n_med / 3.0, 2)} × 10⁸ m/s", "3.0 × 10⁸ m/s"],
            correct,
        )
    if concept_id == "P4":
        p_val = random.choice([-2.0, -2.5, -4.0, -5.0])
        f_cm = int(round(100 / p_val))
        correct = f"{f_cm} cm (Concave lens)"
        return (
            f"An optometrist prescribes a corrective lens of power {p_val} D. What is the focal length and nature of the lens?",
            [correct, f"+{abs(f_cm)} cm (Convex lens)", f"{p_val} cm (Concave lens)", f"+{abs(p_val)} m (Convex lens)"],
            correct,
        )
    if concept_id == "P5":
        curr = random.choice([0.5, 1.5, 2.0])
        mins = random.choice([5, 10])
        q_c = int(curr * mins * 60)
        correct = f"{q_c} C"
        return (
            f"A steady current of {curr} A flows through a conductor for {mins} minutes. How much electric charge flows through any cross-section?",
            [correct, f"{round(curr * mins, 1)} C", f"{int((mins * 60) / curr)} C", f"{q_c * 10} C"],
            correct,
        )
    if concept_id == "P6":
        r_orig = random.choice([3, 4, 5, 6])
        correct = f"{r_orig * 4} Ω"
        return (
            f"A metallic wire of resistance {r_orig} Ω is stretched uniformly to double its original length (keeping volume constant). What is its new resistance?",
            [correct, f"{r_orig * 2} Ω", f"{r_orig} Ω", f"{round(r_orig / 2, 1)} Ω"],
            correct,
        )
    if concept_id == "P7":
        r1, r2, v_bat = random.choice([(6, 3, 6), (12, 4, 12), (10, 10, 15)])
        r_eq = (r1 * r2) / (r1 + r2)
        i_tot = round(v_bat / r_eq, 2)
        correct = f"{i_tot} A"
        return (
            f"Two resistors of {r1} Ω and {r2} Ω are connected in parallel across a {v_bat} V battery. What is the total current drawn?",
            [correct, f"{round(v_bat / (r1 + r2), 2)} A", f"{round(r_eq, 2)} A", f"{round(v_bat / r1, 2)} A"],
            correct,
        )
    if concept_id == "P8":
        correct = "100 W bulb, because P = V²/R at fixed voltage and it has lower resistance"
        return (
            "Two bulbs rated (100 W, 220 V) and (60 W, 220 V) are connected in parallel across a 220 V supply. Which bulb glows brighter and why?",
            [
                correct,
                "60 W bulb, because it has higher resistance and P = I²R",
                "Both glow equally because voltage is 220 V",
                "60 W bulb, because parallel branches carry equal current",
            ],
            correct,
        )
    if concept_id == "P9":
        correct = "Parallel straight lines indicating a uniform magnetic field"
        return (
            "What is the pattern of magnetic field lines inside a long, straight current-carrying solenoid?",
            [correct, "Concentric circles centered on the solenoid axis", "Zero field inside, concentrated only outside", "Intersecting lines at the center"],
            correct,
        )
    if concept_id == "P10":
        correct = "Magnetic Field, Current, and Force (Motion)"
        return (
            "In Fleming's Left-Hand Rule, what do the forefinger, middle finger, and thumb represent respectively?",
            [correct, "Current, Magnetic Field, and Force (Motion)", "Force (Motion), Magnetic Field, and Current", "Magnetic Field, Force (Motion), and Induced EMF"],
            correct,
        )
    if concept_id == "P11":
        far_m = random.choice([1.0, 2.0, 2.5, 4.0])
        p_d = round(-1.0 / far_m, 2)
        correct = f"Concave lens of power {p_d} D"
        return (
            f"A person with myopia cannot see distant objects clearly beyond {far_m} m. What corrective lens restores normal distant vision?",
            [correct, f"Convex lens of power +{abs(p_d)} D", f"Concave lens of power -{far_m} D", f"Convex lens of power +{far_m} D"],
            correct,
        )
    if concept_id == "P12":
        correct = "Violet light has the shortest wavelength in glass, so it slows down and bends the most"
        return (
            "When white light passes through a triangular glass prism, why does violet light deviate more than red light?",
            [
                correct,
                "Red light has a shorter wavelength and higher refractive index in glass",
                "Both colors travel at identical speeds inside glass",
                "Violet light undergoes total internal reflection at the first face",
            ],
            correct,
        )
    # P13
    kw = random.choice([2.2, 3.3])
    curr_drawn = round((kw * 1000) / 220, 1)
    correct = f"Current drawn is {curr_drawn} A (> 5 A), so the live fuse wire melts and breaks the circuit"
    return (
        f"An electric appliance rated {kw} kW, 220 V is switched on in a domestic circuit protected by a 5 A fuse. What happens?",
        [
            correct,
            f"Current drawn is {curr_drawn} A, and the appliance runs normally without blowing the fuse",
            "Current flows safely through the green earth wire instead of the neutral wire",
            "The parallel circuit halves the mains voltage to 110 V",
        ],
        correct,
    )


def generate_targeted_question(
    concept_id: str,
    difficulty: str,
    target_misconception: Optional[str] = None,
    question_format: str = "mixed",
) -> Dict[str, Any]:
    node = CONCEPT_MAP[concept_id]
    chosen_type = (
        question_format
        if question_format in ("mcq", "subjective")
        else random.choice(["mcq", "mcq", "subjective"])
    )

    if chosen_type == "subjective":
        bank = SUBJECTIVE_TEMPLATES.get(concept_id, SUBJECTIVE_TEMPLATES["P2"])
        item = random.choice(bank)
        return {
            "id": f"Q_{uuid.uuid4().hex[:8]}",
            "question_type": "subjective",
            "concept_id": concept_id,
            "concept_name": node["name"],
            "chapter": node.get("chapter", node["unit"]),
            "unit": node["unit"],
            "difficulty": difficulty,
            "prompt": item["prompt"],
            "options": [],
            "correct_option": item["model_solution"],
            "expected_keywords": item["expected_keywords"],
            "target_misconception": target_misconception,
            "source": "ncert-subjective-engine",
        }

    prompt, raw_options, correct_option = _parametric_mcq(concept_id, difficulty)
    options = list(raw_options)
    random.shuffle(options)

    return {
        "id": f"Q_{uuid.uuid4().hex[:8]}",
        "question_type": "mcq",
        "concept_id": concept_id,
        "concept_name": node["name"],
        "chapter": node.get("chapter", node["unit"]),
        "unit": node["unit"],
        "difficulty": difficulty,
        "prompt": prompt,
        "options": options,
        "correct_option": correct_option,
        "expected_keywords": [],
        "target_misconception": target_misconception,
        "source": "ncert-parametric-engine",
    }


def _detect_reasoning_flaw(concept_id: str, question_prompt: str, r_low: str) -> Optional[str]:
    q_low = question_prompt.lower()
    if concept_id == "P1" and ("surface" in r_low or ("mirror" in r_low and "normal" not in r_low and "90" not in r_low)):
        return "Measured angle from mirror surface instead of the normal (90° - θ)"
    if concept_id == "P2" and ("positive" in r_low or "+10" in r_low or "+15" in r_low or "+20" in r_low) and "concave" in q_low:
        return "Sign convention error: took concave mirror focal length as positive"
    if concept_id == "P3" and "away" in r_low and ("glass" in q_low or "denser" in q_low):
        return "Assumed light bends away from the normal when entering an optically denser medium"
    if concept_id == "P4" and ("1/v + 1/u" in r_low or "mirror formula" in r_low):
        return "Used mirror formula (+1/u) instead of lens formula (-1/u)"
    if concept_id == "P5" and any(w in r_low for w in ["used up", "consume", "absorbed"]):
        return "Assumed electric current is consumed as it passes through a resistor"
    if concept_id == "P6" and any(w in r_low for w in ["double", "2x", "2 times"]) and "stretch" in q_low:
        return "Forgot cross-sectional area halves when wire length doubles (R scales by n², not n)"
    if concept_id == "P7" and any(w in r_low for w in ["r1 + r2", "add", "sum", "6 + 3"]) and "parallel" in q_low:
        return "Added parallel resistances directly (R1 + R2) instead of reciprocals"
    if concept_id == "P8" and any(w in r_low for w in ["i2r", "i^2r", "higher resistance"]) and "parallel" in q_low:
        return "Used P = I²R instead of P = V²/R for parallel bulbs at fixed voltage"
    if concept_id == "P9" and ("intersect" in r_low or "cross" in r_low):
        return "Believed magnetic field lines can intersect each other"
    if concept_id == "P10" and any(w in r_low for w in ["right hand", "thumb rule"]):
        return "Confused Fleming's Left-Hand Rule (motor force) with Right-Hand Thumb Rule (field)"
    if concept_id == "P11" and "convex" in r_low and "myopi" in q_low:
        return "Prescribed a converging convex (+) lens for myopia instead of a concave (-) lens"
    if concept_id == "P12" and "red" in r_low and "more" in r_low:
        return "Assumed red light bends more than violet light in a glass prism"
    if concept_id == "P13" and "neutral" in r_low and "fuse" in q_low:
        return "Placed safety fuse in the neutral wire instead of the live wire"
    return None


def analyze_student_reasoning(
    concept_id: str,
    question_prompt: str,
    selected_option: str,
    correct_option: str,
    student_reasoning: str,
    question_type: str = "mcq",
    expected_keywords: Optional[List[str]] = None,
) -> Dict[str, Any]:
    node = CONCEPT_MAP[concept_id]
    reasoning_clean = (student_reasoning or "").strip()
    r_low = reasoning_clean.lower()
    specific_flaw = _detect_reasoning_flaw(concept_id, question_prompt, r_low)

    # Subjective (Numerical / Derivation / Short-Answer) Evaluation
    if question_type == "subjective":
        keywords = [k.lower() for k in (expected_keywords or [])]
        matched = [k for k in keywords if k in r_low]
        has_enough_detail = len(reasoning_clean) >= 18
        is_correct = len(matched) >= max(1, len(keywords)) and has_enough_detail and not specific_flaw

        if not is_correct:
            detected = specific_flaw or (
                f"Incomplete step-by-step derivation or missing target value/unit in {node['name']}"
                if len(matched) > 0
                else node["common_misconceptions"][0]
            )
            return {
                "is_correct": False,
                "reasoning_flawed": True,
                "misconception_label": detected,
                "diagnosis_explanation": (
                    f"Rubric Check ({len(matched)}/{len(keywords)} key steps verified): {detected}. "
                    f"Compare your derivation with the Board-Exam Model Solution below."
                ),
                "socratic_hint": f"Key Formula ({node['formula']}): {node['description']}",
                "model_solution": correct_option,
            }

        return {
            "is_correct": True,
            "reasoning_flawed": False,
            "misconception_label": None,
            "diagnosis_explanation": (
                f"Full Subjective Marks! Your step-by-step derivation, formula ({node['formula']}), and final result are spot on."
            ),
            "socratic_hint": "Subjective mastery verified. Advancing your BKT mastery and SM-2 interval.",
            "model_solution": correct_option,
        }

    # MCQ Evaluation
    is_correct = selected_option.strip() == correct_option.strip()

    if not is_correct:
        detected = specific_flaw or (
            f"Unverified intuition on {node['name']} (insufficient step-by-step reasoning)"
            if len(reasoning_clean) < 10
            else node["common_misconceptions"][0]
        )
        return {
            "is_correct": False,
            "reasoning_flawed": True,
            "misconception_label": detected,
            "diagnosis_explanation": (
                f"Incorrect option '{selected_option}'. Our analyzer detected a conceptual gap in {node['name']}: "
                f"{detected}. Always anchor your steps in {node['formula']}."
            ),
            "socratic_hint": f"Core Rule ({node['formula']}): {node['description']}",
            "model_solution": None,
        }

    if specific_flaw:
        return {
            "is_correct": True,
            "reasoning_flawed": True,
            "misconception_label": f"Right option, but flawed reasoning: {specific_flaw}",
            "diagnosis_explanation": (
                f"You chose the right option, but your written reasoning reveals a flaw: {specific_flaw}. "
                f"BKT mastery was updated conservatively until your reasoning is verified."
            ),
            "socratic_hint": f"Re-verify using {node['formula']}: {node['description']}",
            "model_solution": None,
        }

    if len(reasoning_clean) < 8 or any(w in r_low for w in ["guess", "random", "idk", "don't know", "luck"]):
        return {
            "is_correct": True,
            "reasoning_flawed": True,
            "misconception_label": f"Correct option via guessing without physical justification ({node['name']})",
            "diagnosis_explanation": (
                "You picked the right option, but your written explanation indicates a guess rather than a verified principle. "
                "Mastery score was updated conservatively."
            ),
            "socratic_hint": f"State the governing rule ({node['formula']}) next time for full mastery.",
            "model_solution": None,
        }

    return {
        "is_correct": True,
        "reasoning_flawed": False,
        "misconception_label": None,
        "diagnosis_explanation": (
            f"Verified Mastery! Both your final answer and step-by-step reasoning align accurately with {node['name']} ({node['formula']})."
        ),
        "socratic_hint": "Concept verified. Advancing your learner model and spaced-repetition interval.",
        "model_solution": None,
    }
