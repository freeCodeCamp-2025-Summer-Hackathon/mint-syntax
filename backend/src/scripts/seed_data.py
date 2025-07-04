import asyncio

from faker import Faker
from odmantic import ObjectId

from src.database import engine
from src.models import Idea, User

fake = Faker()


def generate_user() -> User:
    return User(name=fake.name())  # type: ignore


async def seed_users(num_users: int = 10) -> list[User]:
    new_users = [generate_user() for _ in range(num_users)]
    await engine.save_all(new_users)
    return new_users


def generate_votes(voter_ids: list[ObjectId]) -> list[ObjectId]:
    return list(fake.random_elements(voter_ids, unique=True))


def generate_idea(user_ids: list[ObjectId]) -> Idea:
    creator_id = fake.random_element(user_ids)
    return Idea(
        name=fake.sentence(nb_words=5, variable_nb_words=True),
        description=fake.paragraph(nb_sentences=5, variable_nb_sentences=True),
        creator_id=creator_id,
        # TODO: prevent single user from both upvoting and downvoting
        upvoted_by=[
            voter_id for voter_id in generate_votes(user_ids) if voter_id != creator_id
        ],
        downvoted_by=[
            voter_id for voter_id in generate_votes(user_ids) if voter_id != creator_id
        ],
    )  # type: ignore


async def seed_ideas(user_ids: list[ObjectId], num_ideas: int = 20) -> list[Idea]:
    new_ideas = [generate_idea(user_ids) for _ in range(num_ideas)]
    await engine.save_all(new_ideas)
    return new_ideas


async def main():
    await seed_users()
    users = await engine.find(User)
    user_ids = [user.id for user in users]
    if not user_ids:
        raise RuntimeError("No user ids found in the database; cannot seed ideas.")
    await seed_ideas(user_ids)
    print("Database seeded successfully.")


if __name__ == "__main__":
    asyncio.run(main())
