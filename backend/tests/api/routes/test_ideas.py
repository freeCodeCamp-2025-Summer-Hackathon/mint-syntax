from contextlib import asynccontextmanager

import pytest
from httpx import AsyncClient
from odmantic import ObjectId, query
from odmantic.session import AIOSession

from src.models import Idea, IdeaDownvote, IdeaUpvote, User

from ...util import (
    add_votes,
    create_idea,
    create_user,
    setup_idea,
    setup_ideas,
)

DOWNVOTE = "downvote"
UPVOTE = "upvote"

IDEAS_COUNT = "/ideas/count"


def url_to_vote(vote: IdeaDownvote | IdeaUpvote):
    which = DOWNVOTE if isinstance(vote, IdeaDownvote) else UPVOTE
    return f"/ideas/{vote.idea_id}/{which}"


@asynccontextmanager
async def clean_new_ideas(real_db: AIOSession):
    prev_ideas = await real_db.find(Idea)
    yield
    new_ideas = await real_db.find(
        Idea, query.not_in(Idea.id, {idea.id for idea in prev_ideas})
    )
    if new_ideas:
        await real_db.remove(Idea, query.in_(Idea.id, {idea.id for idea in new_ideas}))


@pytest.fixture
async def idea_with_votes(real_db, request):
    max_upvotes = request.param
    async with setup_idea(real_db, max_upvotes=max_upvotes) as idea:
        yield idea


@pytest.fixture(params=[0, 5, 10])
async def idea_to_delete_with_votes(real_db, user, request):
    max_upvotes = request.param
    async with clean_new_ideas(real_db):
        idea = create_idea(user)
        users = [create_user() for _ in range(10)]

        add_votes(users, idea, max_upvotes)

        await real_db.save_all(users)
        await real_db.save(idea)
        yield idea

        await real_db.remove(User, query.in_(User.id, {user.id for user in users}))


async def setup_upvote(real_db: AIOSession, idea, user):
    idea.upvoted_by.append(user.id)
    user.upvotes.append(idea.id)
    await real_db.save_all((idea, user))


async def setup_downvote(real_db: AIOSession, idea, user):
    idea.downvoted_by.append(user.id)
    user.downvotes.append(idea.id)
    await real_db.save_all((idea, user))


UPVOTE_CASES = [
    pytest.param(setup_upvote, id="voting upvote, with previous vote - upvote"),
    pytest.param(setup_downvote, id="voting upvote, with previous vote - upvote"),
    pytest.param(
        None,
        id="voting upvote, with no previous vote",
    ),
]

DOWNVOTE_CASES = [
    pytest.param(
        setup_downvote,
        id="voting downvote, with previous vote - downvote",
    ),
    pytest.param(
        setup_upvote,
        id="voting downvote, with previous vote - upvote",
    ),
    pytest.param(
        None,
        id="voting downvote, with no previous vote",
    ),
]

INVALID_IDEA_ID_CASES = [
    "not-objectid",
    "",
    pytest.param(ObjectId(), marks=pytest.mark.xfail(reason="not decided behavior")),
]

IDEA_PATCH_DATA = {
    "name": "Test changed name",
    "description": "Very changed description.",
}

