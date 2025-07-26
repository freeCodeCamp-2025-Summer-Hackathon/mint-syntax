from typing import Annotated

from fastapi import APIRouter, Form, HTTPException
from odmantic import ObjectId
from odmantic.exceptions import DuplicateKeyError

from src.api.dependencies import AdminUser
from src.auth import get_password_hash
from src.dependencies import Db
from src.models import (
    Idea,
    IdeaPublic,
    IdeasPublic,
    User,
    UserEditPatch,
    UserMe,
    UserPublic,
    UserRegister,
    UsersAdmin,
)

router = APIRouter(prefix="/users")


@router.post("/", response_model=UserPublic)
async def create_user(db: Db, register_data: Annotated[UserRegister, Form()]):
    try:
        user = User(
            **register_data.model_dump(),
            hashed_password=get_password_hash(register_data.password),
        )
        await db.save(user)
    except DuplicateKeyError as e:
        raise HTTPException(
            status_code=409,
            detail="User with this username already exists. "
            "Please choose a different username",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="An unexpected error occurred while creating the user.",
        ) from e
    return user


@router.get(
    "/",
    response_model=UsersAdmin,
    dependencies=[AdminUser],
)
async def list_users(db: Db, skip: int = 0, limit: int = 20):
    users = await db.find(User, limit=limit, skip=skip, sort=User.name)
    count = await db.count(User)
    return UsersAdmin(
        users=[UserMe(**user.model_dump()) for user in users], count=count
    )


@router.get("/{id}", response_model=User, dependencies=[AdminUser])
async def get_user(db: Db, id: ObjectId):
    user = await db.find_one(User, User.id == id)
    if user is None:
        raise HTTPException(404)
    return user


@router.get("/{id}/ideas", response_model=IdeasPublic, dependencies=[AdminUser])
async def get_user_ideas(db: Db, id: ObjectId, skip: int = 0, limit: int = 20):
    ideas = await db.find(
        Idea, Idea.creator_id == id, skip=skip, limit=limit, sort=Idea.name
    )
    count = await db.count(Idea, Idea.creator_id == id)

    return IdeasPublic(
        data=[IdeaPublic(**idea.model_dump()) for idea in ideas],
        count=count,
    )


@router.patch("/{id}", response_model=UserMe, dependencies=[AdminUser])
async def update_user(db: Db, id: ObjectId, update_data: UserEditPatch):
    user = await db.find_one(User, User.id == id)
    if user is None:
        raise HTTPException(404)
    user.model_update(update_data)
    await db.save(user)
    return user
