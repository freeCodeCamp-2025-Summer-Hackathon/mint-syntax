from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from typing import Literal

import faker
from odmantic.session import AIOSession

from src.models import Idea, User

from .data_sample import argon2_password_hash

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
            "hashed_password": argon2_password_hash,
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


@asynccontextmanager
async def setup_votes(
    real_db: AIOSession,
    user: User,
    ideas: list[Idea],
    which: Literal["downvote", "upvote"],
):
    user_id = user.id
    try:
        for idea in ideas:
            if which == "downvote":
                idea.downvoted_by.append(user_id)
                user.downvotes.append(idea.id)
            else:
                idea.upvoted_by.append(user_id)
                user.upvotes.append(idea.id)

        await real_db.save_all(ideas)
        await real_db.save(user)
        yield
    finally:
        for idea in ideas:
            if which == "downvote":
                idea.downvoted_by.remove(user_id)
                user.downvotes.remove(idea.id)
            else:
                idea.upvoted_by.remove(user_id)
                user.upvotes.remove(idea.id)
        await real_db.save_all(ideas)
        await real_db.save(user)


def now_plus_delta(delta: timedelta = timedelta()):
    return datetime.now(UTC) + delta
