from app.schemas.common import CamelModel


class CategoryRead(CamelModel):
    slug: str
    name: str
    description: str
