import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Identity, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OrderStatus(StrEnum):
    PROCESSING = "processing"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # A short, human-readable number distinct from the UUID `id` above —
    # what gets shown to the customer instead of a raw UUID.
    order_number: Mapped[int] = mapped_column(Integer, Identity(start=1000), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, native_enum=False, length=20), default=OrderStatus.PROCESSING, nullable=False
    )
    # The delivery address, snapshotted at order time — deliberately not a
    # live FK to `addresses`, so editing/deleting a saved address later
    # never rewrites history for orders already placed against it.
    shipping: Mapped[dict] = mapped_column(JSON, nullable=False)
    contact_full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    order_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Also a snapshot, not a live FK to `payment_methods`, for the same
    # reason as `shipping` above — e.g. "Visa •••• 4242" or "Cash on delivery".
    payment_method_label: Mapped[str] = mapped_column(String(100), nullable=False)
    delivery_method_label: Mapped[str] = mapped_column(String(100), nullable=False, default="Standard shipping")
    delivery_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", order_by="OrderItem.id"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True, nullable=False)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    size: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
