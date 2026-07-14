import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CardBrand(StrEnum):
    VISA = "visa"
    MASTERCARD = "mastercard"
    AMEX = "amex"
    OTHER = "other"


class PaymentMethod(Base):
    """Deliberately stores nothing but what's needed to *display* a saved
    card: brand, last 4 digits, expiry. The full card number and CVV are
    never accepted by this API and there is no column here that could hold
    them — so there is nothing for an attacker to steal even if this
    database were fully compromised. See tests/test_payment_methods.py,
    which asserts this at the schema and API level."""

    __tablename__ = "payment_methods"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    brand: Mapped[CardBrand] = mapped_column(Enum(CardBrand, native_enum=False, length=20), nullable=False)
    last4: Mapped[str] = mapped_column(String(4), nullable=False)
    exp_month: Mapped[int] = mapped_column(Integer, nullable=False)
    exp_year: Mapped[int] = mapped_column(Integer, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
