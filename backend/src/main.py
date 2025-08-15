from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_csrf_protect.exceptions import CsrfProtectError

from src.api.main import api_router
from src.config import get_settings
from src.csrf import verify_csrf
from src.exception_handlers import csrf_protect_exception_handler

app = FastAPI(dependencies=[Depends(verify_csrf)])

app.exception_handler(CsrfProtectError)(csrf_protect_exception_handler)

settings = get_settings()


allowed_origins = [settings.home_location]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router)
