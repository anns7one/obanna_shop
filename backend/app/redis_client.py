from functools import lru_cache

import redis.asyncio as redis

from app.config import get_settings

REFRESH_SESSION_PREFIX = "refresh_session:"


@lru_cache
def get_redis() -> redis.Redis:
    settings = get_settings()
    return redis.from_url(settings.redis_url, decode_responses=True)


async def store_refresh_session(jti: str, user_id: str, ttl_seconds: int) -> None:
    """Records that this refresh-token id (jti) is currently valid for this
    user, expiring automatically after ttl_seconds — Redis deletes the key
    itself, we never have to run cleanup jobs for expired sessions."""
    client = get_redis()
    await client.set(f"{REFRESH_SESSION_PREFIX}{jti}", user_id, ex=ttl_seconds)


async def get_refresh_session_user(jti: str) -> str | None:
    client = get_redis()
    return await client.get(f"{REFRESH_SESSION_PREFIX}{jti}")


async def revoke_refresh_session(jti: str) -> None:
    """Used on logout and on every refresh (the old jti is revoked right
    after a new one is issued — this is 'rotation': a refresh token can only
    ever be used once)."""
    client = get_redis()
    await client.delete(f"{REFRESH_SESSION_PREFIX}{jti}")
