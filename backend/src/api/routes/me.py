from typing import Annotated, Literal

from fastapi import APIRouter, HTTPException
from odmantic import query

from src.api.dependencies import LoggedInUser
from src.auth import User, get_password_hash, verify_password
from src.dependencies import Db
from src.models import Idea, IdeaPublic, IdeasPublic, UserEditPatch, UserMe

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
    db: Db, current_user: Annotated[User, LoggedInUser], skip: int = 0, limit: int = 20
):
    ideas = await db.find(
        Idea, Idea.creator_id == current_user.id, limit=limit, skip=skip
    )
    count = await db.count(Idea, Idea.creator_id == current_user.id)
    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas], count=count
    )


async def get_voted_ideas(
    db: Db,
    current_user: Annotated[User, LoggedInUser],
    skip: int,
    limit: int,
    which: Literal["downvotes", "upvotes"],
):
    votes = set(getattr(current_user, which))
    ideas = await db.find(
        Idea, query.in_(Idea.id, votes), limit=limit, skip=skip, sort=Idea.name
    )
    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas], count=len(votes)
    )


@router.get("/upvotes/", response_model=IdeasPublic)
async def get_upvotes(
    db: Db, current_user: Annotated[User, LoggedInUser], skip: int = 0, limit: int = 20
):
    return await get_voted_ideas(
        db, current_user, limit=limit, skip=skip, which="upvotes"
    )


@router.get("/downvotes/", response_model=IdeasPublic)
async def get_downvotes(
    db: Db, current_user: Annotated[User, LoggedInUser], skip: int = 0, limit: int = 20
):
    return await get_voted_ideas(
        db, current_user, limit=limit, skip=skip, which="downvotes"
    )
