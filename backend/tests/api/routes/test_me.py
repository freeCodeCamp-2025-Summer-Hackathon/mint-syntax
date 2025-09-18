import random

import pytest
from odmantic.session import AIOSession

from src.auth import verify_password
from src.models import User

from ...util import setup_ideas, setup_users, setup_votes

LOGGED_IN_PARAMS = [
    pytest.param({"is_active": True, "is_admin": False}, id="active user"),
    pytest.param({"is_active": True, "is_admin": True}, id="active admin"),
]

PASSWORD = "password"
NEW_NAME_DATA = [
    {
        "name": "new name",
    },
    {
        "name": "different new password",
    },
]

ME = "/me"
ME_IDEAS = "/me/ideas/"
ME_UPVOTES = "/me/upvotes/"
ME_DOWNVOTES = "/me/downvotes/"


def assert_idea_matches_returned(idea, returned_idea):
    assert str(idea.id) == returned_idea["id"]
    assert idea.name == returned_idea["name"]
    assert idea.description == returned_idea["description"]
    assert [str(user_id) for user_id in idea.upvoted_by] == returned_idea["upvoted_by"]
    assert [str(user_id) for user_id in idea.downvoted_by] == returned_idea[
        "downvoted_by"
    ]
    assert str(idea.creator_id) == returned_idea["creator_id"]


@pytest.fixture
async def ideas_to_vote(real_db):
    async with setup_users(real_db, 2) as users:
        user1, user2 = users
        async with (
            setup_ideas(real_db, user1, 15) as ideas1,
            setup_ideas(real_db, user2, 15) as ideas2,
        ):
            yield ideas1, ideas2


@pytest.fixture(params=LOGGED_IN_PARAMS)
async def user_with_client(log_client_as, real_db: AIOSession, request):
    user_options = request.param
    async with setup_users(real_db, **user_options) as users:
        [user] = users
        yield user, log_client_as(user)


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_me_returns_200_status_code_for_logged_in_active(
    user_with_client,
):
    _, async_client = user_with_client

    response = await async_client.get(ME)

    assert response.status_code == 200


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_me_returns_expected_user_info_for_logged_in_active(
    user_with_client,
):
    user, async_client = user_with_client

    response = await async_client.get(ME)
    data = response.json()

    assert all(
        value == data.get(key)
        for key, value in user.model_dump().items()
        if key not in {"hashed_password", "id"}
    )
    assert data["id"] == str(user.id)


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_me_does_not_return_hashed_password_in_response(
    user_with_client,
):
    _, async_client = user_with_client

    response = await async_client.get(ME)

    assert "hashed_password" not in response.json()


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize("new_name_data", NEW_NAME_DATA)
async def test_PATCH_me_returns_json_with_updated_name(user_with_client, new_name_data):
    user, async_client = user_with_client

    response = await async_client.patch(ME, json=new_name_data)
    data = response.json()

    assert user.name != new_name_data["name"]
    assert data["name"] == new_name_data["name"]


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize("new_name_data", NEW_NAME_DATA)
async def test_PATCH_me_updates_name_in_db(real_db, user_with_client, new_name_data):
    user, async_client = user_with_client

    await async_client.patch(ME, json=new_name_data)
    updated_user = await real_db.find_one(User, User.id == user.id)

    assert user.name != new_name_data["name"]
    assert updated_user.name == new_name_data["name"]


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "new_name_data",
    NEW_NAME_DATA,
)
async def test_PATCH_me_changes_name_with_password_when_old_password_is_correct(
    real_db,
    user_with_client,
    new_name_data,
):
    user, async_client = user_with_client
    new_password_data = {
        "old_password": PASSWORD,
        "new_password": "completely new password",
    }

    await async_client.patch(ME, json=new_name_data | new_password_data)
    updated_user = await real_db.find_one(User, User.id == user.id)

    assert user.name != new_name_data["name"]
    assert updated_user.name == new_name_data["name"]

    assert updated_user.hashed_password != user.hashed_password
    assert verify_password(
        new_password_data["new_password"], updated_user.hashed_password
    )


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "new_password_data",
    [
        {},
        {"new_password": "", "old_password": ""},
        {"new_password": "", "old_password": PASSWORD},
        {"hashed_password": "changed"},
    ],
)
async def test_PATCH_me_does_not_update_empty_optional_or_additional_data(
    real_db, user_with_client, new_password_data
):
    user, async_client = user_with_client

    response = await async_client.patch(ME, json=new_password_data)
    data = response.json()
    not_updated_user = await real_db.find_one(User, User.id == user.id)

    assert response.status_code == 200

    assert user.name == data["name"]

    assert not_updated_user.name == user.name
    assert verify_password(PASSWORD, not_updated_user.hashed_password)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "old_password",
    [
        "",
        "not correct password",
    ],
)
async def test_PATCH_me_returns_403_for_incorrect_old_password_if_new_is_provided(
    user_with_client, old_password
):
    _, async_client = user_with_client

    response = await async_client.patch(
        ME, json={"new_password": "different password", "old_password": old_password}
    )

    assert response.status_code == 403
    assert "Invalid password" in response.json()["detail"]


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "new_password",
    ["short"],
)
async def test_PATCH_me_incorrect_new_password(user_with_client, new_password):
    _, async_client = user_with_client

    response = await async_client.patch(
        ME,
        json={
            "old_password": PASSWORD,
            "new_password": new_password,
        },
    )

    assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    [{"name": ""}],
)
async def test_PATCH_me_returns_422_for_empty_non_empty_optional_or_invalid_data(
    user_with_client, patch_data
):
    _, async_client = user_with_client

    response = await async_client.patch(
        ME,
        json=patch_data,
    )

    assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize("new_name_data", [{"name": "new name"}, {"name": ""}])
