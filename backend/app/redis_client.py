from functools import lru_cache

import redis.asyncio as redis

from app.config import get_settings

REFRESH_SESSION_PREFIX = "refresh_session:"
USER_SESSIONS_PREFIX = "user_sessions:"


@lru_cache
def get_redis() -> redis.Redis:
    settings = get_settings()
    return redis.from_url(settings.redis_url, decode_responses=True)


async def store_refresh_session(jti: str, user_id: str, ttl_seconds: int) -> None:
    """Records that this refresh-token id (jti) is currently valid for this
    user, expiring automatically after ttl_seconds — Redis deletes the key
    itself, we never have to run cleanup jobs for expired sessions. Also
    added to a per-user set (no separate TTL — a stale jti left behind here
    after its own key expires is harmless, revoking it again is a no-op) so
    every session belonging to a user can later be found and killed at once,
    e.g. after a password reset."""
    client = get_redis()
    await client.set(f"{REFRESH_SESSION_PREFIX}{jti}", user_id, ex=ttl_seconds)
    await client.sadd(f"{USER_SESSIONS_PREFIX}{user_id}", jti)


async def get_refresh_session_user(jti: str) -> str | None:
    client = get_redis()
    return await client.get(f"{REFRESH_SESSION_PREFIX}{jti}")


async def revoke_refresh_session(jti: str, user_id: str | None = None) -> None:
    """Used on logout and on every refresh (the old jti is revoked right
    after a new one is issued — this is 'rotation': a refresh token can only
    ever be used once). Pass user_id when known to also drop it from that
    user's session set; safe to omit (e.g. from /auth/logout, which only
    knows the jti)."""
    client = get_redis()
    await client.delete(f"{REFRESH_SESSION_PREFIX}{jti}")
    if user_id is not None:
        await client.srem(f"{USER_SESSIONS_PREFIX}{user_id}", jti)


async def revoke_all_user_sessions(user_id: str) -> None:
    """Kills every refresh session belonging to a user at once — used after
    a password reset, so a session established before the reset (e.g. by
    whoever the password was reset *against*) stops working immediately."""
    client = get_redis()
    key = f"{USER_SESSIONS_PREFIX}{user_id}"
    jtis = await client.smembers(key)
    if jtis:
        await client.delete(*(f"{REFRESH_SESSION_PREFIX}{jti}" for jti in jtis))
    await client.delete(key)
