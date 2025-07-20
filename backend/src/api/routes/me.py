from typing import Annotated

from fastapi import APIRouter

from src.api.dependencies import LoggedInUser
from src.auth import User
from src.dependencies import Db
from src.models import UserEditPatch

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
