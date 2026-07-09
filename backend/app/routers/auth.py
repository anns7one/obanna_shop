from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.rate_limit import limiter
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.redis_client import get_refresh_session_user, revoke_refresh_session, store_refresh_session
from app.schemas.auth import AccessTokenResponse, AuthResponse
from app.schemas.user import LoginRequest, RegisterRequest, UserRead
from app.security import (
    InvalidTokenError,
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PATH = "/api/v1/auth"
REFRESH_TTL_SECONDS = settings.refresh_token_ttl_days * 24 * 60 * 60

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
        max_age=REFRESH_TTL_SECONDS,
    )


async def _issue_session(response: Response, user: User) -> AuthResponse:
    access_token = create_access_token(user.id)
    refresh_token, jti = create_refresh_token(user.id)
    await store_refresh_session(jti, user.id, ttl_seconds=REFRESH_TTL_SECONDS)
    _set_refresh_cookie(response, refresh_token)
    return AuthResponse(user=UserRead.model_validate(user), access_token=access_token)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, payload: RegisterRequest, response: Response, db: DbSession) -> AuthResponse:
    email = payload.email.lower()
    existing = await db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return await _issue_session(response, user)


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest, response: Response, db: DbSession) -> AuthResponse:
    invalid = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise invalid

    return await _issue_session(response, user)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(
    response: Response,
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_COOKIE_NAME)] = None,
) -> AccessTokenResponse:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    if refresh_token is None:
        raise unauthorized

    try:
        payload = decode_token(refresh_token, TokenType.REFRESH)
    except InvalidTokenError as exc:
        raise unauthorized from exc

    jti = payload.get("jti")
    user_id = payload.get("sub")
    if jti is None or user_id is None:
        raise unauthorized

    session_user_id = await get_refresh_session_user(jti)
    if session_user_id is None or session_user_id != user_id:
        raise unauthorized

    # Rotation: a refresh token is single-use. Burn it immediately so a
    # captured-and-replayed old token can never work again.
    await revoke_refresh_session(jti)

    new_access_token = create_access_token(user_id)
    new_refresh_token, new_jti = create_refresh_token(user_id)
    await store_refresh_session(new_jti, user_id, ttl_seconds=REFRESH_TTL_SECONDS)
    _set_refresh_cookie(response, new_refresh_token)

    return AccessTokenResponse(access_token=new_access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_COOKIE_NAME)] = None,
) -> None:
    if refresh_token is not None:
        try:
            payload = decode_token(refresh_token, TokenType.REFRESH)
        except InvalidTokenError:
            payload = None
        if payload is not None:
            jti = payload.get("jti")
            if jti:
                await revoke_refresh_session(jti)

    response.delete_cookie(key=REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)


@router.get("/me", response_model=UserRead)
async def me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)
