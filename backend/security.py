import base64
import hashlib
import hmac
import json
import os
import random
import time
from typing import Dict, Optional, Tuple

SECRET_KEY = os.environ.get("APP_SECRET_KEY", "physicsmind-local-hackathon-secret-2026").encode("utf-8")
CAPTCHA_TTL_SECONDS = 300
TOKEN_TTL_SECONDS = 86400 * 7


def hash_password(password: str, salt_hex: Optional[str] = None) -> Tuple[str, str]:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a 16-byte cryptographic salt."""
    salt = bytes.fromhex(salt_hex) if salt_hex else os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return dk.hex(), salt.hex()


def verify_password(password: str, stored_hash_hex: str, salt_hex: str) -> bool:
    """Constant-time password verification."""
    computed_hash, _ = hash_password(password, salt_hex)
    return hmac.compare_digest(computed_hash, stored_hash_hex)


def _sign_payload(payload: Dict) -> str:
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    b64 = base64.urlsafe_b64encode(raw).decode("utf-8")
    sig = hmac.new(SECRET_KEY, b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{b64}.{sig}"


def _verify_signed_payload(token: str) -> Optional[Dict]:
    if not token or "." not in token:
        return None
    b64, sig = token.rsplit(".", 1)
    expected_sig = hmac.new(SECRET_KEY, b64.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected_sig):
        return None
    try:
        raw = base64.urlsafe_b64decode(b64.encode("utf-8"))
        data = json.loads(raw.decode("utf-8"))
        if data.get("exp", 0) < time.time():
            return None
        return data
    except Exception:
        return None


def generate_captcha() -> Dict[str, str]:
    """
    Generates an anti-bot SVG math challenge and a cryptographically signed,
    time-limited verification token.
    """
    a = random.randint(2, 12)
    b = random.randint(1, 9)
    op = random.choice(["+", "-", "×"])
    if op == "+":
        ans = a + b
    elif op == "-":
        if a < b:
            a, b = b, a
        ans = a - b
    else:
        ans = a * b

    challenge_text = f"{a} {op} {b} = ?"
    nonce = os.urandom(6).hex()
    token = _sign_payload(
        {
            "ans": str(ans),
            "nonce": nonce,
            "exp": int(time.time()) + CAPTCHA_TTL_SECONDS,
        }
    )

    noise_lines = ""
    for _ in range(5):
        x1, y1 = random.randint(0, 180), random.randint(0, 52)
        x2, y2 = random.randint(0, 180), random.randint(0, 52)
        noise_lines += f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#4f46e5" stroke-opacity="0.35" stroke-width="1.5"/>'

    rot = random.randint(-5, 5)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="180" height="52" viewBox="0 0 180 52" role="img" aria-label="Security math challenge">'
        f'<rect width="180" height="52" rx="8" fill="#0f172a" stroke="#334155"/>'
        f'{noise_lines}'
        f'<text x="90" y="33" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="20" font-weight="bold" '
        f'transform="rotate({rot} 90 26)" letter-spacing="2">{challenge_text}</text>'
        f'</svg>'
    )
    svg_b64 = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    return {
        "captcha_token": token,
        "captcha_image": f"data:image/svg+xml;base64,{svg_b64}",
        "prompt": "Solve the security math challenge shown in the image",
    }


def verify_captcha(captcha_token: str, user_answer: str) -> bool:
    data = _verify_signed_payload(captcha_token)
    if not data:
        return False
    cleaned = (user_answer or "").strip()
    return hmac.compare_digest(data.get("ans", ""), cleaned)


def create_session_token(user_id: str, email: str, name: str, role: str) -> str:
    return _sign_payload(
        {
            "uid": user_id,
            "email": email,
            "name": name,
            "role": role,
            "exp": int(time.time()) + TOKEN_TTL_SECONDS,
        }
    )


def verify_session_token(token: str) -> Optional[Dict]:
    return _verify_signed_payload(token)