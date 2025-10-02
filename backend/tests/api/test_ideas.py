import operator
import random
from contextlib import contextmanager, suppress

import pytest
from odmantic.session import AIOSession

from src.api.ideas import (
    count_ideas,
    get_ideas,
    get_ideas_by_upvotes,
    get_user_ideas,
    get_voted_ideas,
    vote,
)
from src.models import Idea, IdeaDownvote, IdeaUpvote, User

from ..data_sample import idea1, user1
from ..util import setup_ideas, setup_votes


def assert_in_order(items, ascending=True):
    compare = operator.le if ascending else operator.ge
    for prev_index, item in enumerate(items[1:]):
        assert compare(items[prev_index], item)


def setup_downvote(user: User, idea: Idea):
    idea.downvoted_by = idea.downvoted_by[:] + [user.id]
    user.downvotes = user.downvotes[:] + [idea.id]


def setup_upvote(user: User, idea: Idea):
    idea.upvoted_by = idea.upvoted_by[:] + [user.id]
    user.upvotes = user.upvotes[:] + [idea.id]


def check_vote(user: User, idea: Idea, user_vote: IdeaDownvote | IdeaUpvote):
    if isinstance(user_vote, IdeaDownvote):
        assert idea.id in user.downvotes
        assert user.id in idea.downvoted_by

        assert idea.id not in user.upvotes
        assert user.id not in idea.upvoted_by
    else:
        assert idea.id in user.upvotes
        assert user.id in idea.upvoted_by

        assert idea.id not in user.downvotes
        assert user.id not in idea.downvoted_by


@pytest.fixture
def cleanup_votes():
    def clean_up(user: User, idea: Idea):
        idea_id = idea.id
        user_id = user.id
        ops = (
            (idea.downvoted_by, user_id),
            (idea.upvoted_by, user_id),
            (user.downvotes, idea_id),
            (user.upvotes, idea_id),
        )
        for field, id in ops:
            with suppress(ValueError):
                field.remove(id)

    @contextmanager
    def wrapper(user: User, idea: Idea):
        clean_up(user, idea)
        yield
        clean_up(user, idea)

    return wrapper


VOTE_CASES = [
    pytest.param(
        user1,
        idea1,
        IdeaDownvote,
        setup_downvote,
        id="voting downvote, with previous vote - downvote",
    ),
    pytest.param(
        user1,
        idea1,
        IdeaUpvote,
        setup_upvote,
        id="voting upvote, with previous vote - upvote",
    ),
    pytest.param(
        user1,
        idea1,
        IdeaDownvote,
        setup_upvote,
        id="voting downvote, with previous vote - upvote",
    ),
    pytest.param(
        user1,
        idea1,
        IdeaUpvote,
        setup_downvote,
        id="voting upvote, with previous vote - downvote",
    ),
    pytest.param(
        user1,
        idea1,
        IdeaDownvote,
        lambda user, idea: None,
        id="voting downvote, with no previous vote",
    ),
    pytest.param(
        user1,
        idea1,
        IdeaUpvote,
        lambda user, idea: None,
        id="voting upvote, with no previous vote",
    ),
]


