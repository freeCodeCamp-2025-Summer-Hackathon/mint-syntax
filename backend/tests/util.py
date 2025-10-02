from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from random import randint
from typing import Literal

import faker
from odmantic.session import AIOSession

from src.models import Idea, User

from .data_sample import argon2_password_hash

fake = faker.Faker()


def create_user(**options) -> User:
    username = f"test_{fake.unique.user_name()}"
    defaults = {
        "username": username,
        "name": fake.name(),
        "is_active": fake.boolean(),
        "is_admin": fake.boolean(),
        "upvotes": [],
        "downvotes": [],
        "hashed_password": argon2_password_hash,
    }
    return User.model_validate(defaults | options)


def create_idea(creator: User) -> Idea:
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
async def setup_ideas(
    real_db: AIOSession, user: User, count: int
) -> AsyncGenerator[list[Idea]]:
    ideas = [create_idea(user) for _ in range(count)]
    try:
        await real_db.save_all(ideas)
        yield ideas
    finally:
        for idea in ideas:
            await real_db.delete(idea)


@asynccontextmanager
async def setup_users(
    real_db: AIOSession, count: int = 1, **user_options
) -> AsyncGenerator[list[User]]:
    users = [create_user(**user_options) for _ in range(count)]
    try:
        await real_db.save_all(users)
        yield users
    finally:
        for user in users:
            await real_db.delete(user)


@asynccontextmanager
async def setup_idea(
    real_db: AIOSession, user: User | None = None, max_upvotes=10
) -> AsyncGenerator[Idea]:
    async with (
        setup_users(real_db, 1 if user is None else 0) as users,
        setup_ideas(real_db, user if user else users[0], 1) as ideas,
        setup_users(real_db, 10) as voters,
    ):
        [idea] = ideas

        add_votes(voters, idea, max_upvotes)

        await real_db.save_all(voters)
        await real_db.save(idea)
        yield idea


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


def add_votes(voters: list[User], idea: Idea, max_upvotes: int):
    upvotes_count = randint(0, max_upvotes)
    upvoters = voters[:upvotes_count]
    downvoters = voters[upvotes_count:]
    for upvoter in upvoters:
        idea.upvoted_by.append(upvoter.id)
        upvoter.upvotes.append(idea.id)
    for downvoter in downvoters:
        idea.downvoted_by.append(downvoter.id)
        downvoter.downvotes.append(idea.id)


def now_plus_delta(delta: timedelta = timedelta()) -> datetime:
    return datetime.now(UTC) + delta
