from app.schemas.common import CamelModel
from app.schemas.user import UserRead


class AuthResponse(CamelModel):
    user: UserRead
    access_token: str


class AccessTokenResponse(CamelModel):
    access_token: str
