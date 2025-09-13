from odmantic import ObjectId

from src.models import Idea, User

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

user1 = User.model_validate(
    {
        "username": "test_user",
        "name": "name of user",
        "is_active": True,
        "is_admin": False,
        "upvotes": [ObjectId() for _ in range(5)],
        "downvotes": [ObjectId() for _ in range(3)],
        "hashed_password": argon2_password_hash,
    }
)
user_admin = User.model_validate(
    {
        "username": "test_adminUser",
        "name": "True Admin",
        "is_active": True,
        "is_admin": True,
        "upvotes": [],
        "downvotes": [],
        "hashed_password": argon2_different_password_hash,
    }
)
user_disabled = User.model_validate(
    {
        "username": "test_disabled",
        "name": "Disabled user",
        "is_active": False,
        "is_admin": False,
        "upvotes": [],
        "downvotes": [],
        "hashed_password": argon2_different_password_hash,
    }
)
user_disabled_with_outdated_hash = User.model_validate(
    {
        "username": "test_old_one",
        "name": "user with bcrypt hash",
        "is_active": False,
        "is_admin": False,
        "upvotes": [],
        "downvotes": [],
        "hashed_password": (
            "$2b$12$jbIAg8E9QU5cx2F0KisxhuhhJnqAMIAWHmKxIcjDHQbOKkVYKPYk6"
        ),
    }
)
user_admin_disabled = User.model_validate(
    {
        "username": "test_disabled_admin",
        "name": "Disabled admin",
        "is_active": False,
        "is_admin": True,
        "upvotes": [],
        "downvotes": [],
        "hashed_password": argon2_different_password_hash,
    }
)

idea1 = Idea.model_validate(
    {
        "name": "Test_Sample idea",
        "description": "Description of the sample idea, not very long.",
        "upvoted_by": [ObjectId() for _ in range(10)],
        "downvoted_by": [ObjectId() for _ in range(2)],
        "creator_id": user1.id,
    }
)
idea2 = Idea.model_validate(
    {
        "name": "Test_Different idea",
        "description": "Different description of the different idea, a bit longer, but still not very long.",  # noqa: E501
        "upvoted_by": [ObjectId() for _ in range(10)],
        "downvoted_by": [ObjectId() for _ in range(2)],
        "creator_id": user_admin.id,
    }
)

ideas = {
    "idea1": idea1,
    "idea2": idea2,
}

users = {
    "user1": user1,
    "user2": user_admin,
    "user3": user_disabled,
    "user4": user_disabled_with_outdated_hash,
    "user5": user_admin_disabled,
}

data: dict = {User: users, Idea: ideas}
