from typing import Any

from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from pymongo.errors import ServerSelectionTimeoutError

from src.config import get_settings
from src.models import Idea, User


async def get_engine() -> AIOEngine:
    client: AsyncIOMotorClient[dict[str, Any]] = AsyncIOMotorClient(
        get_settings().mongodb_uri
    )
    engine = AIOEngine(client=client)
    await engine.configure_database((User, Idea))
    return engine


async def get_db():
    try:
        engine = await get_engine()
        async with engine.session() as session:
            yield session
    except ServerSelectionTimeoutError as e:
        raise HTTPException(status_code=503) from e
