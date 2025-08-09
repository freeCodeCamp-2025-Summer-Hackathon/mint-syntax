from typing import Annotated

from fastapi import APIRouter, Form, HTTPException, Response
from odmantic import ObjectId
from odmantic.exceptions import DuplicateKeyError

from src.api.dependencies import AdminUser
from src.auth import (
    create_tokens,
    get_password_hash,
    set_refresh_token_cookie,
)
from src.dependencies import Db
from src.models import (
    AdminUserCreate,
    AdminUserEditPatch,
    Idea,
    IdeaPublic,
    IdeasPublic,
    LoginData,
    Token,
    User,
    UserMe,
    UserPublic,
    UserRegister,
    UsersAdmin,
)

router = APIRouter(prefix="/users")


async def add_user(db: Db, data: Annotated[AdminUserCreate | UserRegister, Form()]):
    try:
        user = User(
            **data.model_dump(),
            hashed_password=get_password_hash(data.password),
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


@router.post("/", response_model=LoginData)
async def register(
    db: Db, register_data: Annotated[UserRegister, Form()], response: Response
):
    user = await add_user(db, register_data)
    (access_token, refresh_token, token_expiration) = create_tokens(str(user.id))
    set_refresh_token_cookie(response, refresh_token, token_expiration)

    return LoginData(
        user_data=UserMe(**user.model_dump()),
        token=Token(access_token=access_token, token_type="bearer"),
    )


@router.post("/add", response_model=UserPublic, dependencies=[AdminUser])
async def create_user(db: Db, create_data: Annotated[AdminUserCreate, Form()]):
    return await add_user(db, create_data)


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
async def update_user(db: Db, id: ObjectId, update_data: AdminUserEditPatch):
    user = await db.find_one(User, User.id == id)
    if user is None:
        raise HTTPException(404)
    if update_data.new_password is not None:
        update_data.hashed_password = get_password_hash(update_data.new_password)
    user.model_update(update_data, exclude={"old_password, new_password"})
    await db.save(user)
    return user