IDEA_PATCH_CASES = [
    IDEA_PATCH_DATA,
    {"name": IDEA_PATCH_DATA["name"]},
    {"description": IDEA_PATCH_DATA["description"]},
]


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "setup",
    UPVOTE_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [0, 5, 10],
    indirect=True,
)
async def test_PUT_upvote_idea_returns_upvoted_idea(
    real_db: AIOSession,
    idea_with_votes,
    user_with_client,
    setup,
):
    user, async_client = user_with_client
    user_id = str(user.id)
    if setup is not None:
        await setup(real_db, idea_with_votes, user)
    vote = IdeaUpvote(idea_id=idea_with_votes.id)

    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": str(idea_with_votes.id)}
    )
    data = response.json()

    assert response.status_code == 200
    assert user_id in data["upvoted_by"]
    assert user_id not in data["downvoted_by"]

    assert data["name"] == idea_with_votes.name
    assert data["description"] == idea_with_votes.description
    assert data["creator_id"] == str(idea_with_votes.creator_id)
    assert set(data["downvoted_by"]) == {
        str(user_id) for user_id in idea_with_votes.downvoted_by
    } - {user_id}
    assert set(data["upvoted_by"]) == {
        str(user_id) for user_id in idea_with_votes.upvoted_by
    } | {user_id}


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "setup",
    UPVOTE_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [0, 5, 10],
    indirect=True,
)
async def test_PUT_upvote_idea_updates_idea_in_db(
    real_db: AIOSession, idea_with_votes, user_with_client, setup
):
    user, async_client = user_with_client
    if setup is not None:
        await setup(real_db, idea_with_votes, user)
    vote = IdeaUpvote(idea_id=idea_with_votes.id)

    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": str(idea_with_votes.id)}
    )

    assert response.status_code == 200

    updated_idea = await real_db.find_one(Idea, Idea.id == idea_with_votes.id)

    assert updated_idea is not None
    assert set(updated_idea.upvoted_by) == set(idea_with_votes.upvoted_by) | {user.id}
    assert set(updated_idea.downvoted_by) == set(idea_with_votes.downvoted_by) - {
        user.id
    }

    assert updated_idea.name == idea_with_votes.name
    assert updated_idea.description == idea_with_votes.description
    assert updated_idea.creator_id == idea_with_votes.creator_id


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "setup",
    UPVOTE_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [0, 5, 10],
    indirect=True,
)
async def test_PUT_upvote_idea_updates_user_in_db(
    real_db: AIOSession, idea_with_votes, user_with_client, setup
):
    user, async_client = user_with_client
    if setup is not None:
        await setup(real_db, idea_with_votes, user)
    vote = IdeaUpvote(idea_id=idea_with_votes.id)

    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": str(idea_with_votes.id)}
    )

    assert response.status_code == 200

    updated_user = await real_db.find_one(User, User.id == user.id)

    assert updated_user is not None
    assert set(updated_user.downvotes) == set(user.downvotes) - {idea_with_votes.id}
    assert set(updated_user.upvotes) == set(user.upvotes) | {idea_with_votes.id}

    assert updated_user.name == user.name
    assert updated_user.username == user.username
    assert updated_user.is_admin == user.is_admin
    assert updated_user.is_active == user.is_active
    assert updated_user.hashed_password == user.hashed_password


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "setup",
    UPVOTE_CASES,
)
@pytest.mark.parametrize(
    "invalid_idea_id",
    INVALID_IDEA_ID_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [1],
    indirect=True,
)
async def test_PUT_upvote_idea_returns_422_when_invalid_data(
    real_db: AIOSession,
    idea_with_votes,
    user_with_client,
    setup,
    invalid_idea_id,
):
    user, async_client = user_with_client
    if setup is not None:
        await setup(real_db, idea_with_votes, user)
    vote = IdeaUpvote(idea_id=idea_with_votes.id)

    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": invalid_idea_id}
    )

    assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
