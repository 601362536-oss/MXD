from __future__ import annotations

import hashlib
import hmac
import secrets


def hash_secret(value: str, salt: str | None = None) -> str:
    actual_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", value.encode("utf-8"), actual_salt.encode("utf-8"), 120_000)
    return f"pbkdf2_sha256${actual_salt}${digest.hex()}"


def verify_secret(value: str, stored: str) -> bool:
    try:
        method, salt, expected = stored.split("$", 2)
    except ValueError:
        return False
    if method != "pbkdf2_sha256":
        return False
    actual = hash_secret(value, salt).split("$", 2)[2]
    return hmac.compare_digest(actual, expected)


def public_token() -> str:
    return secrets.token_urlsafe(32)
