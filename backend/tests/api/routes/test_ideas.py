import random

import pytest
from odmantic import ObjectId
from odmantic.session import AIOSession

from src.models import Idea, IdeaDownvote, IdeaUpvote, User

from ...util import setup_ideas, setup_users

DOWNVOTE = "downvote"
UPVOTE = "upvote"

IDEAS_COUNT = "/ideas/count"


def url_to_vote(vote: IdeaDownvote | IdeaUpvote):
    which = DOWNVOTE if isinstance(vote, IdeaDownvote) else UPVOTE
    return f"/ideas/{vote.idea_id}/{which}"


@pytest.fixture
async def user_fixture(real_db, request):
    user_options = request.param if hasattr(request, "param") else {}
    async with setup_users(real_db, **user_options) as users:
        [user] = users
        yield user


@pytest.fixture
async def idea_with_votes(real_db, user_fixture, request):
    max_upvotes = request.param
    async with setup_ideas(real_db, user_fixture, 1) as ideas:
        [idea] = ideas
        async with setup_users(real_db, 10) as users:
            upvotes_count = random.randint(0, max_upvotes)
            upvotes = users[:upvotes_count]
            downvotes = users[upvotes_count:]
            for downvoting_user in upvotes:
                idea.upvoted_by.append(downvoting_user.id)
                downvoting_user.upvotes.append(idea.id)
            for downvoting_user in downvotes:
                idea.downvoted_by.append(downvoting_user.id)
                downvoting_user.downvotes.append(idea.id)
            await real_db.save_all(users)
            await real_db.save(idea)
            yield idea


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
    async with setup_users(real_db, 1) as users:
        [user] = users
        async with setup_ideas(real_db, user, 1) as ideas:
            [idea] = ideas

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
    async with setup_users(real_db, 1) as users:
        [user] = users
        async with setup_ideas(real_db, user, 1) as ideas:
            [idea] = ideas

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
    real_db: AIOSession, user_with_client, additional_ideas
):
    initial_ideas = await real_db.count(Idea)

    async with setup_users(real_db, 1) as users:
        [user] = users
        async with setup_ideas(real_db, user, additional_ideas):
            _, async_client = user_with_client

            response = await async_client.get(IDEAS_COUNT)
            data = response.json()

            assert response.status_code == 200
            assert data == initial_ideas + additional_ideas


@pytest.mark.only
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


@pytest.mark.only
@pytest.mark.integration
@pytest.mark.anyio
async def test_GET_ideas_id_returns_404_if_idea_does_not_exist(
    real_db: AIOSession, user_with_client
):
    async with setup_users(real_db, 1) as users:
        [user] = users
        async with setup_ideas(real_db, user, 1) as ideas:
            [idea] = ideas

    removed_idea_id = idea.id
    _, async_client = user_with_client
    response = await async_client.get(f"/ideas/{removed_idea_id}")
    data = response.json()

    assert response.status_code == 404
    assert "not found".casefold() in data["detail"].casefold()


@pytest.mark.only
@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize("invalid_id", ["random", "not-object-id"])
async def test_GET_ideas_id_returns_422_if_idea_id_is_invalid(
    user_with_client, invalid_id
):
    _, async_client = user_with_client
    response = await async_client.get(f"/ideas/{invalid_id}")

    assert response.status_code == 422
