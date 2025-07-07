from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_csrf_protect.exceptions import CsrfProtectError

from src.api.main import api_router
from src.config import get_settings

app = FastAPI()


@app.exception_handler(CsrfProtectError)
async def csrf_protect_exception_handler(request: Request, exc: CsrfProtectError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": str(exc),
            "path": request.url.path,  # Example usage
        },
    )


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
