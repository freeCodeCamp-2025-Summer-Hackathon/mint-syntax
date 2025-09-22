import fastapi
import pytest
from fastapi.testclient import TestClient
from fastapi_csrf_protect.exceptions import (
    InvalidHeaderError,
    MissingTokenError,
    TokenValidationError,
)

from src.csrf import verify_csrf
from src.main import app


@pytest.fixture
def create_request():
    defaults = {
        "type": "http",
        "headers": [],
    }

    def wrapper(**options):
        return fastapi.requests.Request(defaults | options)

    return wrapper


@pytest.mark.anyio
@pytest.mark.parametrize(
    "method",
    [
        "GET",
        "HEAD",
        "OPTIONS",
    ],
)
async def test_verify_csrf_returns_True_when_safe_method_is_used(
    create_request, method
):
    request = create_request(method=method)

    result = await verify_csrf(request) is True

    assert result is True


@pytest.mark.anyio
@pytest.mark.parametrize(
    "method",
    [
        "DELETE",
        "POST",
        "PUT",
        "PATCH",
    ],
)
@pytest.mark.parametrize(
    ("headers", "raised_exception", "error"),
    [
        pytest.param(
            [], MissingTokenError, "Missing Cookie", id="without cookie and token"
        ),
        pytest.param(
            [(b"cookie", b"fastapi-csrf-token=something;")],
            InvalidHeaderError,
            'Expected "X-CSRF-Token"',
            id="with cookie only",
        ),
        pytest.param(
            [
                (b"cookie", b"fastapi-csrf-token=something;"),
                (b"x-csrf-token", b"value"),
            ],
            TokenValidationError,
            "CSRF token is invalid",
            id="with invalid cookie and token",
        ),
    ],
)
async def test_verify_csrf_raises_when_protected_method_is_used_and_request_misses_valid_tokens(  # noqa: E501
    create_request, method, headers, raised_exception, error
):
    request = create_request(method=method, headers=headers)

    with pytest.raises(raised_exception) as exception:
        await verify_csrf(request)
    assert error in exception.value.message


@pytest.mark.anyio
@pytest.mark.parametrize(
    "method",
    [
        "DELETE",
        "POST",
        "PUT",
        "PATCH",
    ],
)
async def test_verify_csrf_should_return_true_for_protected_method_with_valid_cookie_and_token(  # noqa: E501
    create_request, method
):
    client = TestClient(app)
    response = client.get("/csrf/get-token")

    assert response.status_code == 200

    cookie = response.headers["set-cookie"]
    token = response.json()["csrf_token"]
    request = create_request(
        method=method,
        headers=[(b"cookie", cookie.encode()), (b"x-csrf-token", token.encode())],
    )
    result = await verify_csrf(request)

    assert result is True