async def test_PUT_upvote_idea_returns_404_when_idea_id_does_not_exist(
    real_db: AIOSession,
    user_with_client,
):
    async with setup_idea(real_db) as idea:
        pass

    non_existing_idea_id = str(idea.id)
    _, async_client = user_with_client

    vote = IdeaUpvote(idea_id=ObjectId(non_existing_idea_id))
    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": non_existing_idea_id}
    )

    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "setup",
    DOWNVOTE_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [0, 5, 10],
    indirect=True,
)
async def test_PUT_downvote_idea_returns_downvoted_idea(
    real_db: AIOSession, idea_with_votes, user_with_client, setup
):
    user, async_client = user_with_client
    user_id = str(user.id)
    if setup is not None:
        await setup(real_db, idea_with_votes, user)
    vote = IdeaDownvote(idea_id=idea_with_votes.id)

    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": str(idea_with_votes.id)}
    )
    data = response.json()

    assert response.status_code == 200
    assert user_id in data["downvoted_by"]
    assert user_id not in data["upvoted_by"]

    assert data["name"] == idea_with_votes.name
    assert data["description"] == idea_with_votes.description
    assert data["creator_id"] == str(idea_with_votes.creator_id)
    assert set(data["downvoted_by"]) == {
        str(user_id) for user_id in idea_with_votes.downvoted_by
    } | {user_id}
    assert set(data["upvoted_by"]) == {
        str(user_id) for user_id in idea_with_votes.upvoted_by
    } - {user_id}


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "setup",
    DOWNVOTE_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [0, 5, 10],
    indirect=True,
)
async def test_PUT_downvote_idea_updates_idea_in_db(
    real_db: AIOSession, idea_with_votes, user_with_client, setup
):
    user, async_client = user_with_client
    if setup is not None:
        await setup(real_db, idea_with_votes, user)
    vote = IdeaDownvote(idea_id=idea_with_votes.id)

    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": str(idea_with_votes.id)}
    )

    assert response.status_code == 200

    updated_idea = await real_db.find_one(Idea, Idea.id == idea_with_votes.id)

    assert updated_idea is not None
    assert set(updated_idea.downvoted_by) == set(idea_with_votes.downvoted_by) | {
        user.id
    }
    assert set(updated_idea.upvoted_by) == set(idea_with_votes.upvoted_by) - {user.id}

    assert updated_idea.name == idea_with_votes.name
    assert updated_idea.description == idea_with_votes.description
    assert updated_idea.creator_id == idea_with_votes.creator_id


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "setup",
    DOWNVOTE_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [0, 5, 10],
    indirect=True,
)
async def test_PUT_downvote_idea_updates_user_in_db(
    real_db: AIOSession,
    idea_with_votes,
    user_with_client,
    setup,
):
    user, async_client = user_with_client
    if setup is not None:
        await setup(real_db, idea_with_votes, user)
    vote = IdeaDownvote(idea_id=idea_with_votes.id)

    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": str(idea_with_votes.id)}
    )

    assert response.status_code == 200

    updated_user = await real_db.find_one(User, User.id == user.id)

    assert updated_user is not None
    assert set(updated_user.downvotes) == set(user.downvotes) | {idea_with_votes.id}
    assert set(updated_user.upvotes) == set(user.upvotes) - {idea_with_votes.id}

    assert updated_user.name == user.name
    assert updated_user.username == user.username
    assert updated_user.is_admin == user.is_admin
    assert updated_user.is_active == user.is_active
    assert updated_user.hashed_password == user.hashed_password


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "setup",
    DOWNVOTE_CASES,
)
@pytest.mark.parametrize(
    "invalid_idea_id",
    INVALID_IDEA_ID_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [1],
    indirect=True,
)
async def test_PUT_downvote_idea_returns_422_when_invalid_data(
    real_db: AIOSession,
    idea_with_votes,
    user_with_client,
    setup,
    invalid_idea_id,
):
    user, async_client = user_with_client
    if setup is not None:
        await setup(real_db, idea_with_votes, user)
    vote = IdeaDownvote(idea_id=idea_with_votes.id)

    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": invalid_idea_id}
    )

    assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
async def test_PUT_downvote_idea_returns_404_when_idea_id_does_not_exist(
    real_db: AIOSession,
    user_with_client,
):
    async with setup_idea(real_db) as idea:
        pass

    non_existing_idea_id = str(idea.id)
    _, async_client = user_with_client

    vote = IdeaDownvote(idea_id=ObjectId(non_existing_idea_id))
    response = await async_client.put(
        url_to_vote(vote), json={"idea_id": non_existing_idea_id}
    )

    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "additional_ideas",
    [0, 5, 15, 40],
)
async def test_GET_count_returns_total_number_of_ideas(
    real_db: AIOSession, user, user_with_client, additional_ideas
):
    initial_ideas = await real_db.count(Idea)

    async with setup_ideas(real_db, user, additional_ideas):
        _, async_client = user_with_client

        response = await async_client.get(IDEAS_COUNT)
        data = response.json()

        assert response.status_code == 200
        assert data == initial_ideas + additional_ideas


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "idea_with_votes",
    [0, 10, 15],
    indirect=True,
)
async def test_GET_ideas_id_returns_idea_data(user_with_client, idea_with_votes):
    _, async_client = user_with_client
    response = await async_client.get(f"/ideas/{idea_with_votes.id}")
    data = response.json()

    assert response.status_code == 200
    assert data["name"] == idea_with_votes.name
    assert data["description"] == idea_with_votes.description
    assert data["creator_id"] == str(idea_with_votes.creator_id)
    assert set(data["upvoted_by"]) == {
        str(user_id) for user_id in idea_with_votes.upvoted_by
    }
    assert set(data["downvoted_by"]) == {
        str(user_id) for user_id in idea_with_votes.downvoted_by
    }


