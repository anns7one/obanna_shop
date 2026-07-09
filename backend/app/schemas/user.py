import re

from pydantic import EmailStr, Field, field_validator, model_validator

from app.schemas.common import CamelModel


class UserRead(CamelModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one number")
        return value

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1)
