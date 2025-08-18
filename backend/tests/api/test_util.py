from unittest import mock

import pytest
from fastapi import HTTPException
from odmantic import ObjectId, query

from src.api.util import find_one_or_404
from src.models import Idea, User

data = {
    User: {
        "user1": {
            "id": ObjectId(),
            "data": {
                "username": "user",
                "name": "name of user",
                "is_active": True,
                "is_admin": False,
                "upvotes": [ObjectId() for _ in range(5)],
                "downvotes": [ObjectId() for _ in range(3)],
            },
        },
        "user2": {
            "id": ObjectId(),
            "data": {
                "username": "adminUser",
                "name": "True Admin",
                "is_active": True,
                "is_admin": True,
                "upvotes": [],
                "downvotes": [],
            },
        },
    },
    Idea: {
        "idea1": {
            "id": ObjectId(),
            "data": {
                "name": "Sample idea",
                "description": "Description of the sample idea, not very long.",
                "upvoted_by": [ObjectId() for _ in range(10)],
                "downvoted_by": [ObjectId() for _ in range(2)],
                "creator_id": ObjectId(),
            },
        },
        "idea2": {
            "id": ObjectId(),
            "data": {
                "name": "Different idea",
                "description": "Different description of the different idea, a bit longer, but still not very long.",  # noqa: E501
                "upvoted_by": [ObjectId() for _ in range(10)],
                "downvoted_by": [ObjectId() for _ in range(2)],
                "creator_id": ObjectId(),
            },
        },
    },
}


async def fake_find_one(model, q: query.QueryExpression):
    collection = data.get(model)
    if not collection:
        return None
    for item in collection.values():
        if q == (model.id == item["id"]):
            return item["data"]
    return None


@pytest.fixture
def db():
    fake_db = mock.AsyncMock()
    fake_db.find_one = fake_find_one
    return fake_db


@pytest.mark.anyio
@pytest.mark.parametrize(
    ["model", "id", "expected"],
    [
        [
            Idea,
            data[Idea]["idea1"]["id"],
            data[Idea]["idea1"]["data"],
        ],
        [
            Idea,
            data[Idea]["idea2"]["id"],
            data[Idea]["idea2"]["data"],
        ],
        [
            User,
            data[User]["user1"]["id"],
            data[User]["user1"]["data"],
        ],
        [
            User,
            data[User]["user2"]["id"],
            data[User]["user2"]["data"],
        ],
    ],
)
async def test_find_one_or_404_valid_ids(db, model, id, expected):
    result = await find_one_or_404(db, model, id)
    assert result == expected


@pytest.mark.anyio
@pytest.mark.parametrize(
    ["model", "id"],
    [
        [Idea, ObjectId()],
        [Idea, data[User]["user1"]["id"]],
        [User, ObjectId()],
        [User, data[Idea]["idea1"]["id"]],
    ],
)
async def test_find_one_or_404_invalid_ids(db, model, id):
    with pytest.raises(HTTPException) as exception:
        await find_one_or_404(db, model, id)
    assert exception.value.status_code == 404
    assert exception.value.detail == "Not found"
