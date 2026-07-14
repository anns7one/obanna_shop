from pydantic import ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.models.payment_method import CardBrand
from app.schemas.common import CamelModel


class PaymentMethodCreate(CamelModel):
    """The only shape a client can submit a saved card in. There is no
    cardNumber or cvv field here at all — not accepted-and-discarded,
    genuinely absent from the schema — and extra="forbid" turns any
    attempt to send one into a 422 instead of it being silently dropped
    (silent-drop could hide a frontend bug that puts a real card number on
    the wire and into request logs). brand/last4 must be derived from the
    full number in the browser and never transmitted; see
    frontend/src/lib/card.ts for that logic."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
        extra="forbid",
    )

    brand: CardBrand
    last4: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")
    exp_month: int = Field(ge=1, le=12)
    exp_year: int = Field(ge=2024, le=2100)
    is_default: bool = False


class PaymentMethodRead(CamelModel):
    id: str
    brand: CardBrand
    last4: str
    exp_month: int
    exp_year: int
    is_default: bool
