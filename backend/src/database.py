from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine

from .config import get_settings

client = AsyncIOMotorClient(get_settings().mongodb_uri)
engine = AIOEngine(client=client)
