"""Application configuration (env-driven, 12-factor)."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── App ──
    app_name: str = "JalDrishti API"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"
    debug: bool = True

    # ── Database (PostGIS) ──
    postgres_user: str = "jaldrishti"
    postgres_password: str = "jaldrishti"
    postgres_db: str = "jaldrishti"
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    # ── Redis / Celery ──
    redis_url: str = "redis://localhost:6379/0"

    # ── Storage (originals, rasters, reports) ──
    storage_dir: str = "/data/storage"

    # ── CORS ──
    cors_origins: str = "http://localhost:5180,http://127.0.0.1:5180"

    # ── Geospatial defaults (see PROJECT_CONTEXT.md §9) ──
    metric_crs: str = "EPSG:32643"  # UTM 43N — never compute area/distance in degrees
    default_buffer_m: int = 150
    default_time_window_days: int = 120
    cloud_threshold_pct: int = 10

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
