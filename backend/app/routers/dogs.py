from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_session
from app.models.dog import Dog
from app.models.user import User
from app.schemas.dog import DogCreate, DogRead, DogUpdate
from app.users_setup import current_active_admin

router = APIRouter(prefix="/dogs", tags=["dogs"])


@router.get("", response_model=list[DogRead])
async def list_dogs(session: AsyncSession = Depends(get_async_session)) -> list[Dog]:
    result = await session.execute(select(Dog).order_by(Dog.id))
    return list(result.scalars().all())


@router.get("/{dog_id}", response_model=DogRead)
async def get_dog(dog_id: int, session: AsyncSession = Depends(get_async_session)) -> Dog:
    dog = await session.get(Dog, dog_id)
    if not dog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")
    return dog


@router.post("", response_model=DogRead, status_code=status.HTTP_201_CREATED)
async def create_dog(
    body: DogCreate,
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(current_active_admin),
) -> Dog:
    dog = Dog(
        name=body.name,
        breed=body.breed,
        age=body.age,
        sex=body.sex,
        size=body.size,
        description=body.description,
        photo_url=body.photo_url,
        status=body.status,
    )
    session.add(dog)
    await session.commit()
    await session.refresh(dog)
    return dog


@router.patch("/{dog_id}", response_model=DogRead)
async def update_dog(
    dog_id: int,
    body: DogUpdate,
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(current_active_admin),
) -> Dog:
    dog = await session.get(Dog, dog_id)
    if not dog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(dog, k, v)
    await session.commit()
    await session.refresh(dog)
    return dog


@router.delete("/{dog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dog(
    dog_id: int,
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(current_active_admin),
) -> None:
    dog = await session.get(Dog, dog_id)
    if not dog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")
    await session.delete(dog)
    await session.commit()
