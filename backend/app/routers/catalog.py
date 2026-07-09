from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryRead
from app.schemas.product import ProductRead

router = APIRouter(tags=["catalog"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(db: DbSession) -> list[Category]:
    result = await db.scalars(select(Category).order_by(Category.slug))
    return list(result)


@router.get("/products", response_model=list[ProductRead])
async def list_products(
    db: DbSession,
    category: str | None = None,
    q: str | None = None,
    sort: str = "newest",
) -> list[Product]:
    stmt = select(Product)

    if category:
        stmt = stmt.where(Product.category == category)

    if q and q.strip():
        term = f"%{q.strip().lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Product.title).like(term),
                func.lower(Product.description).like(term),
            )
        )

    if sort == "price-asc":
        stmt = stmt.order_by(Product.price.asc())
    elif sort == "price-desc":
        stmt = stmt.order_by(Product.price.desc())
    else:
        stmt = stmt.order_by(Product.created_at.desc())

    result = await db.scalars(stmt)
    return list(result)


@router.get("/products/{slug}", response_model=ProductRead)
async def get_product(slug: str, db: DbSession) -> Product:
    product = await db.scalar(select(Product).where(Product.slug == slug))
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("/products/{slug}/related", response_model=list[ProductRead])
async def get_related_products(
    slug: str,
    db: DbSession,
    limit: Annotated[int, Query(ge=1, le=20)] = 4,
) -> list[Product]:
    product = await db.scalar(select(Product).where(Product.slug == slug))
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    stmt = (
        select(Product)
        .where(Product.category == product.category, Product.id != product.id)
        .order_by(Product.created_at.desc())
        .limit(limit)
    )
    result = await db.scalars(stmt)
    return list(result)
