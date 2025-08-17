from typing import Annotated

from fastapi import APIRouter, HTTPException
from odmantic import ObjectId

from src.api.dependencies import AdminUser, LoggedInUser
from src.api.ideas import count_ideas, get_ideas, vote
from src.api.util import find_one_or_404
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


async def idea_or_404(db: Db, id: ObjectId, error_text="Idea not found"):
    return await find_one_or_404(db, Idea, id, error_text)


@router.post("/", response_model=IdeaPublic)
async def create_idea(
    db: Db, current_user: Annotated[User, LoggedInUser], idea_data: IdeaCreate
):
    idea = Idea(**idea_data.model_dump(), creator_id=current_user.id)
    await db.save(idea)
    return idea


@router.get("/", response_model=IdeasPublic)
async def list_ideas(db: Db, skip: int = 0, limit: int = 20, sort: str | None = None):
    return await get_ideas(db, skip=skip, limit=limit, sort=sort)


@router.get("/count")
async def count(db: Db) -> int:
    return await count_ideas(db)


@router.get("/{id}", response_model=IdeaPublic)
async def get_idea_by_id(db: Db, id: ObjectId):
    return await idea_or_404(db, id)


@router.patch("/{id}", response_model=IdeaPublic)
async def update_idea(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    id: ObjectId,
    update_data: IdeaEditPatch,
):
    idea = await idea_or_404(db, id)
    if not current_user.is_admin and current_user.id != idea.creator_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    idea.model_update(update_data)
    await db.save(idea)
    return idea


@router.delete("/{id}", dependencies=[AdminUser])
async def delete_idea_by_id(db: Db, id: ObjectId) -> Message:
    idea = await idea_or_404(db, id)
    await db.delete(idea)
    return Message(message="Idea deleted successfully")


@router.put("/{id}/upvote", response_model=IdeaPublic)
async def upvote_idea(
    db: Db, current_user: Annotated[User, LoggedInUser], upvote_data: IdeaUpvote
):
    idea = await idea_or_404(db, upvote_data.idea_id)
    return await vote(db, current_user, idea, upvote_data)


@router.put("/{id}/downvote", response_model=IdeaPublic)
async def downvote_idea(
    db: Db, current_user: Annotated[User, LoggedInUser], downvote_data: IdeaDownvote
):
    idea = await idea_or_404(db, downvote_data.idea_id)
    return await vote(db, current_user, idea, downvote_data)
