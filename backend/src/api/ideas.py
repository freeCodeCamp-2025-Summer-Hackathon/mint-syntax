from collections import namedtuple
from collections.abc import Mapping, Sequence
from contextlib import suppress
from typing import Any, Literal

from odmantic import query

from src.dependencies import Db
from src.models import Idea, IdeaDownvote, IdeaPublic, IdeasPublic, IdeaUpvote, User


async def count_ideas(db: Db, user: User | None = None) -> int:
    if user is not None:
        return await db.count(Idea, Idea.creator_id == user.id)
    return await db.count(Idea)


async def get_ideas_by_upvotes(db: Db, skip: int, limit: int, ascending=False):
    collection = db.engine.get_collection(Idea)
    aggregates: Sequence[Mapping[str, Any]] = [
        {
            "$project": {
                "_id": 1,
                "name": 1,
                "description": 1,
                "upvoted_by": 1,
                "downvoted_by": 1,
                "creator_id": 1,
                "upvotes": {"$size": "$upvoted_by"},
            }
        },
        {"$sort": {"upvotes": 1 if ascending else -1}},
        {"$skip": skip},
        {"$limit": limit},
    ]
    results = await collection.aggregate(aggregates).to_list(length=None)
    return (Idea.model_validate_doc(result) for result in results)


async def get_ideas(db: Db, skip: int, limit: int, sort: str | None = None):
    if sort == "trending":
        ideas = await get_ideas_by_upvotes(db, skip=skip, limit=limit)
    # elif sort == 'newest':
    #     pass
    else:
        ideas = await db.find(Idea, limit=limit, skip=skip, sort=Idea.name)
    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas],
        count=await count_ideas(db),
    )


async def get_user_ideas(
    db: Db,
    user: User,
    skip: int,
    limit: int,
):
    ideas = await db.find(
        Idea, Idea.creator_id == user.id, skip=skip, limit=limit, sort=Idea.name
    )
    count = await count_ideas(db, user)

    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas], count=count
    )


async def get_voted_ideas(
    db: Db,
    user: User,
    skip: int,
    limit: int,
    which: Literal["downvotes", "upvotes"],
):
    votes = set(getattr(user, which))
    ideas = await db.find(
        Idea, query.in_(Idea.id, votes), limit=limit, skip=skip, sort=Idea.name
    )
    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas], count=len(votes)
    )


vote_attributes = namedtuple(
    "vote_attributes", "idea_add_to user_add_to idea_remove_from user_remove_from"
)
VOTE_ATTRIBUTES = {
    IdeaDownvote: vote_attributes(
        idea_add_to="downvoted_by",
        user_add_to="downvotes",
        idea_remove_from="upvoted_by",
        user_remove_from="upvotes",
    ),
    IdeaUpvote: vote_attributes(
        idea_add_to="upvoted_by",
        user_add_to="upvotes",
        idea_remove_from="downvoted_by",
        user_remove_from="downvotes",
    ),
}


async def vote(
    db: Db,
    user: User,
    idea: Idea,
    vote_data: IdeaUpvote | IdeaDownvote,
):
    attributes = VOTE_ATTRIBUTES[type(vote_data)]

    already_voted = user.id in getattr(
        idea, attributes.idea_add_to
    ) or idea.id in getattr(user, attributes.user_add_to)
    if already_voted:
        return idea

    with suppress(ValueError):
        getattr(user, attributes.user_remove_from).remove(idea.id)
    with suppress(ValueError):
        getattr(idea, attributes.idea_remove_from).remove(user.id)

    getattr(user, attributes.user_add_to).append(idea.id)
    getattr(idea, attributes.idea_add_to).append(user.id)

    await db.save(idea)
    await db.save(user)
    return idea
