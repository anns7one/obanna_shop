import asyncio
import sys
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

if sys.platform == "win32":
    # asyncpg is unreliable on Windows' default ProactorEventLoop (random
    # "connection was closed in the middle of operation" errors). The
    # selector-based loop doesn't have this problem. No-op on Linux/macOS
    # (i.e. inside Docker), where this file is imported just the same.
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

settings = get_settings()

engine = create_async_engine(settings.database_url, echo=False, pool_pre_ping=True)

async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Every SQLAlchemy model inherits from this. It's what lets SQLAlchemy
    discover all the tables when Alembic autogenerates a migration."""


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency: opens one database session per request, and
    always closes it afterwards (even if the request raised an error)."""
    async with async_session_factory() as session:
        yield session
