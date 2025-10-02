from datetime import timedelta
from types import NoneType
from unittest import mock

import jwt
import pytest
from fastapi import HTTPException
from odmantic import ObjectId

from src.auth import (
    ACCESS_TOKEN_DELTA,
    JWT_ALGORITHM,
    REFRESH_TOKEN_DELTA,
    authenticate_user,
    create_access_token,
    create_tokens,
    decode_token,
    get_current_active_admin,
    get_current_active_user,
    get_current_user,
    refresh_access_token,
    set_refresh_token_cookie,
    verify_and_update_password,
    verify_password,
)
from src.models import TokenData, User

from .data_sample import (
    argon2_different_password_hash,
    argon2_password_hash,
    bcrypt_different_password_hash,
    bcrypt_password_hash,
    user1,
    user_admin,
    user_disabled,
    user_disabled_with_outdated_hash,
    users,
)
from .util import now_plus_delta


@pytest.fixture
def jwt_fixtures():
    return {
        "sample": {"sample": "data"},
        "sample_refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGFlZjdkODhiYjM3ZDhmZGQ3ZmE1ODYiLCJleHAiOjE3NTY5MDE5Nzd9.axRRkdmGkFEbXpe1bV1YRi6AQwChvAW8AUSu8NdQ7So",  # noqa: E501
        "credential_exception": {
            "status_code": 401,
            "headers": {"WWW-Authenticate": "Bearer"},
        },
    }


@pytest.fixture
def encoded_token(jwt_secret_key, request):
    payload, other_args = request.param
    encode_args = {
        "payload": {"sub": str(user1.id), "exp": now_plus_delta(timedelta(minutes=5))},
        "key": jwt_secret_key,
        "algorithm": JWT_ALGORITHM,
    }
    encode_args["payload"].update(payload)
    encode_args.update(other_args)

    return jwt.encode(**encode_args)


INVALID_TOKENS = [
    pytest.param("not a token", id="not a token"),
    pytest.param(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGFlZjdkODhiYjM3ZDhmZGQ3ZmE1ODYiLCJleHAiOjE3NTY5MDE5Nzd9",
        id="cutoff token",
    ),
]


INVALID_DATA_TOKENS = [
    pytest.param(
        (
            {},
            {
                "key": "random-different-key",
            },
        ),
        id="encoded with different secret key",
    ),
    pytest.param(
        (
            {},
            {
                "payload": {
                    "exp": now_plus_delta(timedelta(minutes=5)),
                }
            },
        ),
        id="token doesn't have sub claim",
    ),
    pytest.param(
        (
            {
                "sub": str(user1.id),
                "exp": now_plus_delta(timedelta(seconds=-1)),
            },
            {},
        ),
        id="token is expired",
    ),
]


@pytest.mark.parametrize(
    ("plain_password", "hashed_password", "expected"),
    [
        pytest.param(
            "password",
            argon2_password_hash,
            True,
            id="returns True for correct password (argon2)",
        ),
        pytest.param(
            "password",
            argon2_different_password_hash,
            False,
            id="returns False for incorrect password (argon2)",
        ),
        pytest.param(
            "",
            argon2_password_hash,
            False,
            id="returns False for blank password (argon2)",
        ),
        pytest.param(
            "password",
            bcrypt_password_hash,
            True,
            id="returns True for correct password (bcrypt)",
        ),
        pytest.param(
            "password",
            bcrypt_different_password_hash,
            False,
            id="returns False for incorrect password (bcrypt)",
        ),
        pytest.param(
            "",
            bcrypt_password_hash,
            False,
            id="returns False for blank password (bcrypt)",
        ),
    ],
)
def test_verify_password(plain_password, hashed_password, expected):
    assert verify_password(plain_password, hashed_password) is expected


