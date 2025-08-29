from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE_PATH = Path("..", ".env")


class Settings(BaseSettings):
    api_location: str
    csrf_secret_key: str
    home_location: str
    mongodb_uri: str
    secret_key: str

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings.model_validate({})
