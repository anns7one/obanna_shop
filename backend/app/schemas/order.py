import re
from datetime import datetime

from pydantic import Field, field_validator

from app.schemas.common import CamelModel


class ShippingDetailsSchema(CamelModel):
    full_name: str = Field(min_length=1)
    address: str = Field(min_length=1)
    city: str = Field(min_length=1)
    postal_code: str = Field(min_length=1)
    country: str = Field(min_length=1)
    phone: str = Field(min_length=6)

    @field_validator("phone")
    @classmethod
    def phone_format(cls, value: str) -> str:
        if not re.match(r"^[0-9+()\-\s]+$", value):
            raise ValueError("Invalid phone number format")
        return value


class OrderItemIn(CamelModel):
    """Only what we trust the client to tell us about each line: which
    product, which size/color, how many. price/title are deliberately NOT
    accepted here — the order router re-derives them from the real Product
    row so a tampered request can't buy anything below its real price."""

    product_id: str
    size: str
    color: str
    quantity: int = Field(gt=0)


class OrderCreateRequest(CamelModel):
    items: list[OrderItemIn] = Field(min_length=1)
    shipping: ShippingDetailsSchema


class OrderItemRead(CamelModel):
    product_id: str
    title: str
    price: float
    quantity: int
    size: str
    color: str


class OrderRead(CamelModel):
    id: str
    user_id: str
    items: list[OrderItemRead]
    total_price: float
    status: str
    shipping: ShippingDetailsSchema
    created_at: datetime
