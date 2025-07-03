from fastapi import APIRouter, HTTPException
from odmantic import ObjectId

from src.database import engine
from src.models import User, UserEditPatch, UserPublic, UserRegister

router = APIRouter(prefix="/users")


@router.post("/", response_model=UserPublic)
async def create_user(register_data: UserRegister):
    user = User.model_validate(register_data.__dict__)
    await engine.save(user)
    return user


@router.get("/", response_model=list[UserPublic])
async def list_users():
    return await engine.find(User)


@router.get("/{id}", response_model=User)
async def get_user(id: ObjectId):
    user = await engine.find_one(User, User.id == id)
    if user is None:
        raise HTTPException(404)
    return user


@router.patch("/{id}", response_model=UserPublic)
async def update_user(id: ObjectId, update_data: UserEditPatch):
    user = await engine.find_one(User, User.id == id)
    if user is None:
        raise HTTPException(404)
    user.model_update(update_data)
    await engine.save(user)
    return user
