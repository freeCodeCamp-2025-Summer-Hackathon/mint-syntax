from contextlib import contextmanager, suppress

import pytest

from src.api.ideas import vote
from src.models import Idea, IdeaDownvote, IdeaUpvote, User

from ..data_sample import idea1, user1


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
    ["user", "idea", "user_vote", "setup"],
    VOTE_CASES,
)
async def test_vote_modifies_user_and_idea_objects(
    db, cleanup_votes, user, idea, user_vote, setup
):
    with cleanup_votes(user, idea):
        setup(user, idea)
        new_vote = user_vote(idea_id=idea.id)

        result = await vote(db, user, idea, new_vote)
        check_vote(user, result, new_vote)


@pytest.mark.anyio
@pytest.mark.parametrize(
    ["user", "idea", "user_vote", "setup", "should_call"],
    VOTE_CALL_TEST_CASES,
)
async def test_vote_calls_db_save(
    db, cleanup_votes, user, idea, user_vote, setup, should_call
):
    with cleanup_votes(user, idea):
        setup(user, idea)
        new_vote = user_vote(idea_id=idea.id)

        await vote(db, user, idea, new_vote)

        if should_call:
            assert db.save.await_count == 2
            db.save.assert_any_await(user)
            db.save.assert_any_await(idea)
        else:
            db.save.assert_not_awaited()
