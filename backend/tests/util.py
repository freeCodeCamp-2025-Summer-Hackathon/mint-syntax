from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta

import faker
from odmantic.session import AIOSession

from src.auth import get_password_hash
from src.models import Idea, User

fake = faker.Faker()


def create_user():
    username = f"test_{fake.unique.user_name()}"
    return User.model_validate(
        {
            "username": username,
            "name": fake.name(),
            "is_active": fake.boolean(),
            "is_admin": fake.boolean(),
            "upvotes": [],
            "downvotes": [],
            "hashed_password": get_password_hash(f"{username}_password"),
        }
    )


def create_idea(creator: User):
    return Idea.model_validate(
        {
            "name": fake.sentence(nb_words=5, variable_nb_words=True),
            "description": fake.paragraph(nb_sentences=5, variable_nb_sentences=True),
            "upvoted_by": [],
            "downvoted_by": [],
            "creator_id": creator.id,
        }
    )


@asynccontextmanager
async def setup_ideas(real_db: AIOSession, user: User, count: int):
    ideas = [create_idea(user) for _ in range(count)]
    try:
        await real_db.save_all(ideas)
        yield ideas
    finally:
        for idea in ideas:
            await real_db.delete(idea)


@asynccontextmanager
async def setup_users(real_db: AIOSession, count: int = 1):
    users = [create_user() for _ in range(count)]
    try:
        await real_db.save_all(users)
        yield users
    finally:
        for user in users:
            await real_db.delete(user)


def now_plus_delta(delta: timedelta = timedelta()):
    return datetime.now(UTC) + delta
