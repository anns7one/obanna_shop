import uuid
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from typing import Any

import bcrypt
import jwt

from app.config import get_settings

settings = get_settings()

JWT_ALGORITHM = "HS256"


class TokenType(StrEnum):
    ACCESS = "access"
    REFRESH = "refresh"


def hash_password(plain_password: str) -> str:
    """One-way hash. Store only this in the database, never the plain password."""
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Re-hashes the login attempt and lets bcrypt compare it against the
    stored hash. Never decodes the stored hash back into a password — that's
    not possible by design."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))


def _create_token(user_id: str, token_type: TokenType, expires_delta: timedelta, jti: str | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": user_id,
        "type": token_type.value,
        "iat": now,
        "exp": now + expires_delta,
    }
    if jti is not None:
        payload["jti"] = jti
    return jwt.encode(payload, settings.secret_key, algorithm=JWT_ALGORITHM)


def create_access_token(user_id: str) -> str:
    ttl = timedelta(minutes=settings.access_token_ttl_minutes)
    return _create_token(user_id, TokenType.ACCESS, ttl)


def create_refresh_token(user_id: str) -> tuple[str, str]:
    """Returns (token, jti). The jti (JWT ID) is a random session id we also
    store in Redis, so a refresh token can be revoked (logout) or rotated
    (one-time use) instead of being valid, unrevokable, for its whole 30-day
    lifetime just because the signature checks out."""
    jti = str(uuid.uuid4())
    ttl = timedelta(days=settings.refresh_token_ttl_days)
    token = _create_token(user_id, TokenType.REFRESH, ttl, jti=jti)
    return token, jti


class InvalidTokenError(Exception):
    pass


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise InvalidTokenError(str(exc)) from exc

    if payload.get("type") != expected_type.value:
        raise InvalidTokenError(f"expected a {expected_type.value} token")

    return payload
