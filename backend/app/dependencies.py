from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.security import InvalidTokenError, TokenType, decode_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    if credentials is None:
        raise unauthorized

    try:
        payload = decode_token(credentials.credentials, TokenType.ACCESS)
    except InvalidTokenError as exc:
        raise unauthorized from exc

    user_id = payload.get("sub")
    if user_id is None:
        raise unauthorized

    user = await db.get(User, user_id)
    if user is None:
        raise unauthorized

    return user


def require_role(role: UserRole):
    """Returns a dependency that only lets the request through if the
    caller is authenticated AND has this exact role. Not wired to any route
    yet (no admin UI exists), but the mechanism is ready — see the plan's
    RBAC note."""

    async def dependency(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if current_user.role != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return dependency
