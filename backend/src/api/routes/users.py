from fastapi import APIRouter, Depends, HTTPException
from odmantic import ObjectId

from src.api.csrf_security.csrf import validate_csrf
from src.api.dependencies import AdminUser
from src.auth import get_password_hash
from src.dependencies import Db
from src.models import User, UserEditPatch, UserPublic, UserRegister, UsersPublic

router = APIRouter(prefix="/users", dependencies=[Depends(validate_csrf)])


@router.post("/", response_model=UserPublic)
async def create_user(db: Db, register_data: UserRegister):
    user = User(
        **register_data.model_dump(),
        hashed_password=get_password_hash(register_data.password),
    )
    await db.save(user)
    return user


@router.get(
    "/",
    response_model=UsersPublic,
    dependencies=[AdminUser],
)
async def list_users(db: Db, skip: int = 0, limit: int = 20):
    users = await db.find(User, limit=limit, skip=skip)
    count = await db.count(User)
    return UsersPublic(
        users=[UserPublic(**user.model_dump()) for user in users], count=count
    )


@router.get("/{id}", response_model=User, dependencies=[AdminUser])
async def get_user(db: Db, id: ObjectId):
    user = await db.find_one(User, User.id == id)
    if user is None:
        raise HTTPException(404)
    return user


@router.patch("/{id}", response_model=UserPublic, dependencies=[AdminUser])
async def update_user(db: Db, id: ObjectId, update_data: UserEditPatch):
    user = await db.find_one(User, User.id == id)
    if user is None:
        raise HTTPException(404)
    user.model_update(update_data)
    await db.save(user)
    return user
