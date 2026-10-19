"""Configuration for local development, isolated from business logic."""

from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="INNER_WORLD_",
        env_file=Path(__file__).resolve().parents[2] / ".env",
        extra="ignore",
    )

    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    openai_api_key: SecretStr = SecretStr("")
    openai_model: str = ""
    ai_requests_per_minute: int = Field(default=12, ge=1, le=100)
    ai_requests_per_day: int = Field(default=200, ge=1, le=10000)

    adventure_max_output_tokens: int = Field(default=1200, ge=500, le=2000)

    @property
    def ai_enabled(self) -> bool:
        return bool(self.openai_api_key.get_secret_value() and self.openai_model.strip())
