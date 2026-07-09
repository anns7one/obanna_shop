from collections.abc import AsyncGenerator
from datetime import datetime, timezone

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.database import Base, get_db
from app.main import app
from app.models import Category, Product
from app.redis_client import get_redis

settings = get_settings()

test_engine = create_async_engine(settings.test_database_url, pool_pre_ping=True)
TestSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _prepare_schema():
    """Runs once for the whole test run: wipe and recreate every table
    against the TEST database (never the real one), from our own model
    definitions — no separate SQL file to keep in sync."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await test_engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def _clean_state():
    """Runs after every single test: empty every table and flush Redis, so
    no test can ever see data left behind by an earlier one."""
    yield
    async with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())
    await get_redis().flushdb()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """For tests that need to insert setup data directly (e.g. seed a
    product) before making HTTP requests through `client`."""
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """An HTTP client that talks to our FastAPI app in-process (no real
    network, no running server needed) — and is redirected to the test
    database instead of the real one via FastAPI's dependency_overrides."""

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with TestSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_products(db_session: AsyncSession) -> list[Product]:
    """Two products in the 'women' category, shared by catalog and order
    tests so they don't each have to redefine their own fixture data."""
    db_session.add(Category(slug="women", name="Women", description="Test category"))

    products = [
        Product(
            id="w-01",
            slug="test-dress",
            title="Test Dress",
            description="A dress for testing",
            price=100,
            compare_at_price=None,
            category="women",
            colors=["Blush"],
            sizes=["M"],
            stock=5,
            is_new=True,
            created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        ),
        Product(
            id="w-02",
            slug="test-blouse",
            title="Test Blouse",
            description="A blouse for testing",
            price=50,
            compare_at_price=80,
            category="women",
            colors=["Ivory"],
            sizes=["S", "M"],
            stock=1,
            is_new=False,
            created_at=datetime(2026, 2, 1, tzinfo=timezone.utc),
        ),
    ]
    db_session.add_all(products)
    await db_session.commit()
    return products