@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_ideas_id_returns_404_if_idea_does_not_exist(
    real_db: AIOSession, user_with_client
):
    async with setup_idea(real_db) as idea:
        pass

    removed_idea_id = idea.id
    _, async_client = user_with_client
    response = await async_client.get(f"/ideas/{removed_idea_id}")
    data = response.json()

    assert response.status_code == 404
    assert "not found".casefold() in data["detail"].casefold()


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize("invalid_id", ["random", "not-object-id"])
async def test_GET_ideas_id_returns_422_if_idea_id_is_invalid(
    user_with_client, invalid_id
):
    _, async_client = user_with_client
    response = await async_client.get(f"/ideas/{invalid_id}")

    assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
async def test_DELETE_ideas_id_returns_success_message(
    admin_client: AsyncClient, idea_to_delete_with_votes: Idea
):
    response = await admin_client.delete(f"/ideas/{idea_to_delete_with_votes.id}")
    data = response.json()

    assert response.status_code == 200
    assert "deleted successfully" in data["message"].casefold()


@pytest.mark.integration
@pytest.mark.anyio
async def test_DELETE_ideas_id_deletes_idea_from_db(
    real_db: AIOSession, admin_client: AsyncClient, idea_to_delete_with_votes: Idea
):
    response = await admin_client.delete(f"/ideas/{idea_to_delete_with_votes.id}")

    assert response.status_code == 200

    deleted_idea = await real_db.find_one(Idea, Idea.id == idea_to_delete_with_votes.id)

    assert deleted_idea is None


@pytest.mark.xfail(reason="not implemented")
@pytest.mark.integration
@pytest.mark.anyio
async def test_DELETE_ideas_id_deletes_votes_from_users(
    real_db: AIOSession, admin_client: AsyncClient, idea_to_delete_with_votes: Idea
):
    voted_by = (
        idea_to_delete_with_votes.upvoted_by + idea_to_delete_with_votes.downvoted_by
    )

    response = await admin_client.delete(f"/ideas/{idea_to_delete_with_votes.id}")

    assert response.status_code == 200

    voters = await real_db.find(User, query.in_(User.id, set(voted_by)))

    for voter in voters:
        assert idea_to_delete_with_votes.id not in voter.upvotes
        assert idea_to_delete_with_votes.id not in voter.downvotes


