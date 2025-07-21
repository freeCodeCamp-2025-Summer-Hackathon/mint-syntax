from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm

from src.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    refresh_access_token,
)
from src.dependencies import Db
from src.models import LoginData, RefreshToken, Token, UserMe

router = APIRouter()


@router.post("/auth")
async def login_for_access_token(
    db: Db,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
) -> LoginData:
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": str(user.id)},
    )
    (refresh_token, expiration) = create_refresh_token(data={"sub": str(user.id)})
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        expires=int(expiration.total_seconds()),
    )
    return LoginData(
        user_data=UserMe(**user.model_dump()),
        token=Token(access_token=access_token, token_type="bearer"),
    )


@router.post("/refresh")
async def get_new_access_token(db: Db, refresh_token: str):
    return await refresh_access_token(db, refresh_token)
