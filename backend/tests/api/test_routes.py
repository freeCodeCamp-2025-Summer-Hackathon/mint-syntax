import pytest
from httpx import AsyncClient, Request

from tests.data_sample import idea1, user1, user_admin_disabled, user_disabled


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "built_request",
    [
        (f"/ideas/{idea1.id}", "delete"),
        ("/users/", "get"),
        ("/users/add", "post"),
        (f"/users/{user1.id}", "get"),
        (f"/users/{user1.id}", "patch"),
        (f"/users/{user1.id}/ideas", "get"),
    ],
    indirect=True,
)
@pytest.mark.parametrize(
    ("sample_user_token", "expected_detail", "expected_status_code"),
    [
        pytest.param("", "Not authenticated", 401, id="not logged in"),
        pytest.param(user1.id, "Not enough permissions", 403, id="logged in user"),
        pytest.param(user_admin_disabled.id, "Inactive user", 400, id="disabled admin"),
        pytest.param(user_disabled.id, "Inactive user", 400, id="disabled user"),
    ],
    indirect=["sample_user_token"],
)
async def test_admin_only_route_returns_error_if_not_admin_or_disabled_admin(
    patch_jwt_secret_key,
    async_client: AsyncClient,
    built_request: Request,
    sample_user_token,
    expected_detail,
    expected_status_code,
):
    patch_jwt_secret_key()
    if sample_user_token:
        built_request.headers["Authorization"] = f"Bearer {sample_user_token}"

    response = await async_client.send(built_request)

    assert response.status_code == expected_status_code
    assert expected_detail in response.text


@pytest.mark.integration
@pytest.mark.anyio
@pytest.mark.parametrize(
    "built_request",
    [
        ("/ideas/", "post"),
        (f"/ideas/{idea1.id}", "patch"),
        (f"/ideas/{idea1.id}/upvote", "put"),
        (f"/ideas/{idea1.id}/downvote", "put"),
        ("/me", "get"),
        ("/me", "patch"),
        ("/me/ideas", "get"),
        ("/me/upvotes", "get"),
        ("/me/downvotes", "get"),
    ],
    indirect=True,
)
@pytest.mark.parametrize(
    ("sample_user_token", "expected_detail", "expected_status_code"),
    [
        pytest.param("", "Not authenticated", 401, id="not logged in"),
        pytest.param(user_admin_disabled.id, "Inactive user", 400, id="disabled admin"),
        pytest.param(user_disabled.id, "Inactive user", 400, id="disabled user"),
    ],
    indirect=["sample_user_token"],
)
async def test_logged_in_only_route_returns_error_if_not_logged_in_or_disabled(
    patch_jwt_secret_key,
    async_client: AsyncClient,
    built_request: Request,
    sample_user_token,
    expected_detail,
    expected_status_code,
):
    patch_jwt_secret_key()
    if sample_user_token:
        built_request.headers["Authorization"] = f"Bearer {sample_user_token}"

    response = await async_client.send(built_request)

    assert response.status_code == expected_status_code
    assert expected_detail in response.text
