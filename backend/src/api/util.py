from fastapi import HTTPException
from odmantic import ObjectId, engine

from src.dependencies import Db


async def find_one_or_404(
    db: Db, model: type[engine.ModelType], id: ObjectId, error_text="Not found"
):
    result = await db.find_one(model, model.id == id)
    if result is None:
        raise HTTPException(status_code=404, detail=error_text)
    return result