@pytest.mark.parametrize(
    ("plain_password", "hashed_password", "expected", "expected_rehash_type"),
    [
        pytest.param(
            "password",
            argon2_password_hash,
            True,
            NoneType,
            id=(
                "returns True and None for correct password, "
                "(argon2) not requiring rehasing"
            ),
        ),
        pytest.param(
            "password",
            argon2_different_password_hash,
            False,
            NoneType,
            id=(
                "returns False and None for incorrect password, "
                "(argon2) not requiring rehasing"
            ),
        ),
        pytest.param(
            "password",
            bcrypt_password_hash,
            True,
            str,
            id=(
                "returns True and str with new hash for correct password, "
                "(bcrypt) requiring rehasing"
            ),
        ),
        pytest.param(
            "password",
            bcrypt_different_password_hash,
            False,
            NoneType,
            id="returns False and None for incorrect password (bcrypt)",
        ),
    ],
)
def test_verify_and_update_password(
    plain_password, hashed_password, expected, expected_rehash_type
):
    is_valid, maybe_new_hash = verify_and_update_password(
        plain_password, hashed_password
    )
    assert is_valid is expected
    assert isinstance(maybe_new_hash, expected_rehash_type)


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("user", "plain_password", "expected"),
    [
        pytest.param(
            user1.username,
            "password",
            user1,
            id="returns user when credentials are correct",
        ),
        pytest.param(
            user_admin.username,
            "different_password",
            user_admin,
            id="returns different user when credentials are correct",
        ),
        pytest.param(
            "no-such-username",
            "",
            False,
            id="returns False when user doesn't exist",
        ),
        pytest.param(
            "",
            "",
            False,
            id="returns False when user is empty string",
        ),
        pytest.param(
            user1.username,
            "not correct password",
            False,
            id="returns False when password is not correct",
        ),
    ],
)
async def test_authenticate_user(fake_db, user, plain_password, expected):
    assert await authenticate_user(fake_db, user, plain_password) == expected


@pytest.mark.anyio
async def test_authenticate_user_updates_outdated_bcrypt_hash_when_password_is_correct(
    fake_db,
):
    initial_hash = user_disabled_with_outdated_hash.hashed_password
    result = await authenticate_user(
        fake_db, user_disabled_with_outdated_hash.username, "different_password"
    )

    assert isinstance(result, User)
    assert result.hashed_password != initial_hash
    fake_db.save.assert_called_once_with(user_disabled_with_outdated_hash)

    user_disabled_with_outdated_hash.hashed_password = initial_hash


def test_create_access_token_creates_different_jwt_with_different_config_secret_key(
    patch_jwt_secret_key, jwt_fixtures
):
    patch_jwt_secret_key()
    token1 = create_access_token(jwt_fixtures["sample"])
    patch_jwt_secret_key("different-test-secret-key")
    token2 = create_access_token(jwt_fixtures["sample"])

    assert token1 != token2


@pytest.mark.parametrize(
    "data",
    [
        {"sample": "data"},
        {"data1": 1, "data2": 2},
    ],
)
def test_create_access_token_encoded_token_has_correct_data(patch_jwt_secret_key, data):
    secret_key = patch_jwt_secret_key()
    token = create_access_token(data)
    decoded = jwt.decode(token, secret_key, algorithms=[JWT_ALGORITHM])

    assert "exp" in decoded
    for key, value in data.items():
        assert decoded[key] == value
    for key, value in decoded.items():
        if key == "exp":
            continue
        assert data[key] == value


@pytest.mark.parametrize(
    "expiration_delta",
    [
        pytest.param(
            ACCESS_TOKEN_DELTA,
            id="default access token expiration delta",
        ),
        pytest.param(
            REFRESH_TOKEN_DELTA,
            id="default refresh token expiration delta",
        ),
        pytest.param(
            timedelta(seconds=10),
            id="10 seconds token expiration delta",
        ),
        pytest.param(
            timedelta(hours=10),
            id="10 hours token expiration delta",
        ),
    ],
)
def test_create_access_token_creates_token_expiring_at_specified_time(
    patch_jwt_secret_key, expiration_delta
):
    secret_key = patch_jwt_secret_key()
    token = create_access_token({}, expires_delta=expiration_delta)

    decoded = jwt.decode(token, secret_key, algorithms=[JWT_ALGORITHM])
    expected = now_plus_delta(expiration_delta).timestamp()

    tolerancy_in_secs = 5
    assert decoded["exp"] == pytest.approx(expected, abs=tolerancy_in_secs)


