import random

import pytest
from httpx import ASGITransport, AsyncClient
from odmantic import ObjectId
from odmantic.session import AIOSession

from src.csrf import verify_csrf
from src.database import get_db
from src.main import app

from ..util import setup_ideas, setup_users


@pytest.fixture
def test_transport(real_db):
    app.dependency_overrides[get_db] = lambda: real_db
    # Pass all test requests through csrf protection
    app.dependency_overrides[verify_csrf] = lambda _req: True

    yield ASGITransport(app=app)

    app.dependency_overrides[get_db] = get_db
    app.dependency_overrides[verify_csrf] = verify_csrf


@pytest.fixture
async def async_client(test_transport):
    async with AsyncClient(
        transport=test_transport, base_url="http://test", follow_redirects=True
    ) as async_client:
        yield async_client


@pytest.fixture
def built_request(async_client, request):
    url, method = request.param
    return async_client.build_request(method=method, url=url)


@pytest.fixture
async def user_with_ideas(real_db: AIOSession, request):
    ideas_count = request.param
    async with setup_users(real_db) as users:
        [user] = users
        async with setup_ideas(real_db, user, ideas_count) as ideas:
            yield user, ideas, ideas_count


@pytest.fixture
async def ideas_with_fake_votes(real_db: AIOSession, request):
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