@pytest.mark.integration
@pytest.mark.anyio
async def test_DELETE_ideas_id_returns_404_when_idea_does_not_exist(
    real_db: AIOSession, admin_client: AsyncClient
):
    async with setup_idea(real_db) as idea:
        pass

    non_existing_idea_id = idea.id

    response = await admin_client.delete(f"/ideas/{non_existing_idea_id}")

    assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "invalid_id",
    ["random", "not-object-id"],
)
async def test_DELETE_ideas_id_returns_422_when_idea_id_is_invalid(
    admin_client: AsyncClient, invalid_id
):
    response = await admin_client.delete(f"/ideas/{invalid_id}")

    assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    IDEA_PATCH_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [10],
    indirect=True,
)
async def test_PATCH_ideas_id_returns_idea_public_after_patch_for_admin(
    admin_client: AsyncClient, idea_with_votes: Idea, patch_data
):
    response = await admin_client.patch(f"/ideas/{idea_with_votes.id}", json=patch_data)
    data = response.json()

    assert response.status_code == 200

    assert data["name"] == patch_data.get("name", idea_with_votes.name)
    assert data["description"] == patch_data.get(
        "description", idea_with_votes.description
    )

    assert set(data["upvoted_by"]) == {
        str(user_id) for user_id in idea_with_votes.upvoted_by
    }
    assert set(data["downvoted_by"]) == {
        str(user_id) for user_id in idea_with_votes.downvoted_by
    }
    assert data["creator_id"] == str(idea_with_votes.creator_id)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    IDEA_PATCH_CASES,
)
async def test_PATCH_ideas_id_retures_idea_public_after_patch_for_idea_creator(
    real_db: AIOSession, user_with_client: tuple[User, AsyncClient], patch_data
):
    user, async_client = user_with_client
    async with setup_idea(real_db, user) as idea:
        response = await async_client.patch(f"/ideas/{idea.id}", json=patch_data)
        data = response.json()

        assert response.status_code == 200

        assert data["name"] == patch_data.get("name", idea.name)
        assert data["description"] == patch_data.get("description", idea.description)

        assert set(data["upvoted_by"]) == {str(user_id) for user_id in idea.upvoted_by}
        assert set(data["downvoted_by"]) == {
            str(user_id) for user_id in idea.downvoted_by
        }
        assert data["creator_id"] == str(idea.creator_id)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    IDEA_PATCH_CASES,
)
@pytest.mark.parametrize(
    "idea_with_votes",
    [10],
    indirect=True,
)
async def test_PATCH_ideas_id_updates_idea_in_db_for_admin(
    real_db: AIOSession, admin_client: AsyncClient, idea_with_votes, patch_data
):
    response = await admin_client.patch(f"/ideas/{idea_with_votes.id}", json=patch_data)

    assert response.status_code == 200

    updated_idea = await real_db.find_one(Idea, Idea.id == idea_with_votes.id)

    assert updated_idea is not None

    assert updated_idea.name == patch_data.get("name", idea_with_votes.name)
    assert updated_idea.description == patch_data.get(
        "description", idea_with_votes.description
    )

    assert set(updated_idea.upvoted_by) == set(idea_with_votes.upvoted_by)
    assert set(updated_idea.downvoted_by) == set(idea_with_votes.downvoted_by)
    assert updated_idea.creator_id == idea_with_votes.creator_id


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    IDEA_PATCH_CASES,
)
async def test_PATCH_ideas_id_updates_idea_in_db_for_idea_creator(
    real_db: AIOSession, user_with_client: tuple[User, AsyncClient], patch_data
):
    user, async_client = user_with_client
    async with setup_idea(real_db, user) as idea:
        response = await async_client.patch(f"/ideas/{idea.id}", json=patch_data)

        assert response.status_code == 200

        updated_idea = await real_db.find_one(Idea, Idea.id == idea.id)

        assert updated_idea is not None

        assert updated_idea.name == patch_data.get("name", idea.name)
        assert updated_idea.description == patch_data.get(
            "description", idea.description
        )

        assert set(updated_idea.upvoted_by) == set(idea.upvoted_by)
        assert set(updated_idea.downvoted_by) == set(idea.downvoted_by)
        assert updated_idea.creator_id == idea.creator_id


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "invalid_patch_data",
    [{"name": ""}, {"name": "too_long" * (255 // len("too_long") + 1)}],
)
async def test_PATCH_ideas_id_returns_422_when_required_data_is_invalid_or_empty(
    real_db: AIOSession, user_with_client: tuple[User, AsyncClient], invalid_patch_data
):
    user, async_client = user_with_client
    async with setup_idea(real_db, user) as idea:
        response = await async_client.patch(
            f"/ideas/{idea.id}", json=invalid_patch_data
        )

        assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "invalid_idea_id",
    ["not-objectid"],
)
@pytest.mark.parametrize(
    "patch_data",
    IDEA_PATCH_CASES,
)
async def test_PATCH_ideas_id_returns_422_when_idea_id_is_invalid(
    admin_client, invalid_idea_id, patch_data
):
    response = await admin_client.patch(f"/ideas/{invalid_idea_id}", json=patch_data)

    assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "patch_data",
    IDEA_PATCH_CASES,
)
@pytest.mark.parametrize("idea_with_votes", [5, 10], indirect=True)
@pytest.mark.parametrize(
    "user_with_client",
    [{"is_admin": False, "is_active": True}],
    indirect=True,
)
async def test_PATCH_ideas_id_returns_403_if_not_admin_and_not_idea_creator(
    user_with_client: tuple[User, AsyncClient], idea_with_votes: Idea, patch_data
):
    _, async_client = user_with_client
    response = await async_client.patch(f"/ideas/{idea_with_votes.id}", json=patch_data)

    assert response.status_code == 403
