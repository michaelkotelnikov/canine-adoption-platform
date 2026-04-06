import uuid
from collections.abc import AsyncGenerator

import bcrypt
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_async_session
from app.main import app
from app.models.dog import Dog
from app.models.user import User

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="function")
async def engine():
    eng = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    await eng.dispose()


@pytest.fixture(scope="function")
async def session_factory(engine):
    return async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


@pytest.fixture(scope="function")
async def client(session_factory) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_async_session() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_async_session] = override_get_async_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def admin_user(session_factory) -> User:
    async with session_factory() as session:
        u = User(
            id=uuid.uuid4(),
            email="admin@test.dev",
            hashed_password=bcrypt.hashpw(b"secret", bcrypt.gensalt()).decode(),
            is_active=True,
            is_superuser=True,
            is_verified=True,
        )
        session.add(u)
        await session.commit()
        await session.refresh(u)
        return u


@pytest.fixture(scope="function")
async def admin_token(client: AsyncClient, admin_user: User) -> str:
    res = await client.post(
        "/auth/jwt/login",
        data={"username": admin_user.email, "password": "secret"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.fixture(scope="function")
async def sample_dog(session_factory) -> Dog:
    async with session_factory() as session:
        d = Dog(
            name="TestDog",
            breed="Mix",
            age=4,
            sex="male",
            size="medium",
            description="Friendly.",
            photo_url="https://example.com/p.jpg",
            status="available",
        )
        session.add(d)
        await session.commit()
        await session.refresh(d)
        return d
