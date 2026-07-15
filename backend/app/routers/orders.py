from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.order import Order, OrderItem, OrderStatus
from app.models.payment_method import PaymentMethod
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreateRequest, OrderRead, PaymentMethodChangeRequest

router = APIRouter(prefix="/orders", tags=["orders"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

# Mirrors the "Free shipping on orders over $75" banner already shown in the
# header — one real number instead of an invented, disconnected one.
FREE_SHIPPING_THRESHOLD = 75.0
STANDARD_SHIPPING_COST = 8.0


async def _resolve_payment_label(db: AsyncSession, user_id: str, payment_method_id: str | None) -> str:
    """Derives a display label server-side from the caller's own saved
    payment method rather than trusting client-supplied text — mirrors why
    order line price/title are re-derived from Product instead of trusted
    from the client."""
    if payment_method_id is None:
        return "Cash on delivery"

    method = await db.scalar(select(PaymentMethod).where(PaymentMethod.id == payment_method_id))
    if method is None or method.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment method not found")

    return f"{method.brand.value.title()} •••• {method.last4}"


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreateRequest, current_user: CurrentUser, db: DbSession) -> Order:
    order_items: list[OrderItem] = []
    subtotal = 0.0

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
        subtotal += line_price * line.quantity
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

    payment_method_label = await _resolve_payment_label(db, current_user.id, payload.payment_method_id)
    delivery_cost = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else STANDARD_SHIPPING_COST

    order = Order(
        user_id=current_user.id,
        total_price=subtotal + delivery_cost,
        shipping=payload.shipping.model_dump(by_alias=False),
        contact_full_name=payload.contact_full_name,
        contact_phone=payload.contact_phone,
        contact_email=payload.contact_email,
        order_comment=payload.order_comment,
        payment_method_label=payment_method_label,
        delivery_method_label="Standard shipping",
        delivery_cost=delivery_cost,
        items=order_items,
    )
    db.add(order)
    await db.commit()
    # Only refresh the server-generated columns — refreshing with no
    # attribute_names would also expire (and force a lazy re-load of) the
    # `items` relationship we just set in memory, which breaks outside an
    # active await context when FastAPI serializes the response.
    await db.refresh(order, attribute_names=["created_at", "order_number"])

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


@router.patch("/{order_id}/payment-method", response_model=OrderRead)
async def change_order_payment_method(
    order_id: str, payload: PaymentMethodChangeRequest, current_user: CurrentUser, db: DbSession
) -> Order:
    stmt = select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    order = await db.scalar(stmt)
    if order is None or order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status not in (OrderStatus.PROCESSING, OrderStatus.CONFIRMED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This order has already shipped and its payment method can no longer be changed",
        )

    order.payment_method_label = await _resolve_payment_label(db, current_user.id, payload.payment_method_id)
    await db.commit()
    return order


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(order_id: str, current_user: CurrentUser, db: DbSession) -> Order:
    stmt = select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    order = await db.scalar(stmt)
    if order is None or order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
