from unittest import mock

import pytest
from odmantic import query

from .data_sample import data


@pytest.fixture
def anyio_backend():
    return "asyncio"


async def fake_find_one(model, q: query.QueryExpression):
    collection = data.get(model)
    if not collection:
        return None
    for item in collection.values():
        if q == (model.id == item.id):
            return item
    return None


@pytest.fixture
def db():
    fake_db = mock.AsyncMock()
    fake_db.find_one = fake_find_one
    return fake_db
