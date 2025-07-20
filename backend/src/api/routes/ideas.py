from collections.abc import Mapping, Sequence
from contextlib import suppress
from typing import Annotated, Any

from fastapi import APIRouter, HTTPException
from odmantic import ObjectId

from src.api.dependencies import AdminUser, LoggedInUser
from src.dependencies import Db
from src.models import (
    Idea,
    IdeaCreate,
    IdeaDownvote,
    IdeaEditPatch,
    IdeaPublic,
    IdeasPublic,
    IdeaUpvote,
    Message,
    User,
)

router = APIRouter(prefix="/ideas")


@router.post("/", response_model=IdeaPublic)
async def create_idea(
    db: Db, current_user: Annotated[User, LoggedInUser], idea_data: IdeaCreate
):
    idea = Idea(**idea_data.model_dump(), creator_id=current_user.id)
    await db.save(idea)
    return idea


@router.get("/", response_model=IdeasPublic)
async def get_ideas(db: Db, skip: int = 0, limit: int = 20, sort: str | None = None):
    if sort == "trending":
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
            {"$sort": {"upvotes": -1}},
            {"$skip": skip},
            {"$limit": limit},
        ]
        results = await collection.aggregate(aggregates).to_list(length=None)
        ideas = [Idea.model_validate_doc(result) for result in results]
    # elif sort == 'newest':
    #     pass
    else:
        ideas = await db.find(Idea, limit=limit, skip=skip, sort=Idea.name)
    count = await db.count(Idea)
    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas], count=count
    )


@router.get("/count")
async def count_ideas(db: Db) -> int:
    count = await db.count(Idea)
    return count


@router.get("/{id}", response_model=IdeaPublic)
async def get_idea_by_id(db: Db, id: ObjectId):
    idea = await db.find_one(Idea, Idea.id == id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea


@router.patch("/{id}", response_model=IdeaPublic)
async def update_idea(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    id: ObjectId,
    update_data: IdeaEditPatch,
):
    idea = await db.find_one(Idea, Idea.id == id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    if not current_user.is_admin or current_user.id != idea.creator_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    idea.model_update(update_data)
    await db.save(idea)
    return idea


@router.delete("/{id}", dependencies=[AdminUser])
async def delete_idea_by_id(db: Db, id: ObjectId) -> Message:
    idea = await db.find_one(Idea, Idea.id == id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    await db.delete(idea)
    return Message(message="Idea deleted successfully")


@router.put("/{id}/upvote", response_model=IdeaPublic)
async def upvote_idea(
    db: Db, current_user: Annotated[User, LoggedInUser], upvote_data: IdeaUpvote
):
    idea = await db.find_one(Idea, Idea.id == upvote_data.idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")

    if current_user.id in idea.upvoted_by or idea.id in current_user.upvotes:
        return idea

    with suppress(ValueError):
        idea.downvoted_by.remove(current_user.id)
        current_user.downvotes.remove(idea.id)

    idea.upvoted_by.append(current_user.id)
    current_user.upvotes.append(idea.id)
    await db.save(idea)
    await db.save(current_user)

    return idea


@router.put("/{id}/downvote", response_model=IdeaPublic)
async def downvote_idea(
    db: Db, current_user: Annotated[User, LoggedInUser], downvote_data: IdeaDownvote
):
    idea = await db.find_one(Idea, Idea.id == downvote_data.idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")

    if current_user.id in idea.downvoted_by or idea.id in current_user.downvotes:
        return idea

    with suppress(ValueError):
        idea.upvoted_by.remove(current_user.id)
        current_user.upvotes.remove(idea.id)

    idea.downvoted_by.append(current_user.id)
    current_user.downvotes.append(idea.id)
    await db.save(idea)
    await db.save(current_user)

    return idea
