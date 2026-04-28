from datetime import UTC, datetime
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "NEMO CrudeFlow API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str | None = None
    cors_origins: str = Field(default="http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001")
    gemma4_api_url: str = "https://openrouter.ai/api/v1/chat/completions"
    gemma4_model: str = "google/gemma-3-27b-it"
    gemma4_api_key: str | None = None
    gemma4_timeout_seconds: int = 30

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @staticmethod
    def now_iso() -> str:
        return datetime.now(UTC).isoformat()


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
