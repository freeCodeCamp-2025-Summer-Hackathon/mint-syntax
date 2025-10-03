from datetime import datetime

import jwt
import pytest
from httpx import AsyncClient

from src.auth import JWT_ALGORITHM
from src.models import User

from ...data_sample import (
    user1,
    user_admin,
    user_admin_disabled,
    user_disabled,
    user_disabled_with_outdated_hash,
)

AUTH = "/auth"
PASSWORD = "password"

USER_CREDENTIAL_CASES = [
    {
        "user": user,
        "credentials": {
            "username": user.username,
            "password": password,
        },
    }
    for user, password in [(user1, "password"), (user_admin, "different_password")]
]

USER_DISABLED_CASES = [
    {
        "user": user,
        "credentials": {
            "username": user.username,
            "password": "different_password",
        },
    }
    for user in [user_disabled, user_admin_disabled, user_disabled_with_outdated_hash]
]


@pytest.fixture(params=[["username"], ["password"], ["username", "password"]])
def missing_credentials(user: User, request):
    keys_to_remove = request.param
    credentials = {"username": user.username, "password": PASSWORD}
    for key in keys_to_remove:
        del credentials[key]
    return credentials


@pytest.fixture(params=[("username",), ("password",), ("username", "password")])
def invalid_credentials(user: User, request):
    keys_to_change = request.param
    credentials = {"username": user.username, "password": PASSWORD}
    for key in keys_to_change:
        credentials[key] = "something different"
    return credentials


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_credentials",
    USER_CREDENTIAL_CASES,
)
async def test_POST_auth_returns_login_data(
    async_client: AsyncClient, user_credentials
):
    response = await async_client.post(AUTH, data=user_credentials["credentials"])
    data = response.json()

    assert response.status_code == 200
    assert "user_data" in data
    assert "token" in data


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_credentials",
    USER_CREDENTIAL_CASES,
)
async def test_POST_auth_returns_user_me(
    async_client: AsyncClient, user: User, user_credentials
):
    response = await async_client.post(AUTH, data=user_credentials["credentials"])
    data = response.json()
    user = user_credentials["user"]

    assert "user_data" in data
    user_data = data["user_data"]

    assert datetime.fromisoformat(user_data["created_at"]) == user.created_at
    assert datetime.fromisoformat(user_data["modified_at"]) == user.modified_at

    assert user_data["username"] == user.username
    assert user_data["name"] == user.name
    assert user_data["is_active"] == user.is_active
    assert user_data["is_admin"] == user.is_admin
    assert set(user_data["upvotes"]) == {str(idea_id) for idea_id in user.upvotes}
    assert set(user_data["downvotes"]) == {str(idea_id) for idea_id in user.downvotes}


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_credentials",
    USER_CREDENTIAL_CASES,
)
async def test_POST_auth_returns_access_token(
    async_client: AsyncClient, user_credentials, patch_jwt_secret_key
):
    secret_key = patch_jwt_secret_key()
    response = await async_client.post(AUTH, data=user_credentials["credentials"])
    data = response.json()

    assert "token" in data
    token_data = data["token"]
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    decoded = jwt.decode(
        token_data["access_token"], secret_key, algorithms=[JWT_ALGORITHM]
    )

    assert "exp" in decoded
    assert "sub" in decoded
    assert decoded["sub"] == str(user_credentials["user"].id)


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "user_credentials",
    USER_CREDENTIAL_CASES,
)
async def test_POST_auth_sets_refresh_token_cookie(
    async_client: AsyncClient, user_credentials, patch_jwt_secret_key
):
    secret_key = patch_jwt_secret_key()
    response = await async_client.post(AUTH, data=user_credentials["credentials"])

    assert response.status_code == 200
    refresh_token = response.cookies.get("refresh_token")
    assert refresh_token is not None

    decoded = jwt.decode(refresh_token, secret_key, algorithms=[JWT_ALGORITHM])

    assert "exp" in decoded
    assert "sub" in decoded
    assert decoded["sub"] == str(user_credentials["user"].id)


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_auth_returns_401_for_invalid(
    async_client: AsyncClient, invalid_credentials
):
    response = await async_client.post(AUTH, data=invalid_credentials)
    data = response.json()

    assert response.status_code == 401
    assert "incorrect username or password" in data["detail"].casefold()
    assert "www-authenticate" in response.headers
    assert response.headers["www-authenticate"].casefold() == "bearer"


@pytest.mark.integration
@pytest.mark.anyio
async def test_POST_auth_returns_422_for_missing_credentials(
    async_client: AsyncClient, missing_credentials
):
    response = await async_client.post(AUTH, data=missing_credentials)

    assert response.status_code == 422


@pytest.mark.xfail(reason="not implemented")
@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize("disabled_user", USER_DISABLED_CASES)
async def test_POST_auth_returns_401_for_disabled_user(
    async_client: AsyncClient, disabled_user
):
    response = await async_client.post(AUTH, data=disabled_user)

    assert response.status_code == 401
