from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import CamelModel
from app.validators import validate_name_characters, validate_phone_format, validate_safe_text


class ShippingDetailsSchema(CamelModel):
    full_name: str = Field(min_length=1)
    address: str = Field(min_length=1)
    city: str = Field(min_length=1)
    postal_code: str = Field(min_length=1)
    country: str = Field(min_length=1)
    phone: str = Field(min_length=6)

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
    contact_full_name: str = Field(min_length=1)
    contact_phone: str = Field(min_length=6)
    contact_email: EmailStr | None = None
    order_comment: str | None = Field(default=None, max_length=1000)
    # References a saved PaymentMethod the router will verify ownership of;
    # omitted means "Cash on delivery" — no card required to place an order.
    payment_method_id: str | None = None

    @field_validator("contact_full_name")
    @classmethod
    def contact_name_characters(cls, value: str) -> str:
        return validate_name_characters(value)

    @field_validator("contact_phone")
    @classmethod
    def contact_phone_format(cls, value: str) -> str:
        return validate_phone_format(value)

    @field_validator("order_comment")
    @classmethod
    def comment_safe_text(cls, value: str | None) -> str | None:
        if value is None or value.strip() == "":
            return None
        return validate_safe_text(value)


class PaymentMethodChangeRequest(CamelModel):
    payment_method_id: str | None = None


class OrderItemRead(CamelModel):
    product_id: str
    title: str
    price: float
    quantity: int
    size: str
    color: str


class OrderRead(CamelModel):
    id: str
    order_number: int
    user_id: str
    items: list[OrderItemRead]
    total_price: float
    status: str
    shipping: ShippingDetailsSchema
    contact_full_name: str
    contact_phone: str
    contact_email: str | None
    order_comment: str | None
    payment_method_label: str
    delivery_method_label: str
    delivery_cost: float
    created_at: datetime
