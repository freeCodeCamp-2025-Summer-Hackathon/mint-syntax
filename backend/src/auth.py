from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

from src.config import get_settings
from src.dependencies import Db
from src.models import TokenData, User

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = timedelta(minutes=30)
REFRESH_TOKEN_EXPIRE_MINUTES = timedelta(minutes=60 * 24 * 7)

password_context = CryptContext(schemes=["bcrypt"], deprecated=["auto"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth", refreshUrl="refresh")


def verify_password(plain_password, hashed_password):
    return password_context.verify(plain_password, hashed_password)


def get_password_hash(plain_password):
    return password_context.hash(plain_password)


async def authenticate_user(db, username, plain_password) -> User | Literal[False]:
    user = await db.find_one(User, User.username == username)
    if not user:
        return False
    if not verify_password(plain_password, user.hashed_password):
        return False
    return user


config = get_settings()


def create_access_token(
    data: dict, expires_delta: timedelta = ACCESS_TOKEN_EXPIRE_MINUTES
):
    to_encode = data.copy()
    expire = datetime.now(UTC) + expires_delta
    to_encode["exp"] = expire

    encoded_jwt = jwt.encode(to_encode, config.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    data: dict, expires_delta: timedelta = REFRESH_TOKEN_EXPIRE_MINUTES
):
    return create_access_token(data, expires_delta), expires_delta


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def refresh_access_token(
    db: Db,
    token: Annotated[str, Depends(oauth2_scheme)],
):
    try:
        decoded_jwt = jwt.decode(token, config.secret_key, algorithms=[ALGORITHM])
        id = decoded_jwt.get("sub")
        if id is None:
            raise credentials_exception

        token_data = TokenData(id=id)
    except InvalidTokenError as err:
        raise credentials_exception from err

    user = await db.find_one(User, User.id == token_data.id)
    if user is None:
        raise credentials_exception
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(
    db: Db,
    token: Annotated[str, Depends(oauth2_scheme)],
):
    try:
        decoded_jwt = jwt.decode(token, config.secret_key, algorithms=[ALGORITHM])
        id = decoded_jwt.get("sub")
        if id is None:
            raise credentials_exception

        token_data = TokenData(id=id)
    except InvalidTokenError as err:
        raise credentials_exception from err

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
