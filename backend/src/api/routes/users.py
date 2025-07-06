from fastapi import APIRouter, HTTPException
from odmantic import ObjectId

from src.api.dependencies import AdminUser
from src.auth import get_password_hash
from src.dependencies import Db
from src.models import User, UserEditPatch, UserPublic, UserRegister

router = APIRouter(prefix="/users")


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
    response_model=list[UserPublic],
    dependencies=[AdminUser],
)
async def list_users(db: Db, skip: int = 0, limit: int = 20):
    return await db.find(User, limit=limit, skip=skip)


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
