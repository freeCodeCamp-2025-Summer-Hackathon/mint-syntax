from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal

import jwt
from fastapi import Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

from src.config import get_settings
from src.dependencies import Db
from src.models import TokenData, User

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_DELTA = timedelta(minutes=30)
REFRESH_TOKEN_DELTA = timedelta(minutes=60 * 24 * 7)

password_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated=["auto"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth", refreshUrl="refresh")


def verify_password(plain_password, hashed_password):
    return password_context.verify(plain_password, hashed_password)


def verify_and_update_password(plain_password, hashed_password):
    return password_context.verify_and_update(plain_password, hashed_password)


def get_password_hash(plain_password):
    return password_context.hash(plain_password)


async def authenticate_user(db, username, plain_password) -> User | Literal[False]:
    user = await db.find_one(User, User.username == username)
    if not user:
        return False
    is_valid, maybe_new_hash = verify_and_update_password(
        plain_password, user.hashed_password
    )
    if not is_valid:
        return False
    if maybe_new_hash:
        user.hashed_password = maybe_new_hash
        await db.save(user)
    return user


config = get_settings()


def create_tokens(user_id: str):
    data = {"sub": user_id}
    access_token = create_access_token(data)
    (refresh_token, token_expiration) = create_refresh_token(data)
    return access_token, refresh_token, token_expiration


def create_access_token(data: dict, expires_delta: timedelta = ACCESS_TOKEN_DELTA):
    to_encode = data.copy()
    expire = datetime.now(UTC) + expires_delta
    to_encode["exp"] = expire

    encoded_jwt = jwt.encode(to_encode, config.secret_key, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: timedelta = REFRESH_TOKEN_DELTA):
    return create_access_token(data, expires_delta), expires_delta


def set_refresh_token_cookie(
    response: Response, refresh_token: str, token_expiration: timedelta
):
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        expires=int(token_expiration.total_seconds()),
    )


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def decode_jwt(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        decoded_jwt = jwt.decode(token, config.secret_key, algorithms=[JWT_ALGORITHM])
        id = decoded_jwt.get("sub")
        if id is None:
            raise credentials_exception

        token_data = TokenData(id=id)
        return token_data
    except InvalidTokenError as err:
        raise credentials_exception from err


async def refresh_access_token(
    db: Db,
    refresh_token: Annotated[str, Depends(oauth2_scheme)],
):
    user = await get_current_user(db, refresh_token)
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(
    db: Db,
    token: Annotated[str, Depends(oauth2_scheme)],
):
    token_data = decode_jwt(token)

    user = await db.find_one(User, User.id == token_data.id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


CurrentUser = Annotated[User, Depends(get_current_active_user)]


async def get_current_active_admin(current_user: CurrentUser) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
