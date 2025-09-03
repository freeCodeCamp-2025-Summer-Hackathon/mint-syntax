from typing import Annotated

from fastapi import Depends
from pydantic import BaseModel

from src.api.util import idea_or_404, user_or_404
from src.auth import get_current_active_admin, get_current_active_user

AdminUser = Depends(get_current_active_admin)
LoggedInUser = Depends(get_current_active_user)

IdeaFromPatchId = Depends(idea_or_404)
UserFromPatchId = Depends(user_or_404)


class PaginationData(BaseModel):
    limit: int
    skip: int


def pagination_params(skip: int = 0, limit: int = 20) -> PaginationData:
    return PaginationData(limit=limit, skip=skip)


PaginationParams = Annotated[PaginationData, Depends(pagination_params)]
