from contextlib import asynccontextmanager
from datetime import datetime

import pytest
from httpx import AsyncClient
from odmantic import ObjectId, query
from odmantic.session import AIOSession

from src.auth import get_current_user, verify_password
from src.models import Idea, User
from src.util import datetime_now
from tests.util import assert_in_order, setup_users

PREFIX = "/users"
USERS_REGISTER = f"{PREFIX}/"
USERS = f"{PREFIX}/"
USERS_ADD = f"{PREFIX}/add"

OLD_PASSWORD = "password"
NEW_USER_DATA = {
    "username": "test_new_username",
    "name": "Simple name",
    "password": OLD_PASSWORD,
}

INVALID_USER_DATA = [
    NEW_USER_DATA | {"name": ""},
    NEW_USER_DATA | {"username": ""},
    NEW_USER_DATA | {"password": ""},
    NEW_USER_DATA | {"password": "short"},
    {"name": NEW_USER_DATA["name"], "username": NEW_USER_DATA["username"]},
    {"name": NEW_USER_DATA["name"], "password": NEW_USER_DATA["password"]},
    {"username": NEW_USER_DATA["username"], "password": NEW_USER_DATA["password"]},
    {"name": NEW_USER_DATA["name"]},
    {"username": NEW_USER_DATA["username"]},
    {"password": NEW_USER_DATA["password"]},
]


PATCH_DATA_WITH_INITIAL_USER_OPTIONS = [
    ({"name": "Changed name"}, {}),
    ({"is_active": True}, {"is_active": False}),
    ({"is_active": False}, {"is_active": False}),
    ({"is_active": True}, {"is_active": True}),
    ({"is_active": False}, {"is_active": True}),
    ({"is_admin": True}, {"is_admin": False}),
    ({"is_admin": False}, {"is_admin": False}),
    ({"is_admin": True}, {"is_admin": True}),
    ({"is_admin": False}, {"is_admin": True}),
    (
        {"name": "Changed name", "is_active": True},
        {"is_active": False, "is_admin": False},
    ),
    (
        {"is_active": False},
        {"is_active": True, "is_admin": True},
    ),
    (
        {"is_admin": False},
        {"is_active": True, "is_admin": True},
    ),
]

USER_ME_ATTRIBUTES = (
    "id",
    "username",
    "name",
    "is_admin",
    "is_active",
    "upvotes",
    "downvotes",
    "created_at",
    "modified_at",
)


def url_for_user_id(user_id):
    return f"{PREFIX}/{user_id}"


def url_for_user_id_ideas(user_id):
    return f"{url_for_user_id(user_id)}/ideas/"


@asynccontextmanager
async def clean_up_user(real_db: AIOSession, username):
    await real_db.remove(User, User.username == username)
    yield
    await real_db.remove(User, User.username == username)


