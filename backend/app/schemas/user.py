import re

from pydantic import EmailStr, Field, field_validator, model_validator

from app.schemas.common import CamelModel
from app.validators import validate_name_characters, validate_phone_format


def _validate_password_strength(value: str) -> str:
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[0-9]", value):
        raise ValueError("Password must contain at least one number")
    return value


class UserRead(CamelModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    phone: str


class UserUpdate(CamelModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    phone: str = Field(min_length=1)

    @field_validator("first_name", "last_name")
    @classmethod
    def name_characters(cls, value: str) -> str:
        return validate_name_characters(value)

    @field_validator("phone")
    @classmethod
    def phone_format(cls, value: str) -> str:
        return validate_phone_format(value)


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    phone: str = Field(min_length=1)

    @field_validator("first_name", "last_name")
    @classmethod
    def name_characters(cls, value: str) -> str:
        return validate_name_characters(value)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)

    @field_validator("phone")
    @classmethod
    def phone_format(cls, value: str) -> str:
        return validate_phone_format(value)

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1)


class ForgotPasswordRequest(CamelModel):
    email: EmailStr


class ResetPasswordRequest(CamelModel):
    email: EmailStr
    token: str = Field(min_length=1)
    password: str = Field(min_length=8)
    confirm_password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class ChangePasswordRequest(CamelModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)
    confirm_new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)

    @model_validator(mode="after")
    def passwords_match(self) -> "ChangePasswordRequest":
        if self.new_password != self.confirm_new_password:
            raise ValueError("Passwords do not match")
        return self
