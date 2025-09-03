from fastapi import HTTPException
from odmantic import ObjectId, engine

from src.dependencies import Db
from src.models import Idea, User


async def find_one_or_404(
    db: Db, model: type[engine.ModelType], id: ObjectId, error_text="Not found"
):
    result = await db.find_one(model, model.id == id)
    if result is None:
        raise HTTPException(status_code=404, detail=error_text)
    return result


async def idea_or_404(db: Db, id: ObjectId, error_text="Idea not found"):
    return await find_one_or_404(db, Idea, id, error_text)


async def user_or_404(db: Db, id: ObjectId, error_text="User not found"):
    return await find_one_or_404(db, User, id, error_text)
