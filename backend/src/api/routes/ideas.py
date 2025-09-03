from typing import Annotated

from fastapi import APIRouter, HTTPException

from src.api.dependencies import (
    AdminUser,
    IdeaFromPatchId,
    LoggedInUser,
    PaginationParams,
)
from src.api.ideas import count_ideas, get_ideas, vote
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
IdeaFromPatch = Annotated[Idea, IdeaFromPatchId]


@router.post("/", response_model=IdeaPublic)
async def create_idea(
    db: Db, current_user: Annotated[User, LoggedInUser], idea_data: IdeaCreate
):
    idea = Idea(**idea_data.model_dump(), creator_id=current_user.id)
    await db.save(idea)
    return idea


@router.get("/", response_model=IdeasPublic)
async def list_ideas(db: Db, pagination: PaginationParams, sort: str | None = None):
    return await get_ideas(db, **pagination.model_dump(), sort=sort)


@router.get("/count")
async def count(db: Db) -> int:
    return await count_ideas(db)


@router.get("/{id}", response_model=IdeaPublic)
async def get_idea_by_id(idea: IdeaFromPatch):
    return idea


@router.patch("/{id}", response_model=IdeaPublic)
async def update_idea(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    idea: IdeaFromPatch,
    update_data: IdeaEditPatch,
):
    if not current_user.is_admin and current_user.id != idea.creator_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    idea.model_update(update_data)
    await db.save(idea)
    return idea


@router.delete("/{id}", dependencies=[AdminUser])
async def delete_idea_by_id(db: Db, idea: IdeaFromPatch) -> Message:
    await db.delete(idea)
    return Message(message="Idea deleted successfully")


@router.put("/{id}/upvote", response_model=IdeaPublic)
async def upvote_idea(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    idea: IdeaFromPatch,
    upvote_data: IdeaUpvote,
):
    return await vote(db, current_user, idea, upvote_data)


@router.put("/{id}/downvote", response_model=IdeaPublic)
async def downvote_idea(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    idea: IdeaFromPatch,
    downvote_data: IdeaDownvote,
):
    return await vote(db, current_user, idea, downvote_data)
