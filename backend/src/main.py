from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.main import api_router
from src.config import get_settings

app = FastAPI()

settings = get_settings()

allowed_origins = [settings.home_location]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, query: str | None = None):
    return {"item_id": item_id, "query": query}


app.include_router(api_router)
