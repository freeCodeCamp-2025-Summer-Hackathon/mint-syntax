from types import NoneType

import pytest

from src.auth import authenticate_user, verify_and_update_password, verify_password
from src.models import User

from .data_sample import user1, user_admin, user_outdated_hash

bcrypt_password_hash = "$2b$12$vogVV6RUAZPAb6NVZDNGn.PD2wpIXqAHTtsORL3M13xKEp6dPxv3O"
bcrypt_different_password_hash = (
    "$2b$12$jbIAg8E9QU5cx2F0KisxhuhhJnqAMIAWHmKxIcjDHQbOKkVYKPYk6"
)

argon2_password_hash = (
    "$argon2id$v=19$m=65536,t=3,p=4"
    "$z5nTeq/1vjcmREhpLeW8tw$00EI3g9HVH1fAt57Q648lgljMjz6CNC/NyyYW7T+Bw8"
)
argon2_different_password_hash = (
    "$argon2id$v=19$m=65536,t=3,p=4"
    "$am0Nwfi/N2ZsbY1xjhGCsA$PU4i/z2Cy1S8XPpAFBTFavf2167BnP7oVsSaMDehk+8"
)


@pytest.mark.parametrize(
    ["plain_password", "hashed_password", "expected"],
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
    ["plain_password", "hashed_password", "expected", "expected_rehash_type"],
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
    ["user", "plain_password", "expected"],
    [
        pytest.param(
            user1.username,
            "password",
            user1,
            id="returns user when credentials are correct",
        ),
        pytest.param(
            user_admin.username,
            "2password",
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
async def test_authenticate_user(db, user, plain_password, expected):
    assert await authenticate_user(db, user, plain_password) == expected


@pytest.mark.anyio
async def test_authenticate_user_updates_outdated_bcrypt_hash_when_password_is_correct(
    db,
):
    initial_hash = user_outdated_hash.hashed_password
    result = await authenticate_user(
        db, user_outdated_hash.username, "different_password"
    )

    assert isinstance(result, User)
    assert result.hashed_password != initial_hash
    db.save.assert_called_once_with(user_outdated_hash)

    user_outdated_hash.hashed_password = initial_hash
