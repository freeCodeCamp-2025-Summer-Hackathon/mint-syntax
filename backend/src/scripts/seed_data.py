import asyncio
from argparse import ArgumentParser

from faker import Faker
from odmantic import ObjectId
from odmantic.exceptions import DuplicateKeyError

from src.auth import get_password_hash
from src.database import get_engine
from src.models import Idea, User

fake = Faker()


def create_user() -> User:
    username = fake.user_name()
    return User.model_validate(
        {
            "name": fake.name(),
            "username": username,
            "hashed_password": get_password_hash(username + "_password"),
        }
    )


def create_users(num_users: int = 10) -> list[User]:
    admin = User.model_validate(
        {
            "username": "adminUser",
            "name": "Admin",
            "hashed_password": get_password_hash("password"),
            "is_admin": True,
        }
    )
    return [create_user() for _ in range(num_users)] + [admin]


async def seed_users(num_users: int = 10):
    users = create_users(num_users)
    engine = await get_engine()
    try:
        await engine.save_all(users)
    except DuplicateKeyError as e:
        user = e.instance.model_dump()
        print(f"Duplicated user (not re-created): {user['username']}")
    return users


def create_votes(users: dict[ObjectId, User]) -> dict[ObjectId, User]:
    return {
        user_id: users[user_id]
        for user_id in fake.random_elements(list(users), unique=True)
    }


def create_idea(user_lookup: dict[ObjectId, User]) -> Idea:
    user_ids = list(user_lookup)
    creator_id = fake.random_element(user_ids)
    new_idea = Idea.model_validate(
        {
            "name": fake.sentence(nb_words=5, variable_nb_words=True),
            "description": fake.paragraph(nb_sentences=5, variable_nb_sentences=True),
            "creator_id": creator_id,
        }
    )

    for voter_id, voter in create_votes(user_lookup).items():
        if voter_id != creator_id:
            did_upvote = fake.random_element([True, False])
            if did_upvote:
                new_idea.upvoted_by.append(voter_id)
                voter.upvotes.append(new_idea.id)
            else:  # downvote
                new_idea.downvoted_by.append(voter_id)
                voter.downvotes.append(new_idea.id)
    return new_idea


def create_ideas(users: list[User], num_ideas: int = 20) -> list[Idea]:
    user_lookup = {user.id: user for user in users}
    new_ideas = [create_idea(user_lookup) for _ in range(num_ideas)]
    return new_ideas


async def seed_ideas():
    engine = await get_engine()
    users = await engine.find(User)
    ideas = create_ideas(users)
    await engine.save_all(ideas)
    await engine.save_all(users)


async def purge_data():
    engine = await get_engine()
    print("Dropping collections.")
    await engine.get_collection(Idea).drop()
    await engine.get_collection(User).drop()
    print("Configuring collections.")
    await engine.configure_database((Idea, User))


async def main(purge=True):
    if purge:
        print("Pruning database.")
        await purge_data()
    users = await seed_users()
    if not users:
        raise RuntimeError("No user ids found in the database; cannot seed ideas.")
    await seed_ideas()
    print("Database seeded successfully.")


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--purge", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(**vars(args)))
