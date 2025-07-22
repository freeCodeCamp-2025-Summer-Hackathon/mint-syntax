from typing import Annotated

from fastapi import APIRouter

from src.api.dependencies import LoggedInUser
from src.auth import User
from src.dependencies import Db
from src.models import Idea, IdeaPublic, IdeasPublic, UserEditPatch

router = APIRouter(prefix="/me")


@router.get("/")
async def get_me(current_user: Annotated[User, LoggedInUser]):
    return current_user


@router.patch("/")
async def patch_me(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    update_data: UserEditPatch,
):
    current_user.model_update(update_data)
    await db.save(current_user)
    return current_user


@router.get("/ideas", response_model=IdeasPublic)
async def get_ideas(
    db: Db, current_user: Annotated[User, LoggedInUser], skip: int = 0, limit: int = 20
):
    ideas = await db.find(
        Idea, Idea.creator_id == current_user.id, limit=limit, skip=skip
    )
    count = await db.count(
        Idea, Idea.creator_id == current_user.id, limit=limit, skip=skip
    )
    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas], count=count
    )
