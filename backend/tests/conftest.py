import operator
from collections.abc import Callable
from unittest import mock

import pytest
from odmantic import query

from .data_sample import data


@pytest.fixture
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
def db():
    fake_db = mock.AsyncMock()
    fake_db.find_one = fake_find_one
    fake_db.save = mock.AsyncMock()
    return fake_db