@pytest.mark.parametrize(
    "user_id",
    [str(user1.id), str(user_admin.id), str(user_disabled_with_outdated_hash.id)],
)
def test_create_tokens_returns_two_tokens_and_refresh_token_expiration(
    patch_jwt_secret_key, user_id
):
    secret_key = patch_jwt_secret_key()
    access_token, refresh_token, refresh_token_expiration_delta = create_tokens(user_id)

    decoded_access_token = jwt.decode(
        access_token, secret_key, algorithms=[JWT_ALGORITHM]
    )
    decoded_refresh_token = jwt.decode(
        refresh_token, secret_key, algorithms=[JWT_ALGORITHM]
    )

    keys_expected_in_token = ("exp", "sub")
    for token in (decoded_access_token, decoded_refresh_token):
        for key in keys_expected_in_token:
            assert key in token
        assert token["sub"] == user_id

    assert decoded_access_token["exp"] < decoded_refresh_token["exp"]
    assert isinstance(refresh_token_expiration_delta, timedelta)

    expiration_timestamp = now_plus_delta(refresh_token_expiration_delta).timestamp()
    tolerancy_in_secs = 5
    assert decoded_refresh_token["exp"] == pytest.approx(
        expiration_timestamp, abs=tolerancy_in_secs
    )


def test_set_refresh_token_cookie_calls_set_cookie_method(jwt_fixtures):
    fake_response = mock.Mock()
    set_refresh_token_cookie(
        fake_response, jwt_fixtures["sample_refresh_token"], REFRESH_TOKEN_DELTA
    )

    cookie_expiration = int(REFRESH_TOKEN_DELTA.total_seconds())
    fake_response.set_cookie.assert_called_once_with(
        "refresh_token",
        jwt_fixtures["sample_refresh_token"],
        httponly=True,
        expires=cookie_expiration,
    )


@pytest.mark.parametrize(
    ("sample_user_token", "user_id"),
    [(user.id, str(user.id)) for user in users.values()],
    indirect=["sample_user_token"],
)
def test_decode_token_returns_decoded_data_with_user_id(
    patch_jwt_secret_key, sample_user_token, user_id
):
    patch_jwt_secret_key()
    decoded = decode_token(sample_user_token)

    assert isinstance(decoded, TokenData)
    assert str(decoded.id) == user_id


@pytest.mark.parametrize(
    "invalid_token",
    INVALID_TOKENS,
)
def test_decode_token_raises_when_token_is_invalid(
    patch_jwt_secret_key, jwt_fixtures, invalid_token
):
    patch_jwt_secret_key()

    with pytest.raises(HTTPException) as exception:
        decode_token(invalid_token)

    expected = jwt_fixtures["credential_exception"]
    assert exception.value.status_code == expected["status_code"]
    assert exception.value.headers == expected["headers"]


@pytest.mark.parametrize("encoded_token", INVALID_DATA_TOKENS, indirect=True)
def test_decode_token_raises_when_token_data_is_invalid(
    patch_jwt_secret_key, jwt_fixtures, encoded_token
):
    patch_jwt_secret_key()
    with pytest.raises(HTTPException) as exception:
        decode_token(encoded_token)

    expected = jwt_fixtures["credential_exception"]
    assert exception.value.status_code == expected["status_code"]
    assert exception.value.headers == expected["headers"]


