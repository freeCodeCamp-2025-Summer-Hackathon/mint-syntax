from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine

from .config import get_settings

client: AsyncIOMotorClient[dict[str, Any]] = AsyncIOMotorClient(
    get_settings().mongodb_uri
)
engine = AIOEngine(client=client)
