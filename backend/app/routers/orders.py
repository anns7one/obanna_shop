from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreateRequest, OrderRead

router = APIRouter(prefix="/orders", tags=["orders"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreateRequest, current_user: CurrentUser, db: DbSession) -> Order:
    order_items: list[OrderItem] = []
    total_price = 0.0

    for line in payload.items:
        product = await db.scalar(select(Product).where(Product.id == line.product_id))
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {line.product_id} does not exist",
            )

        # Atomic, race-safe stock check-and-decrement: the WHERE clause and
        # the subtraction happen as a single statement on the database side,
        # so two simultaneous orders for the last unit can't both succeed.
        decrement = (
            update(Product)
            .where(Product.id == line.product_id, Product.stock >= line.quantity)
            .values(stock=Product.stock - line.quantity)
        )
        result = await db.execute(decrement)
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for {product.title}",
            )

        line_price = float(product.price)
        total_price += line_price * line.quantity
        order_items.append(
            OrderItem(
                product_id=product.id,
                title=product.title,
                price=line_price,
                quantity=line.quantity,
                size=line.size,
                color=line.color,
            )
        )

    order = Order(
        user_id=current_user.id,
        total_price=total_price,
        shipping=payload.shipping.model_dump(by_alias=False),
        items=order_items,
    )
    db.add(order)
    await db.commit()
    # Only refresh the server-generated column — refreshing with no
    # attribute_names would also expire (and force a lazy re-load of) the
    # `items` relationship we just set in memory, which breaks outside an
    # active await context when FastAPI serializes the response.
    await db.refresh(order, attribute_names=["created_at"])

    return order


@router.get("/my", response_model=list[OrderRead])
async def list_my_orders(current_user: CurrentUser, db: DbSession) -> list[Order]:
    stmt = (
        select(Order)
        .where(Order.user_id == current_user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    result = await db.scalars(stmt)
    return list(result)


@router.patch("/{order_id}/cancel", response_model=OrderRead)
async def cancel_order(order_id: str, current_user: CurrentUser, db: DbSession) -> Order:
    stmt = select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    order = await db.scalar(stmt)
    if order is None or order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status not in (OrderStatus.PROCESSING, OrderStatus.CONFIRMED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This order has already shipped and can no longer be cancelled",
        )

    order.status = OrderStatus.CANCELLED
    await db.commit()
    return order
