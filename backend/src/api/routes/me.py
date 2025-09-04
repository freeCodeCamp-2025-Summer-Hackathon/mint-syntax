from typing import Annotated

from fastapi import APIRouter, HTTPException

from src.api.dependencies import LoggedInUser, PaginationParams
from src.api.ideas import get_user_ideas, get_voted_ideas
from src.auth import get_password_hash, verify_password
from src.dependencies import Db
from src.models import IdeasPublic, User, UserEditPatch, UserMe

router = APIRouter(prefix="/me")


@router.get("")
async def get_me(current_user: Annotated[User, LoggedInUser]):
    return UserMe(**current_user.model_dump())


@router.patch("", response_model=UserMe)
async def patch_me(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    update_data: UserEditPatch,
):
    if update_data.new_password:
        if not update_data.old_password or not verify_password(
            update_data.old_password, current_user.hashed_password
        ):
            raise HTTPException(status_code=403, detail="Invalid password")
        update_data.hashed_password = get_password_hash(update_data.new_password)
    current_user.model_update(update_data, exclude={"new_password", "old_password"})
    await db.save(current_user)
    return current_user


@router.get("/ideas/", response_model=IdeasPublic)
async def get_ideas(
    db: Db, current_user: Annotated[User, LoggedInUser], pagination: PaginationParams
):
    return await get_user_ideas(db, current_user, **pagination.model_dump())


@router.get("/upvotes/", response_model=IdeasPublic)
async def get_upvotes(
    db: Db, current_user: Annotated[User, LoggedInUser], pagination: PaginationParams
):
    return await get_voted_ideas(
        db, current_user, **pagination.model_dump(), which="upvotes"
    )


@router.get("/downvotes/", response_model=IdeasPublic)
async def get_downvotes(
    db: Db, current_user: Annotated[User, LoggedInUser], pagination: PaginationParams
):
    return await get_voted_ideas(
        db, current_user, **pagination.model_dump(), which="downvotes"
    )
