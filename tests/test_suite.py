import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import security  # type: ignore[import-not-found]
import learner_model  # type: ignore[import-not-found]
import main  # type: ignore[import-not-found]


class PhysicsMindIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp_dir = tempfile.TemporaryDirectory()
        state_path = os.path.join(cls.tmp_dir.name, "test_state.json")
        main.store = learner_model.LearnerModelStore(path=state_path)
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), main.PhysicsMindRequestHandler)
        cls.port = cls.server.server_address[1]
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.tmp_dir.cleanup()

    def _req(self, method, path, payload=None, headers=None):
        url = f"{self.base_url}{path}"
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
        req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode("utf-8"))

    def test_01_frontend_html_served(self):
        with urllib.request.urlopen(f"{self.base_url}/") as resp:
            html = resp.read().decode("utf-8")
            self.assertEqual(resp.status, 200)
            self.assertIn("PhysicsMind", html)
            self.assertIn("How Does It Work?", html)

    def test_02_captcha_signup_and_login_security(self):
        status, cap = self._req("GET", "/api/auth/captcha")
        self.assertEqual(status, 200)
        self.assertTrue(cap["captcha_image"].startswith("data:image/svg+xml;base64,"))
        ans = security._verify_signed_payload(cap["captcha_token"])["ans"]

        s_bad, _ = self._req(
            "POST",
            "/api/auth/signup",
            {
                "name": "Rudra P Jena",
                "email": "rudra@test.com",
                "password": "StrongPassword123",
                "role": "student",
                "captcha_token": cap["captcha_token"],
                "captcha_answer": "wrong_ans",
            },
        )
        self.assertEqual(s_bad, 400)

        s_ok, ok_body = self._req(
            "POST",
            "/api/auth/signup",
            {
                "name": "Rudra P Jena",
                "email": "rudra@test.com",
                "password": "StrongPassword123",
                "role": "student",
                "captcha_token": cap["captcha_token"],
                "captcha_answer": ans,
            },
        )
        self.assertEqual(s_ok, 200)
        token = ok_body["token"]

        s_me, me_body = self._req("GET", "/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(s_me, 200)
        self.assertTrue(me_body["authenticated"])
        self.assertEqual(me_body["user"]["name"], "Rudra P Jena")

    def test_03_diagnostic_bkt_and_misconception_detection(self):
        _, diag = self._req("GET", "/api/diagnostic")
        questions = diag["questions"]
        self.assertEqual(len(questions), 5)

        submissions = []
        for idx, q in enumerate(questions):
            if idx < 3:
                submissions.append(
                    {
                        "question_id": q["id"],
                        "concept_id": q["concept_id"],
                        "prompt": q["prompt"],
                        "selected_option": q["correct_option"],
                        "correct_option": q["correct_option"],
                        "reasoning": "Applied New Cartesian Sign Convention and Ohm's law scaling R = rho*L/A.",
                    }
                )
            else:
                wrong = [o for o in q["options"] if o != q["correct_option"]][0]
                submissions.append(
                    {
                        "question_id": q["id"],
                        "concept_id": q["concept_id"],
                        "prompt": q["prompt"],
                        "selected_option": wrong,
                        "correct_option": q["correct_option"],
                        "reasoning": "I added R1 + R2 directly in parallel.",
                    }
                )

        status, body = self._req("POST", "/api/diagnostic/submit", {"student_id": "student_1", "answers": submissions})
        self.assertEqual(status, 200)
        st = body["state"]["student"]
        self.assertTrue(st["diagnostic_completed"])
        self.assertGreater(st["concepts"]["P2"]["mastery"], 0.50)
        self.assertTrue(len(st["concepts"]["P7"]["misconceptions"]) > 0)

    def test_04_lucky_guess_flagged(self):
        status, body = self._req(
            "POST",
            "/api/submit-answer",
            {
                "student_id": "student_1",
                "question_id": "Q_TEST",
                "concept_id": "P2",
                "difficulty": "medium",
                "prompt": "Concave mirror focal length?",
                "selected_option": "Convex mirror",
                "correct_option": "Convex mirror",
                "reasoning": "random guess idk",
            },
        )
        self.assertEqual(status, 200)
        self.assertTrue(body["is_correct"])
        self.assertTrue(body["reasoning_flawed"])
        self.assertIn("guessing", body["misconception_label"].lower())

    def test_05_sm2_clock_and_teacher_dashboard(self):
        self._req(
            "POST",
            "/api/submit-answer",
            {
                "student_id": "student_1",
                "question_id": "Q_P1",
                "concept_id": "P1",
                "difficulty": "easy",
                "prompt": "Angle of reflection?",
                "selected_option": "55°",
                "correct_option": "55°",
                "reasoning": "Angle of incidence measured from normal is 90 - 35 = 55 degrees.",
            },
        )
        _, st_before = self._req("GET", "/api/state/student_1")
        self.assertNotIn("P1", st_before["due_concepts"])

        _, st_after = self._req("POST", "/api/simulate-time", {"student_id": "student_1", "hours": 25})
        self.assertIn("P1", st_after["due_concepts"])

        _, dash = self._req("GET", "/api/teacher/dashboard")
        self.assertGreaterEqual(dash["total_students"], 6)
        self.assertEqual(len(dash["concept_gaps"]), 13)
        self.assertTrue(len(dash["top_misconceptions"]) > 0)

    def test_06_chatbot_and_voice_commands(self):
        _, nav = self._req("POST", "/api/chatbot", {"student_id": "student_1", "query": "Open live class"})
        self.assertEqual(nav["action"]["tab"], "classroom")

        _, phys = self._req("POST", "/api/chatbot", {"student_id": "student_1", "query": "Explain mirror sign convention"})
        self.assertIn("New Cartesian", phys["reply"])


    def test_07_subjective_question_and_full_ncert_syllabus(self):
        _, st = self._req("GET", "/api/state/student_1")
        self.assertEqual(len(st["graph"]["nodes"]), 13)

        _, q_res = self._req("GET", "/api/next-question/student_1?concept_id=P11&format=subjective")
        q = q_res["question"]
        self.assertEqual(q["question_type"], "subjective")
        self.assertEqual(q["concept_id"], "P11")

        _, sub_res = self._req(
            "POST",
            "/api/submit-answer",
            {
                "student_id": "student_1",
                "question_id": q["id"],
                "concept_id": "P11",
                "question_type": "subjective",
                "difficulty": q["difficulty"],
                "prompt": q["prompt"],
                "expected_keywords": q["expected_keywords"],
                "selected_option": "",
                "correct_option": q["correct_option"],
                "reasoning": "For myopia far point 80 cm, f = -80 cm = -0.80 m, so P = 1/(-0.80) = -1.25 D using a concave lens.",
            },
        )
        self.assertTrue(sub_res["is_correct"])
        self.assertIsNotNone(sub_res["model_solution"])


if __name__ == "__main__":
    unittest.main(verbosity=2)