from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm

from src.auth import (
    authenticate_user,
    create_tokens,
    refresh_access_token,
    set_refresh_token_cookie,
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
    (access_token, refresh_token, token_expiration) = create_tokens(str(user.id))
    set_refresh_token_cookie(response, refresh_token, token_expiration)

    return LoginData(
        user_data=UserMe(**user.model_dump()),
        token=Token(access_token=access_token, token_type="bearer"),
    )


@router.get("/refresh")
async def get_new_access_token(
    db: Db, refresh_token: Annotated[RefreshToken, Cookie()]
) -> Token:
    return Token(**(await refresh_access_token(db, refresh_token.refresh_token)))
