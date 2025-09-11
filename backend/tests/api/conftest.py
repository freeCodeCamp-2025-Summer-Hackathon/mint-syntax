import pytest
from httpx import ASGITransport, AsyncClient

from src.csrf import verify_csrf
from src.database import get_db
from src.main import app


@pytest.fixture
async def async_client(real_db):
    app.dependency_overrides[get_db] = lambda: real_db
    # Pass all test requests through csrf protection
    app.dependency_overrides[verify_csrf] = lambda _req: True

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True
    ) as async_client:
        yield async_client


@pytest.fixture
def built_request(async_client, request):
    url, method = request.param
    return async_client.build_request(method=method, url=url)
