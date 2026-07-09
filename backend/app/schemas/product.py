from datetime import datetime

from app.schemas.common import CamelModel


class ProductRead(CamelModel):
    id: str
    slug: str
    title: str
    description: str
    price: float
    compare_at_price: float | None = None
    category: str
    colors: list[str]
    sizes: list[str]
    stock: int
    is_new: bool
    created_at: datetime
