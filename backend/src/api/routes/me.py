from typing import Annotated

from fastapi import APIRouter, Depends

from src.auth import User, get_current_active_user
from src.models import UserEditPatch

router = APIRouter(prefix="/me")


@router.get("/")
async def get_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user


@router.patch("/")
async def patch_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
    update_data: UserEditPatch,
):
    current_user.model_update(update_data)
    # await db.save(current_user)
    return current_user
