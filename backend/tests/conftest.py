import operator
from collections.abc import Callable
from unittest import mock

import pytest
from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine, query

from src.config import get_settings
from src.models import Idea, User

from .data_sample import data, ideas, users


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


async def fake_find_one(model, q: query.QueryExpression):
    operations: dict[str, Callable] = {
        "$eq": operator.eq,
        "$ne": operator.ne,
        "$gt": operator.gt,
        "$gte": operator.ge,
        "$lt": operator.lt,
        "$lte": operator.le,
        "$in_": operator.contains,
        "$not_in": lambda a, b: not operator.contains(a, b),
    }
    collection = data.get(model)
    if not collection:
        return None
    for item in collection.values():
        if all(
            operations[op](value, getattr(item, field if field != "_id" else "id"))
            for field, field_query in q.items()
            for op, value in field_query.items()
        ):
            return item
    return None


@pytest.fixture
def fake_db():
    fake = mock.AsyncMock()
    fake.find_one = fake_find_one
    return fake


@pytest.fixture(scope="session")
async def real_db():
    client = AsyncIOMotorClient(get_settings().mongodb_test_uri)
    engine = AIOEngine(client=client)
    await engine.configure_database((User, Idea))

    async with engine.session() as session:
        for user in users.values():
            await session.save(user)
        for idea in ideas.values():
            await session.save(idea)

        yield session

        for user in users.values():
            await session.delete(user)
        for idea in ideas.values():
            await session.delete(idea)
