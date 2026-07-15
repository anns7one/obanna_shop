from pydantic import Field, field_validator

from app.schemas.common import CamelModel
from app.validators import validate_name_characters, validate_phone_format, validate_safe_text


class AddressIn(CamelModel):
    label: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=1)
    address: str = Field(min_length=1)
    city: str = Field(min_length=1)
    postal_code: str = Field(min_length=1)
    country: str = Field(min_length=1)
    phone: str = Field(min_length=6)
    is_default: bool = False

    @field_validator("full_name")
    @classmethod
    def full_name_characters(cls, value: str) -> str:
        return validate_name_characters(value)

    @field_validator("address", "city", "postal_code", "country")
    @classmethod
    def safe_text(cls, value: str) -> str:
        return validate_safe_text(value)

    @field_validator("phone")
    @classmethod
    def phone_format(cls, value: str) -> str:
        return validate_phone_format(value)


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
