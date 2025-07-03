from fastapi import APIRouter, HTTPException
from odmantic import ObjectId

from src.database import engine
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
async def create_idea(idea_data: IdeaCreate):
    idea = Idea.model_validate(idea_data.__dict__)
    await engine.save(idea)
    return idea


@router.get("/", response_model=IdeasPublic)
async def get_ideas(skip: int = 0, limit: int = 20):
    ideas = await engine.find(Idea, limit=limit, skip=skip)
    count = await engine.count(Idea)
    return IdeasPublic(data=ideas, count=count)


@router.get("/count")
async def count_ideas() -> int:
    count = await engine.count(Idea)
    return count


@router.get("/{id}", response_model=IdeaPublic)
async def get_idea_by_id(id: ObjectId):
    idea = await engine.find_one(Idea, Idea.id == id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea


@router.patch("/{id}", response_model=IdeaPublic)
async def update_idea(id: ObjectId, update_data: IdeaEditPatch):
    idea = await engine.find_one(Idea, Idea.id == id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    idea.model_update(update_data)
    await engine.save(idea)
    return idea


@router.delete("/{id}")
async def delete_idea_by_id(id: ObjectId) -> Message:
    idea = await engine.find_one(Idea, Idea.id == id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    await engine.delete(idea)
    return Message(message="Idea deleted successfully")


@router.put("/{id}/upvote", response_model=IdeaPublic)
async def upvote_idea(upvote_data: IdeaUpvote):
    idea = await engine.find_one(Idea, Idea.id == upvote_data.idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    if upvote_data.user_id in idea.upvoted_by:
        return idea

    user = await engine.find_one(User, User.id == upvote_data.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if idea.id in user.upvotes:
        return idea

    if user.id in idea.downvoted_by:
        idea.downvoted_by.remove(user.id)
    if idea.id in user.downvotes:
        user.downvotes.remove(idea.id)

    idea.upvoted_by.append(user.id)
    user.upvotes.append(idea.id)
    await engine.save(idea)
    await engine.save(user)

    return idea


@router.put("/{id}/downvote", response_model=IdeaPublic)
async def downvote_idea(downvote_data: IdeaDownvote):
    idea = await engine.find_one(Idea, Idea.id == downvote_data.idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    if downvote_data.user_id in idea.downvoted_by:
        return idea

    user = await engine.find_one(User, User.id == downvote_data.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if idea.id in user.downvotes:
        return idea

    if user.id in idea.upvoted_by:
        idea.upvoted_by.remove(user.id)
    if idea.id in user.upvotes:
        user.upvotes.remove(idea.id)

    idea.downvoted_by.append(user.id)
    user.downvotes.append(idea.id)
    await engine.save(idea)
    await engine.save(user)

    return idea
