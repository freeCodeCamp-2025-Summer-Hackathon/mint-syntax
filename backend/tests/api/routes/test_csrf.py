import pytest
from fastapi.requests import Request
from httpx import ASGITransport, AsyncClient

from src.csrf import verify_csrf
from src.database import get_db
from src.main import app

GET_TOKEN = "/csrf/get-token"


@pytest.fixture
async def async_client_with_csrf(fake_db):
    app.dependency_overrides[get_db] = fake_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as async_client:
        yield async_client


@pytest.mark.anyio
async def test_GET_get_token_route_returns_csrf_token_in_json(async_client_with_csrf):
    response = await async_client_with_csrf.get(GET_TOKEN)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "csrf_token" in data


@pytest.mark.anyio
async def test_GET_get_token_sets_cookie_on_response(async_client_with_csrf):
    response = await async_client_with_csrf.get(GET_TOKEN)

    cookies = response.cookies
    assert "fastapi-csrf-token" in cookies


@pytest.mark.anyio
@pytest.mark.parametrize("method", ["DELETE", "PATCH", "POST", "PUT"])
async def test_GET_get_token_returns_token_and_cookie_passing_verify_csrf(
    async_client_with_csrf, method
):
    response = await async_client_with_csrf.get(GET_TOKEN)
    token = response.json()["csrf_token"]
    cookie = response.headers["set-cookie"]
    request = Request(
        {
            "method": method,
            "type": "http",
            "headers": [
                (b"x-csrf-token", token.encode()),
                (b"cookie", cookie.encode()),
            ],
        }
    )

    result = await verify_csrf(request)

    assert result is True
