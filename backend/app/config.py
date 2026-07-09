from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Reads configuration from environment variables (and a local .env file
    in development). Never hardcode secrets in code — that's what this class
    exists to avoid."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    test_database_url: str | None = None
    redis_url: str
    secret_key: str

    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 30

    cors_origins: str = "http://localhost:3000"

    environment: str = "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached so the .env file is only parsed once per process, and every
    part of the app that calls get_settings() shares the same instance."""
    return Settings()
