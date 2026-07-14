from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressIn, AddressRead

router = APIRouter(prefix="/addresses", tags=["addresses"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


async def _get_owned_address(address_id: str, current_user: User, db: AsyncSession) -> Address:
    address = await db.get(Address, address_id)
    if address is None or address.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address


@router.get("", response_model=list[AddressRead])
async def list_addresses(current_user: CurrentUser, db: DbSession) -> list[Address]:
    stmt = select(Address).where(Address.user_id == current_user.id).order_by(Address.created_at.desc())
    result = await db.scalars(stmt)
    return list(result)


@router.post("", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
async def create_address(payload: AddressIn, current_user: CurrentUser, db: DbSession) -> Address:
    if payload.is_default:
        await db.execute(update(Address).where(Address.user_id == current_user.id).values(is_default=False))

    address = Address(user_id=current_user.id, **payload.model_dump(by_alias=False))
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


@router.put("/{address_id}", response_model=AddressRead)
async def update_address(address_id: str, payload: AddressIn, current_user: CurrentUser, db: DbSession) -> Address:
    address = await _get_owned_address(address_id, current_user, db)

    if payload.is_default:
        await db.execute(
            update(Address)
            .where(Address.user_id == current_user.id, Address.id != address_id)
            .values(is_default=False)
        )

    for key, value in payload.model_dump(by_alias=False).items():
        setattr(address, key, value)
    await db.commit()
    await db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(address_id: str, current_user: CurrentUser, db: DbSession) -> None:
    address = await _get_owned_address(address_id, current_user, db)
    await db.delete(address)
    await db.commit()
