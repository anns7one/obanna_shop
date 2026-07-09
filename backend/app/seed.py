import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models import Category, Product

FIXTURES_DIR = Path(__file__).parent / "fixtures"


async def upsert_categories(db: AsyncSession) -> None:
    data = json.loads((FIXTURES_DIR / "categories.json").read_text(encoding="utf-8"))
    for row in data:
        category = await db.get(Category, row["slug"])
        if category is None:
            db.add(Category(**row))
        else:
            category.name = row["name"]
            category.description = row["description"]


async def upsert_products(db: AsyncSession) -> None:
    data = json.loads((FIXTURES_DIR / "products.json").read_text(encoding="utf-8"))
    for row in data:
        fields = dict(row)
        fields["created_at"] = datetime.fromisoformat(fields["created_at"]).replace(tzinfo=timezone.utc)

        product = await db.get(Product, fields["id"])
        if product is None:
            db.add(Product(**fields))
        else:
            for key, value in fields.items():
                if key == "id":
                    continue
                setattr(product, key, value)


async def seed() -> None:
    async with async_session_factory() as db:
        await upsert_categories(db)
        await upsert_products(db)
        await db.commit()
    print("Seed complete: categories + products upserted.")


if __name__ == "__main__":
    asyncio.run(seed())
