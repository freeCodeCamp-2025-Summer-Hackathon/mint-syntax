from fastapi import Request
from fastapi_csrf_protect import CsrfProtect
from pydantic_settings import BaseSettings

from src.config import get_settings

settings = get_settings()


class CsrfSettings(BaseSettings):
    secret_key: str = settings.csrf_secret_key
    cookie_samesite: str = "lax"  # or "strict" for production
    cookie_secure: bool = False  # True in production with HTTPS


@CsrfProtect.load_config
def get_csrf_config():
    return CsrfSettings()


csrf_protect = CsrfProtect()


async def validate_csrf(request: Request) -> bool:
    safe_methods = ["GET", "HEAD", "OPTIONS"]
    if request.method in safe_methods:
        return True
    await csrf_protect.validate_csrf(request)
    return True
