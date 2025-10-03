import random
from collections.abc import AsyncGenerator, Callable, Generator

import pytest
from fastapi import Request
from httpx import ASGITransport, AsyncClient
from httpx import Request as HttpxRequest
from odmantic import ObjectId
from odmantic.session import AIOSession

from src.auth import create_access_token
from src.csrf import verify_csrf
from src.database import get_db
from src.main import app
from src.models import Idea, User

from ..util import setup_ideas, setup_users

type LogInClientFunc = Callable[[User], AsyncClient]


@pytest.fixture
def test_transport(real_db: AIOSession) -> Generator[ASGITransport]:
    async def csrf_override(_request: Request):
        """Pass through all test request."""
        return True

    app.dependency_overrides[get_db] = lambda: real_db
    app.dependency_overrides[verify_csrf] = csrf_override

    yield ASGITransport(app=app)

    app.dependency_overrides[get_db] = get_db
    app.dependency_overrides[verify_csrf] = verify_csrf


@pytest.fixture
def client_defaults(test_transport):
    return {
        "transport": test_transport,
        "base_url": "http://test",
        "follow_redirects": True,
    }


@pytest.fixture
async def async_client(client_defaults) -> AsyncGenerator[AsyncClient]:
    async with AsyncClient(**client_defaults) as async_client:
        yield async_client


@pytest.fixture
def log_client_as(async_client: AsyncClient, patch_jwt_secret_key) -> LogInClientFunc:
    patch_jwt_secret_key()

    def wrapper(user: User):
        access_token = create_access_token({"sub": str(user.id)})
        async_client.headers["Authorization"] = f"Bearer {access_token}"
        return async_client

    return wrapper


LOGGED_IN_PARAMS = [
    pytest.param({"is_active": True, "is_admin": False}, id="active user"),
    pytest.param({"is_active": True, "is_admin": True}, id="active admin"),
]


@pytest.fixture(params=LOGGED_IN_PARAMS)
async def user_with_client(
    log_client_as: LogInClientFunc, real_db: AIOSession, request
):
    user_options = request.param
    async with setup_users(real_db, **user_options) as users:
        [user] = users
        yield user, log_client_as(user)


@pytest.fixture
async def admin_client(
    log_client_as: LogInClientFunc, real_db: AIOSession
) -> AsyncGenerator[AsyncClient]:
    async with setup_users(real_db, 1, is_active=True, is_admin=True) as users:
        [admin] = users

        yield log_client_as(admin)


@pytest.fixture
def built_request(async_client: AsyncClient, request) -> HttpxRequest:
    url, method = request.param
    return async_client.build_request(method=method, url=url)


@pytest.fixture
async def user(real_db: AIOSession, request) -> AsyncGenerator[User]:
    user_options = request.param if hasattr(request, "param") else {}
    async with setup_users(real_db, **user_options) as users:
        [user] = users
        yield user


@pytest.fixture
async def user_with_ideas(
    real_db: AIOSession, user: User, request
) -> AsyncGenerator[tuple[User, list[Idea], int]]:
    ideas_count = request.param
    async with setup_ideas(real_db, user, ideas_count) as ideas:
        yield user, ideas, ideas_count


@pytest.fixture
async def ideas_with_fake_votes(
    real_db: AIOSession, request
) -> AsyncGenerator[tuple[list[Idea], int]]:
    max_votes = request.param
    async with setup_users(real_db) as users:
        [user] = users
        async with setup_ideas(real_db, user, 10) as ideas:
            users_to_vote = [0, max_votes] + [
                random.randint(0, max_votes) for _ in ideas[2:]
            ]
            for idea, votes in zip(ideas, users_to_vote, strict=True):
                idea.upvoted_by = [ObjectId() for _ in range(votes)]
            await real_db.save_all(users)
            await real_db.save_all(ideas)
            yield ideas, max_votes