VOTE_CALL_TEST_CASES = (
    pytest.param(*(params.values), should_call, id=id)
    for params, (should_call, id) in zip(
        VOTE_CASES,
        [
            (
                False,
                "should not call db.save when voting downvote, with previous vote - downvote",  # noqa: E501
            ),
            (
                False,
                "should not call db.save when voting upvote, with previous vote - upvote",  # noqa: E501
            ),
            (
                True,
                "should call db.save when voting downvote, with previous vote - upvote",
            ),
            (
                True,
                "should call db.save when voting upvote, with previous vote - downvote",
            ),
            (
                True,
                "should call db.save when voting downvote, with no previous vote",
            ),
            (
                True,
                "should call db.save when voting upvote, with no previous vote",
            ),
        ],
        strict=True,
    )
)


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("user", "idea", "user_vote", "setup"),
    VOTE_CASES,
)
async def test_vote_modifies_user_and_idea_objects(
    fake_db, cleanup_votes, user, idea, user_vote, setup
):
    with cleanup_votes(user, idea):
        setup(user, idea)
        new_vote = user_vote(idea_id=idea.id)

        result = await vote(fake_db, user, idea, new_vote)
        check_vote(user, result, new_vote)


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("user", "idea", "user_vote", "setup", "should_call"),
    VOTE_CALL_TEST_CASES,
)
async def test_vote_calls_db_save(
    fake_db, cleanup_votes, user, idea, user_vote, setup, should_call
):
    with cleanup_votes(user, idea):
        setup(user, idea)
        new_vote = user_vote(idea_id=idea.id)

        await vote(fake_db, user, idea, new_vote)

        if should_call:
            assert fake_db.save.await_count == 2
            fake_db.save.assert_any_await(user)
            fake_db.save.assert_any_await(idea)
        else:
            fake_db.save.assert_not_awaited()


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_with_ideas",
    [0, *[random.randint(1, 15) for _ in range(9)]],
    indirect=True,
)
async def test_count_ideas_individual_user(
    real_db: AIOSession, user_with_ideas: tuple[User, list[Idea], int]
):
    user, _, ideas_count = user_with_ideas

    result = await count_ideas(real_db, user)

    assert result == ideas_count


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "ideas_to_add", [0, *[random.randint(1, 15) for _ in range(9)]]
)
async def test_count_ideas_returns_correct_number_of_ideas_after_adding_ideas(
    real_db: AIOSession, ideas_to_add
):
    initial_count = await count_ideas(real_db)
    async with setup_ideas(real_db, user1, ideas_to_add):
        result = await count_ideas(real_db)
        assert result == initial_count + ideas_to_add


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    ("vote_for", "voted_for", "idea_attr"),
    [
        pytest.param("downvote", "downvotes", "downvoted_by", id="downvote"),
        pytest.param("upvote", "upvotes", "upvoted_by", id="upvote"),
    ],
)
@pytest.mark.parametrize(
    ("user_with_ideas", "votes_count"),
    [(30, count) for count in [5, 10, 15, 20, 22]],
    indirect=["user_with_ideas"],
)
async def test_get_voted_ideas_returns_correct_ideas_and_correct_count_of_them(
    real_db: AIOSession,
    vote_for,
    voted_for,
    idea_attr,
    user_with_ideas: tuple[User, list[Idea], int],
    votes_count,
):
    user, ideas, _ = user_with_ideas
    shuffled = random.sample(ideas, k=len(ideas))
    voted, not_voted = shuffled[:votes_count], shuffled[votes_count:]

    async with setup_votes(real_db, user, voted, which=vote_for):
        result = await get_voted_ideas(
            real_db, user, skip=0, limit=votes_count, which=voted_for
        )

        assert len(result.data) == votes_count
        assert result.count == votes_count

        for idea in result.data:
            assert user.id in getattr(idea, idea_attr)
        for idea in not_voted:
            assert user.id not in getattr(idea, idea_attr)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    ("vote_for", "voted_for"),
    [
        pytest.param("downvote", "downvotes", id="downvote"),
        pytest.param("upvote", "upvotes", id="upvote"),
    ],
)
@pytest.mark.parametrize(
    ("user_with_ideas", "votes_count"),
    [(30, count) for count in [5, 10, 15, 20, 22]],
    indirect=["user_with_ideas"],
)
async def test_get_voted_ideas_returns_ideas_sorted_by_name(
    real_db: AIOSession,
    vote_for,
    voted_for,
    user_with_ideas: tuple[User, list[Idea], int],
    votes_count,
):
    user, ideas, _ = user_with_ideas
    shuffled = random.sample(ideas, k=len(ideas))
    voted = shuffled[:votes_count]

    async with setup_votes(real_db, user, voted, which=vote_for):
        result = await get_voted_ideas(
            real_db, user, skip=0, limit=votes_count, which=voted_for
        )
        idea_names = [idea.name for idea in result.data]

        assert_in_order(idea_names)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_with_ideas",
    [5, 10, 15, 20, 22],
    indirect=True,
)
async def test_get_user_ideas_returns_user_ideas(
    real_db: AIOSession, user_with_ideas: tuple[User, list[Idea], int]
):
    user, ideas, ideas_count = user_with_ideas

    result = await get_user_ideas(real_db, user, skip=0, limit=ideas_count)
    ideas_names = {idea.name for idea in ideas}
    result_names = {idea.name for idea in result.data}

    assert len(result.data) == ideas_count
    assert ideas_names == result_names


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_with_ideas",
    [5, 10, 15, 20, 22],
    indirect=True,
)
async def test_get_user_ideas_returns_ideas_sorted_by_name(
    real_db: AIOSession, user_with_ideas: tuple[User, list[Idea], int]
):
    user, _, ideas_count = user_with_ideas

    result = await get_user_ideas(real_db, user, skip=0, limit=ideas_count)
    idea_names = [idea.name for idea in result.data]

    assert_in_order(idea_names)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    ("sort", "func_to_comparator"),
    [("trending", lambda idea: -len(idea.upvoted_by)), (None, lambda idea: idea.name)],
)
@pytest.mark.parametrize("ideas_with_fake_votes", [15], indirect=True)
async def test_get_ideas_returns_sorted_ideas_by_the_sort_argument(
    real_db: AIOSession,
    sort,
    func_to_comparator,
    ideas_with_fake_votes: tuple[list[Idea], int],
):
    _ = ideas_with_fake_votes
    result = await get_ideas(real_db, skip=0, limit=20, sort=sort)

    ideas_comparable_attribute = [func_to_comparator(idea) for idea in result.data]
    assert_in_order(ideas_comparable_attribute)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "ascending",
    [True, False],
)
@pytest.mark.parametrize("ideas_with_fake_votes", [15], indirect=True)
async def test_get_ideas_by_upvotes_returns_ideas_sorted_by_votes(
    real_db: AIOSession, ascending, ideas_with_fake_votes: tuple[list[Idea], int]
):
    _, max_votes = ideas_with_fake_votes
    result = await get_ideas_by_upvotes(real_db, skip=0, limit=20, ascending=ascending)
    upvotes_counts = [len(idea.upvoted_by) for idea in result]

    assert_in_order(upvotes_counts, ascending=ascending)

    first_votes_count = 0 if ascending else max_votes
    assert upvotes_counts[0] == first_votes_count
