import pytest
from fastapi import HTTPException
from odmantic import ObjectId

from src.api.util import find_one_or_404
from src.models import Idea, User
from tests.data_sample import ideas, users


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("model", "id", "expected"),
    [
        (
            Idea,
            ideas["idea1"].id,
            ideas["idea1"],
        ),
        (
            Idea,
            ideas["idea2"].id,
            ideas["idea2"],
        ),
        (
            User,
            users["user1"].id,
            users["user1"],
        ),
        (
            User,
            users["user2"].id,
            users["user2"],
        ),
    ],
)
async def test_find_one_or_404_valid_ids(fake_db, model, id, expected):
    result = await find_one_or_404(fake_db, model, id)
    assert result == expected


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("model", "id"),
    [
        (Idea, ObjectId()),
        (Idea, users["user1"].id),
        (User, ObjectId()),
        (User, ideas["idea1"].id),
    ],
)
async def test_find_one_or_404_invalid_ids(fake_db, model, id):
    with pytest.raises(HTTPException) as exception:
        await find_one_or_404(fake_db, model, id)
    assert exception.value.status_code == 404
    assert exception.value.detail == "Not found"