@asynccontextmanager
async def clean_added_users(real_db: AIOSession):
    prev_users = await real_db.find(User)
    yield
    new_users = await real_db.find(
        User, query.not_in(User.id, {user.id for user in prev_users})
    )
    if new_users:
        await real_db.remove(User, query.in_(User.id, {user.id for user in new_users}))


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_add_returns_user_after_adding(
    admin_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        response = await admin_client.post(USERS_ADD, data=NEW_USER_DATA)
        data = response.json()

        assert "id" in data
        assert data["name"] == NEW_USER_DATA["name"]


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_add_does_no_return_hashed_password(
    admin_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        response = await admin_client.post(USERS_ADD, data=NEW_USER_DATA)
        data = response.json()

        assert "hashed_password" not in data


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_add_adds_new_user_to_db(
    admin_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        await admin_client.post(USERS_ADD, data=NEW_USER_DATA)

        user = await real_db.find_one(User, User.username == NEW_USER_DATA["username"])

        assert user is not None
        assert user.name == NEW_USER_DATA["name"]
        assert user.username == NEW_USER_DATA["username"]
        assert verify_password(NEW_USER_DATA["password"], user.hashed_password)


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_add_returns_409_for_duplicated_username(
    admin_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        first_response = await admin_client.post(USERS_ADD, data=NEW_USER_DATA)

        assert first_response.status_code == 200

        second_response = await admin_client.post(USERS_ADD, data=NEW_USER_DATA)

        assert second_response.status_code == 409
        assert "username already exists" in second_response.text.casefold()


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "invalid_new_user_data",
    INVALID_USER_DATA,
)
async def test_POST_users_add_returns_422_for_invalid_fields(
    admin_client: AsyncClient, invalid_new_user_data, real_db: AIOSession
):
    async with clean_added_users(real_db):
        response = await admin_client.post(USERS_ADD, data=invalid_new_user_data)

        assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_register_returns_user_in_login_data_after_registering(
    async_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        response = await async_client.post(USERS_REGISTER, data=NEW_USER_DATA)
        data = response.json()

        assert "user_data" in data
        user_data = data["user_data"]
        assert "id" in user_data
        assert user_data["name"] == NEW_USER_DATA["name"]
        assert user_data["username"] == NEW_USER_DATA["username"]
        assert user_data["is_active"] is True
        assert user_data["is_admin"] is False
        assert user_data["upvotes"] == []
        assert user_data["downvotes"] == []


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_register_returns_token_in_login_data_after_registering(
    async_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        response = await async_client.post(USERS_REGISTER, data=NEW_USER_DATA)
        data = response.json()

        assert "token" in data
        token_data = data["token"]
        assert token_data["token_type"] == "bearer"

        user = await get_current_user(real_db, token_data["access_token"])
        assert user.username == NEW_USER_DATA["username"]


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_register_does_no_return_hashed_password(
    admin_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        response = await admin_client.post(USERS_REGISTER, data=NEW_USER_DATA)
        user_data = response.json()["user_data"]

        assert "hashed_password" not in user_data


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_register_adds_new_user_to_db(
    admin_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        await admin_client.post(USERS_REGISTER, data=NEW_USER_DATA)

        user = await real_db.find_one(User, User.username == NEW_USER_DATA["username"])

        assert user is not None
        assert user.name == NEW_USER_DATA["name"]
        assert user.username == NEW_USER_DATA["username"]
        assert verify_password(NEW_USER_DATA["password"], user.hashed_password)


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_users_register_returns_409_for_duplicated_username(
    admin_client: AsyncClient, real_db: AIOSession
):
    async with clean_up_user(real_db, NEW_USER_DATA["username"]):
        first_response = await admin_client.post(USERS_REGISTER, data=NEW_USER_DATA)

        assert first_response.status_code == 200

        second_response = await admin_client.post(USERS_REGISTER, data=NEW_USER_DATA)

        assert second_response.status_code == 409
        assert "username already exists" in second_response.text.casefold()


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "invalid_new_user_data",
    INVALID_USER_DATA,
)
async def test_POST_users_register_returns_422_for_invalid_fields(
    admin_client: AsyncClient, invalid_new_user_data, real_db: AIOSession
):
    async with clean_added_users(real_db):
        response = await admin_client.post(USERS_REGISTER, data=invalid_new_user_data)

        assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize("additional_users", [0, 10, 15])
async def test_GET_users_returns_users_with_user_me(
    admin_client: AsyncClient, real_db: AIOSession, additional_users
):
    response = await admin_client.get(USERS)
    initial_count = response.json()["count"]
    async with setup_users(real_db, additional_users):
        response = await admin_client.get(USERS)
        data = response.json()
        users = data["users"]

        assert initial_count + additional_users == data["count"]
        if len(users) > 0:
            user = users[0]

            for key in USER_ME_ATTRIBUTES:
                assert key in user


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize("additional_users", [0, 10, 15])
async def test_GET_users_returns_users_with_user_me_ordere_by_name(
    admin_client: AsyncClient, real_db: AIOSession, additional_users
):
    async with setup_users(real_db, additional_users):
        response = await admin_client.get(USERS)
        data = response.json()
        user_names = [user["name"] for user in data["users"]]

        assert_in_order(user_names)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.usefixtures("user")
async def test_GET_users_does_not_return_hashed_password_in_user_data(
    admin_client: AsyncClient,
):
    response = await admin_client.get(USERS)
    data = response.json()
    users = data["users"]

    for user in users:
        assert "hashed_password" not in user


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user",
    [
        {"is_admin": True, "is_active": True},
        {"is_admin": False, "is_active": True},
        {"is_admin": True, "is_active": False},
        {"is_admin": False, "is_active": False},
    ],
    indirect=True,
)
async def test_GET_users_id_returns_user_me(
    admin_client: AsyncClient,
    user: User,
):
    response = await admin_client.get(url_for_user_id(user.id))
    data = response.json()

    assert data["id"] == str(user.id)
    assert data["username"] == user.username
    assert data["name"] == user.name
    assert data["is_active"] is user.is_active
    assert data["is_admin"] is user.is_admin
    assert data["downvotes"] == []
    assert data["upvotes"] == []


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_users_id_does_not_return_hashed_password(
    admin_client: AsyncClient, user: User
):
    response = await admin_client.get(url_for_user_id(user.id))
    data = response.json()

    assert "hashed_password" not in data


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    ("bad_id", "status_code"),
    [
        pytest.param("notobjectid", 422, id="not valid object id"),
        pytest.param("/", 404, id="empty id"),
    ],
)
async def test_GET_users_id_returns_4xx_when_id_is_invalid(
    admin_client: AsyncClient, bad_id, status_code
):
    response = await admin_client.get(url_for_user_id(bad_id))

    assert response.status_code == status_code


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_users_id_returns_404_when_id_does_not_exist(
    admin_client: AsyncClient, real_db: AIOSession
):
    async with setup_users(real_db, 1) as users:
        [user] = users

    removed_user_id = user.id
    response = await admin_client.get(url_for_user_id(removed_user_id))

    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    ("bad_id", "status_code"),
    [
        pytest.param("notobjectid", 422, id="not valid object id"),
        pytest.param("/", 404, id="empty id"),
    ],
)
async def test_GET_users_id_ideas_returns_4xx_when_id_is_invalid(
    admin_client: AsyncClient, bad_id, status_code
):
    response = await admin_client.get(url_for_user_id_ideas(bad_id))

    assert response.status_code == status_code


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_users_id_ideas_returns_username_in_data(
    admin_client: AsyncClient, user: User
):
    response = await admin_client.get(url_for_user_id_ideas(user.id))
    data = response.json()

    assert "username" in data
    assert data["username"] == user.username


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_with_ideas",
    [0, 15, 40],
    indirect=True,
)
async def test_GET_users_id_ideas_returns_user_ideas_count_in_data(
    admin_client: AsyncClient, user_with_ideas: tuple[User, list[Idea], int]
):
    user, _, ideas_count = user_with_ideas
    response = await admin_client.get(url_for_user_id_ideas(user.id))
    data = response.json()

    assert "count" in data
    assert data["count"] == ideas_count


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_with_ideas",
    [5, 10, 15],
    indirect=True,
)
async def test_GET_users_id_ideas_returns_user_ideas_in_data(
    admin_client: AsyncClient, user_with_ideas: tuple[User, list[Idea], int]
):
    user, ideas, _ = user_with_ideas
    response = await admin_client.get(url_for_user_id_ideas(user.id))
    data = response.json()
    expected_ids = {str(idea.id) for idea in ideas}

    assert "data" in data
    returned_ids = {idea["id"] for idea in data["data"]}
    assert expected_ids == returned_ids
    assert data["username"] == user.username


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_with_ideas",
    [1],
    indirect=True,
)
async def test_GET_users_id_ideas_returns_expected_idea_data_in_user_ideas(
    admin_client: AsyncClient, user_with_ideas: tuple[User, list[Idea], int]
):
    user, ideas, _ = user_with_ideas
    [idea] = ideas
    response = await admin_client.get(url_for_user_id_ideas(user.id))
    data = response.json()
    [returned_idea] = data["data"]

    assert returned_idea["id"] == str(idea.id)
    assert returned_idea["name"] == idea.name
    assert returned_idea["description"] == idea.description
    assert returned_idea["upvoted_by"] == []
    assert returned_idea["downvoted_by"] == []
    assert returned_idea["creator_id"] == str(user.id)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_with_ideas",
    [5, 10, 15],
    indirect=True,
)
async def test_GET_users_id_ideas_returns_user_ideas_in_data_ordered_by_name(
    admin_client: AsyncClient, user_with_ideas: tuple[User, list[Idea], int]
):
    user, _, _ = user_with_ideas
    response = await admin_client.get(url_for_user_id_ideas(user.id))
    data = response.json()
    returned_ideas_names = [idea["name"] for idea in data["data"]]

    assert_in_order(returned_ideas_names)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    ("patch_data", "user"),
    PATCH_DATA_WITH_INITIAL_USER_OPTIONS,
    indirect=["user"],
)
async def test_PATCH_users_id_returns_updated_user_after_patch(
    admin_client: AsyncClient, user: User, patch_data
):
    response = await admin_client.patch(url_for_user_id(user.id), json=patch_data)
    data = response.json()

    assert data["name"] == patch_data.get("name", user.name)
    assert data["username"] == user.username
    assert data["is_active"] == patch_data.get("is_active", user.is_active)
    assert data["is_admin"] == patch_data.get("is_admin", user.is_admin)

    assert datetime.fromisoformat(data["created_at"]) == user.created_at


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    ("patch_data", "user"),
    PATCH_DATA_WITH_INITIAL_USER_OPTIONS,
    indirect=["user"],
)
async def test_PATCH_users_id_saves_changes_in_db(
    admin_client: AsyncClient, real_db: AIOSession, patch_data, user: User
):
    response = await admin_client.patch(url_for_user_id(user.id), json=patch_data)

    assert response.status_code == 200

    updated_user = await real_db.find_one(User, User.id == user.id)

    assert updated_user is not None
    assert updated_user.name == patch_data.get("name", user.name)
    assert updated_user.is_active == patch_data.get("is_active", user.is_active)
    assert updated_user.is_admin == patch_data.get("is_admin", user.is_admin)
    assert updated_user.name == patch_data.get("name", user.name)

    assert updated_user.username == user.username
    assert updated_user.upvotes == user.upvotes
    assert updated_user.downvotes == user.downvotes

    assert updated_user.created_at == user.created_at


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    ("patch_data", "user"),
    PATCH_DATA_WITH_INITIAL_USER_OPTIONS,
    indirect=["user"],
)
async def test_PATCH_users_id_changes_modified_at(
    admin_client: AsyncClient, real_db: AIOSession, patch_data, user: User
):
    response = await admin_client.patch(url_for_user_id(user.id), json=patch_data)
    data = response.json()

    assert response.status_code == 200

    updated_user = await real_db.find_one(User, User.id == user.id)
    now = datetime_now()

    assert updated_user is not None
    assert now > datetime.fromisoformat(data["modified_at"]) > user.modified_at
    assert now > updated_user.modified_at > user.modified_at


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    [
        {"name": "changed name"},
        {"new_password": "some different one"},
        {"is_admin": True, "is_active": True},
        {"is_admin": False, "is_active": False},
    ],
)
async def test_PATCH_users_id_returns_user_me_after_patch(
    admin_client: AsyncClient, patch_data, user: User
):
    response = await admin_client.patch(url_for_user_id(user.id), json=patch_data)
    data = response.json()

    for key in USER_ME_ATTRIBUTES:
        assert key in data


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "new_password", ["completely new password", "different new password"]
)
async def test_PATCH_users_id_updates_hashed_password_if_new_password_patched(
    admin_client: AsyncClient, real_db: AIOSession, user: User, new_password
):
    response = await admin_client.patch(
        url_for_user_id(user.id),
        json={"new_password": new_password},
    )

    assert response.status_code == 200

    updated_user = await real_db.find_one(User, User.id == user.id)

    assert updated_user is not None
    assert updated_user.hashed_password != user.hashed_password
    assert verify_password(new_password, updated_user.hashed_password)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    [
        {"new_password": ""},
        {"upvotes": [str(ObjectId())], "downvotes": [str(ObjectId())]},
        {"hashed_password": "changed"},
    ],
)
async def test_PATCH_users_id_does_not_update_empty_optional_or_additional_data(
    admin_client: AsyncClient, real_db: AIOSession, user: User, patch_data
):
    response = await admin_client.patch(url_for_user_id(user.id), json=patch_data)

    assert response.status_code == 200

    data = response.json()
    not_updated_user = await real_db.find_one(User, User.id == user.id)

    assert not_updated_user is not None
    assert data["name"] == user.name
    assert verify_password(OLD_PASSWORD, not_updated_user.hashed_password)
    assert not_updated_user.username == user.username
    assert not_updated_user.upvotes == user.upvotes
    assert not_updated_user.downvotes == user.downvotes


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "invalid_fields_patch",
    [
        {"new_password": "short"},
        {"name": ""},
        {"name": "too_long" * 32},
        {"is_admin": "not"},
        {"is_active": "maybe"},
    ],
)
async def test_PATCH_users_id_returns_422_for_missing_required_or_invalid_data(
    admin_client: AsyncClient, invalid_fields_patch, user: User
):
    response = await admin_client.patch(
        url_for_user_id(user.id), json=invalid_fields_patch
    )

    assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    [
        {"name": "different name"},
        {"new_password": "new password"},
        {"is_active": True},
        {"is_active": False},
        {"is_admin": True},
        {"is_admin": False},
    ],
)
async def test_PATCH_users_id_does_not_return_hashed_password_in_user_data(
    admin_client: AsyncClient, patch_data, user: User
):
    response = await admin_client.patch(url_for_user_id(user.id), json=patch_data)
    data = response.json()

    assert response.status_code == 200
    assert "hashed_password" not in data