@pytest.mark.anyio
@pytest.mark.parametrize(
    "sample_user_token",
    (ObjectId() for _ in range(5)),
    indirect=True,
)
async def test_get_current_user_raises_when_token_doesnt_contain_id_of_existing_user(
    fake_db, sample_user_token, jwt_fixtures
):
    with pytest.raises(HTTPException) as exception:
        await get_current_user(fake_db, sample_user_token)

    expected = jwt_fixtures["credential_exception"]
    assert exception.value.status_code == expected["status_code"]
    assert exception.value.headers == expected["headers"]


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("sample_user_token", "expected"),
    ((user.id, user) for user in users.values()),
    indirect=["sample_user_token"],
)
async def test_get_current_user_returns_existing_user_for_valid_token(
    fake_db, patch_jwt_secret_key, sample_user_token, expected
):
    patch_jwt_secret_key()
    user = await get_current_user(fake_db, sample_user_token)
    assert user == expected


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("sample_user_token", "user_id"),
    [(user.id, str(user.id)) for user in users.values()],
    indirect=["sample_user_token"],
)
async def test_refresh_token_returns_new_access_token_for_valid_token(
    fake_db, patch_jwt_secret_key, jwt_secret_key, sample_user_token, user_id
):
    patch_jwt_secret_key()
    result = await refresh_access_token(fake_db, sample_user_token)

    assert "access_token" in result
    assert "token_type" in result
    assert result["token_type"] == "bearer"

    decoded = jwt.decode(
        result["access_token"], jwt_secret_key, algorithms=[JWT_ALGORITHM]
    )
    assert "sub" in decoded
    assert str(decoded["sub"]) == user_id


@pytest.mark.anyio
@pytest.mark.parametrize(
    "invalid_token",
    INVALID_TOKENS,
)
async def test_refresh_token_raises_when_token_is_invalid(
    fake_db, patch_jwt_secret_key, jwt_fixtures, invalid_token
):
    patch_jwt_secret_key()

    with pytest.raises(HTTPException) as exception:
        await refresh_access_token(fake_db, invalid_token)

    expected = jwt_fixtures["credential_exception"]
    assert exception.value.status_code == expected["status_code"]
    assert exception.value.headers == expected["headers"]


@pytest.mark.anyio
@pytest.mark.parametrize(
    "encoded_token",
    INVALID_DATA_TOKENS
    + [
        pytest.param(
            (
                {
                    "sub": str(ObjectId()),
                    "exp": now_plus_delta(timedelta(minutes=5)),
                },
                {},
            ),
            id="no such user",
        ),
    ],
    indirect=True,
)
async def test_refresh_token_raises_when_token_data_is_invalid(
    fake_db, patch_jwt_secret_key, encoded_token, jwt_fixtures
):
    patch_jwt_secret_key()
    with pytest.raises(HTTPException) as exception:
        await refresh_access_token(fake_db, encoded_token)

    expected = jwt_fixtures["credential_exception"]
    assert exception.value.status_code == expected["status_code"]
    assert exception.value.headers == expected["headers"]


@pytest.mark.anyio
@pytest.mark.parametrize(
    "disabled_user", [user_disabled, user_disabled_with_outdated_hash]
)
async def test_get_current_active_user_raises_when_user_is_not_active(disabled_user):
    with pytest.raises(HTTPException) as exception:
        await get_current_active_user(disabled_user)

    assert exception.value.status_code == 400
    assert exception.value.detail == "Inactive user"


@pytest.mark.anyio
@pytest.mark.parametrize("active_user", [user1, user_admin])
async def test_get_current_active_user_returns_user_if_user_is_active(active_user):
    user = await get_current_active_user(active_user)
    assert user == active_user


@pytest.mark.anyio
@pytest.mark.parametrize(
    "non_admin", [user1, user_disabled, user_disabled_with_outdated_hash]
)
async def test_get_current_active_admin_raises_when_user_is_admin(non_admin):
    with pytest.raises(HTTPException) as exception:
        await get_current_active_admin(non_admin)

    assert exception.value.status_code == 403
    assert exception.value.detail == "Not enough permissions"


@pytest.mark.anyio
async def test_get_current_active_admin_returns_user_if_user_is_admin():
    user = await get_current_active_admin(user_admin)

    assert user == user_admin
