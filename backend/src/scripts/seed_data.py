import asyncio

from faker import Faker
from odmantic import ObjectId

from src.auth import get_password_hash
from src.database import get_engine
from src.models import Idea, User

fake = Faker()


def generate_user() -> User:
    return User.model_validate(
        {
            "name": fake.name(),
            "username": fake.user_name(),
            "hashed_password": get_password_hash(fake.password()),
        }
    )


async def seed_users(num_users: int = 10) -> list[User]:
    admin = User.model_validate(
        {
            "username": "adminUser",
            "name": "Admin",
            "hashed_password": get_password_hash("password"),
            "is_admin": True,
        }
    )
    new_users = [generate_user() for _ in range(num_users)] + [admin]
    engine = await get_engine()
    await engine.save_all(new_users)
    return new_users


def generate_votes(voter_ids: list[ObjectId]) -> list[ObjectId]:
    return list(fake.random_elements(voter_ids, unique=True))


def generate_idea(user_ids: list[ObjectId], user_lookup: dict[ObjectId, User]) -> Idea:
    creator_id = fake.random_element(user_ids)
    new_idea = Idea.model_validate(
        {
            "name": fake.sentence(nb_words=5, variable_nb_words=True),
            "description": fake.paragraph(nb_sentences=5, variable_nb_sentences=True),
            "creator_id": creator_id,
        }
    )

    for voter_id in generate_votes(user_ids):
        if voter_id != creator_id:
            up_vote_bool = fake.random_element([True, False])
            voter = user_lookup[voter_id]
            if up_vote_bool:
                new_idea.upvoted_by.append(voter_id)
                voter.upvotes.append(new_idea.id)
            else:  # downvote
                new_idea.downvoted_by.append(voter_id)
                voter.downvotes.append(new_idea.id)
    return new_idea


async def seed_ideas(user_ids: list[ObjectId], num_ideas: int = 20) -> list[Idea]:
    engine = await get_engine()
    users = await engine.find(User)
    user_lookup = {user.id: user for user in users}
    new_ideas = [generate_idea(user_ids, user_lookup) for _ in range(num_ideas)]

    await engine.save_all(new_ideas)
    await engine.save_all(users)
    return new_ideas


# TODO: add optional database pruning before seeding
async def main():
    await seed_users()
    engine = await get_engine()
    users = await engine.find(User)
    user_ids = [user.id for user in users]
    if not user_ids:
        raise RuntimeError("No user ids found in the database; cannot seed ideas.")
    await seed_ideas(user_ids)
    print("Database seeded successfully.")


if __name__ == "__main__":
    asyncio.run(main())
