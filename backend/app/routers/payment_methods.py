from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.payment_method import PaymentMethod
from app.models.user import User
from app.schemas.payment_method import PaymentMethodCreate, PaymentMethodRead

router = APIRouter(prefix="/payment-methods", tags=["payment-methods"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=list[PaymentMethodRead])
async def list_payment_methods(current_user: CurrentUser, db: DbSession) -> list[PaymentMethod]:
    stmt = (
        select(PaymentMethod)
        .where(PaymentMethod.user_id == current_user.id)
        .order_by(PaymentMethod.created_at.desc())
    )
    result = await db.scalars(stmt)
    return list(result)


@router.post("", response_model=PaymentMethodRead, status_code=status.HTTP_201_CREATED)
async def create_payment_method(
    payload: PaymentMethodCreate, current_user: CurrentUser, db: DbSession
) -> PaymentMethod:
    if payload.is_default:
        await db.execute(
            update(PaymentMethod).where(PaymentMethod.user_id == current_user.id).values(is_default=False)
        )

    method = PaymentMethod(user_id=current_user.id, **payload.model_dump(by_alias=False))
    db.add(method)
    await db.commit()
    await db.refresh(method)
    return method


@router.delete("/{method_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment_method(method_id: str, current_user: CurrentUser, db: DbSession) -> None:
    method = await db.get(PaymentMethod, method_id)
    if method is None or method.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment method not found")
    await db.delete(method)
    await db.commit()
