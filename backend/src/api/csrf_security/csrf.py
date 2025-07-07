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
