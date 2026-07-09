from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    compare_at_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    category: Mapped[str] = mapped_column("category_slug", ForeignKey("categories.slug"), index=True, nullable=False)
    colors: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    sizes: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
