import re

from pydantic import Field, field_validator

from app.schemas.common import CamelModel


class AddressIn(CamelModel):
    label: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=1)
    address: str = Field(min_length=1)
    city: str = Field(min_length=1)
    postal_code: str = Field(min_length=1)
    country: str = Field(min_length=1)
    phone: str = Field(min_length=6)
    is_default: bool = False

    @field_validator("phone")
    @classmethod
    def phone_format(cls, value: str) -> str:
        if not re.match(r"^[0-9+()\-\s]+$", value):
            raise ValueError("Invalid phone number format")
        return value


class AddressRead(CamelModel):
    id: str
    label: str
    full_name: str
    address: str
    city: str
    postal_code: str
    country: str
    phone: str
    is_default: bool
