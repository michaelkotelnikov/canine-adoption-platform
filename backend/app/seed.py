"""Idempotent seed: upserts mock dogs by name (syncs fields); creates admin user if missing."""

import asyncio
import os
import uuid

import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config import settings
from app.models.dog import Dog
from app.models.user import User


async def seed() -> None:
    database_url = os.environ.get("DATABASE_URL", settings.database_url)
    engine = create_async_engine(database_url, echo=False)
    session_maker = async_sessionmaker(engine, expire_on_commit=False)

    mock_dogs = [
        Dog(
            name="Maple",
            breed="Golden Retriever mix",
            age=3,
            sex="female",
            size="large",
            description="Loves water, gentle with kids, knows sit and stay.",
            photo_url="https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
            status="available",
        ),
        Dog(
            name="Crumbs",
            breed="Terrier mix",
            age=5,
            sex="male",
            size="small",
            description="Energetic and curious; best as the only dog in the home.",
            photo_url="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800",
            status="available",
        ),
        Dog(
            name="Nova",
            breed="Border Collie",
            age=2,
            sex="female",
            size="medium",
            description="Needs mental stimulation and daily exercise; very trainable.",
            photo_url="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
            status="available",
        ),
        Dog(
            name="Bruno",
            breed="Labrador",
            age=7,
            sex="male",
            size="large",
            description="Calm senior who enjoys short walks and long naps.",
            photo_url="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
            status="adopted",
        ),
    ]

    async with session_maker() as session:
        for template in mock_dogs:
            result = await session.execute(select(Dog).where(Dog.name == template.name))
            existing = result.scalar_one_or_none()
            if existing:
                # Keep DB in sync with mock definitions (e.g. fixed photo_url) without deleting rows.
                existing.breed = template.breed
                existing.age = template.age
                existing.sex = template.sex
                existing.size = template.size
                existing.description = template.description
                existing.photo_url = template.photo_url
                existing.status = template.status
            else:
                session.add(
                    Dog(
                        name=template.name,
                        breed=template.breed,
                        age=template.age,
                        sex=template.sex,
                        size=template.size,
                        description=template.description,
                        photo_url=template.photo_url,
                        status=template.status,
                    )
                )
        await session.commit()

    admin_email = os.environ.get("SEED_ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("SEED_ADMIN_PASSWORD", "adminpassword")

    async with session_maker() as session:
        result = await session.execute(select(User).where(User.email == admin_email))
        if result.scalar_one_or_none():
            await engine.dispose()
            print("Seed complete (mock dogs synced; admin already exists).")
            return

        hashed = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
        admin = User(
            id=uuid.uuid4(),
            email=admin_email,
            hashed_password=hashed,
            is_active=True,
            is_superuser=True,
            is_verified=True,
        )
        session.add(admin)
        await session.commit()

    await engine.dispose()
    print(f"Seed complete. Admin: {admin_email} / (password from SEED_ADMIN_PASSWORD or default)")


def main():
    asyncio.run(seed())


if __name__ == "__main__":
    main()
