from typing import Annotated

from fastapi import APIRouter, HTTPException

from src.api.dependencies import LoggedInUser
from src.auth import User, get_password_hash
from src.dependencies import Db
from src.models import Idea, IdeaPublic, IdeasPublic, UserEditPatch, UserMe

router = APIRouter(prefix="/me")


@router.get("/")
async def get_me(current_user: Annotated[User, LoggedInUser]):
    return UserMe(**current_user.model_dump())


@router.patch("/", response_model=UserMe)
async def patch_me(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    update_data: UserEditPatch,
):
    if update_data.new_password is not None and update_data.old_password is not None:
        if get_password_hash(update_data.old_password) != current_user.hashed_password:
            raise HTTPException(status_code=403, detail="Invalid password")
        update_data.hashed_password = get_password_hash(update_data.new_password)
    current_user.model_update(update_data, exclude={"new_password", "old_password"})
    await db.save(current_user)
    return current_user


@router.get("/ideas", response_model=IdeasPublic)
async def get_ideas(
    db: Db, current_user: Annotated[User, LoggedInUser], skip: int = 0, limit: int = 20
):
    ideas = await db.find(
        Idea, Idea.creator_id == current_user.id, limit=limit, skip=skip
    )
    count = await db.count(Idea, Idea.creator_id == current_user.id)
    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas], count=count
    )
