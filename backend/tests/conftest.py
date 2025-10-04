import operator
from collections.abc import AsyncGenerator, Callable
from datetime import timedelta
from unittest import mock

import jwt
import pytest
from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine, Model, query
from odmantic.session import AIOSession

from src.auth import JWT_ALGORITHM, config
from src.config import get_settings
from src.models import Idea, User

from .data_sample import data, ideas, users
from .util import now_plus_delta


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


async def fake_find_one(model: Model, q: query.QueryExpression) -> Model | None:
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
def fake_db() -> mock.AsyncMock:
    fake = mock.AsyncMock()
    fake.find_one = fake_find_one
    return fake


@pytest.fixture(scope="session")
async def real_db() -> AsyncGenerator[AIOSession]:
    client: AsyncIOMotorClient = AsyncIOMotorClient(get_settings().mongodb_test_uri)
    engine = AIOEngine(client=client)
    await engine.configure_database((User, Idea))

    async with engine.session() as session:
        user_names = [user.name for user in users.values()]
        idea_names = [idea.name for idea in ideas.values()]
        try:
            await session.remove(User, query.in_(User.name, user_names))
            await session.remove(Idea, query.in_(Idea.name, idea_names))

            await session.save_all(list(users.values()))
            await session.save_all(list(ideas.values()))
            yield session
        finally:
            await session.remove(User, query.in_(User.name, user_names))
            await session.remove(Idea, query.in_(Idea.name, idea_names))


@pytest.fixture
def jwt_secret_key() -> str:
    return "test-secret-key"


@pytest.fixture
def token_encoder(jwt_secret_key) -> Callable[[str], str | None]:
    def wrapper(user_id) -> str | None:
        if not user_id:
            return None
        return jwt.encode(
            {"sub": user_id, "exp": now_plus_delta(timedelta(minutes=5))},
            jwt_secret_key,
            algorithm=JWT_ALGORITHM,
        )

    return wrapper


@pytest.fixture
def sample_user_token(token_encoder, request) -> str | None:
    user_id = str(request.param)
    return token_encoder(user_id)


@pytest.fixture
def patch_jwt_secret_key(monkeypatch, jwt_secret_key) -> Callable[[str], str]:
    def patch(secret_key=jwt_secret_key):
        monkeypatch.setattr(config, "secret_key", secret_key)
        return secret_key

    return patch