@pytest.mark.parametrize(
    "new_password_data",
    [{}, {"old_password": PASSWORD, "new_password": "different password"}],
)
async def test_PATCH_me_does_not_return_hashed_password(
    user_with_client, new_name_data, new_password_data
):
    _, async_client = user_with_client

    response = await async_client.patch(ME, json=new_name_data | new_password_data)
    data = response.json()

    assert "hashed_password" not in data


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "ideas_count", [0, 15, *[random.randint(1, 15) for _ in range(5)]]
)
async def test_GET_me_ideas_returns_ideas_and_total_count(
    real_db, user_with_client, ideas_count
):
    user, async_client = user_with_client

    async with setup_ideas(real_db, user, ideas_count) as ideas:
        response = await async_client.get(ME_IDEAS)
        data = response.json()

        assert data["count"] == ideas_count
        assert {str(idea.id) for idea in ideas} == {idea["id"] for idea in data["data"]}


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_me_ideas_returns_ideas_with_required_fields(
    real_db, user_with_client
):
    user, async_client = user_with_client

    async with setup_ideas(real_db, user, 1) as ideas:
        [idea] = ideas
        response = await async_client.get(ME_IDEAS)
        [returned_idea] = response.json()["data"]

        assert_idea_matches_returned(idea, returned_idea)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "votes_count", [0, 15, *[random.randint(1, 15) for _ in range(5)]]
)
async def test_GET_me_upvotes_returns_upvoted_ideas_and_total_count(
    real_db, user_with_client, votes_count, ideas_to_vote
):
    user, async_client = user_with_client
    to_upvote, to_downvote = ideas_to_vote
    voted = to_upvote[:votes_count]

    async with (
        setup_votes(real_db, user, voted, "upvote"),
        setup_votes(real_db, user, to_downvote, "downvote"),
    ):
        response = await async_client.get(ME_UPVOTES)
        data = response.json()
        upvoted_ids = {idea["id"] for idea in data["data"]}

        assert data["count"] == votes_count
        assert {str(idea.id) for idea in voted} == upvoted_ids
        assert {str(idea_id) for idea_id in user.upvotes} == upvoted_ids


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "votes_count", [0, 15, *[random.randint(1, 15) for _ in range(5)]]
)
async def test_GET_me_downvotes_returns_downvoted_ideas_and_total_count(
    real_db, user_with_client, votes_count, ideas_to_vote
):
    user, async_client = user_with_client
    to_upvote, to_downvote = ideas_to_vote
    voted = to_downvote[:votes_count]

    async with (
        setup_votes(real_db, user, voted, "downvote"),
        setup_votes(real_db, user, to_upvote, "upvote"),
    ):
        response = await async_client.get(ME_DOWNVOTES)
        data = response.json()
        downvoted_ids = {idea["id"] for idea in data["data"]}

        assert data["count"] == votes_count
        assert {str(idea.id) for idea in voted} == downvoted_ids
        assert {str(idea_id) for idea_id in user.downvotes} == downvoted_ids


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_me_upvotes_returns_ideas_with_required_fields(
    real_db, user_with_client
):
    user, async_client = user_with_client

    async with setup_ideas(real_db, user, 1) as ideas:
        [idea] = ideas
        async with setup_votes(real_db, user, ideas, "upvote"):
            response = await async_client.get(ME_UPVOTES)
            [returned_idea] = response.json()["data"]

            assert_idea_matches_returned(idea, returned_idea)


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_me_downvotes_returns_ideas_with_required_fields(
    real_db, user_with_client
):
    user, async_client = user_with_client
    async with setup_ideas(real_db, user, 1) as ideas:
        [idea] = ideas
        async with setup_votes(real_db, user, ideas, "downvote"):
            response = await async_client.get(ME_DOWNVOTES)
            [returned_idea] = response.json()["data"]

            assert_idea_matches_returned(idea, returned_idea)
