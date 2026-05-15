"""Configuración tipada del backend. Carga desde .env vía pydantic-settings."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _read_secret_or_env(file_env: str | None, plain: str) -> str:
    """Resuelve un secreto: prioriza file (Docker secrets) sobre env directo."""
    if file_env:
        path = Path(file_env)
        if path.exists():
            return path.read_text(encoding="utf-8").strip()
    return plain


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "portal-act3"
    app_env: str = Field(default="local", description="local | staging | prod")
    debug: bool = True

    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:4200", "http://127.0.0.1:4200"]
    )

    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    # Convención Docker secrets: si vienen `*_FILE`, leemos el contenido del archivo
    supabase_anon_key_file: str = ""
    supabase_service_role_key_file: str = ""
    # URL pública del API de Storage (usada para construir links de descarga
    # visibles al usuario). En interno hablamos por `supabase_url`.
    supabase_public_url: str = ""
    # Bucket donde viven los entregables (ZIP + PDF reporte).
    entregables_bucket: str = "entregables-portal-act3"

    pddl_dir: Path = Path(__file__).resolve().parents[3].parent / "entregables" / "pddl"
    plans_dir: Path = Path(__file__).resolve().parents[3].parent / "entregables" / "planes"

    singularity_image_path: Path | None = None
    singularity_planner_name: str = "delfi"
    plan_timeout_seconds: int = 1800

    def resolved_supabase_service_role_key(self) -> str:
        return _read_secret_or_env(self.supabase_service_role_key_file, self.supabase_service_role_key)

    def resolved_supabase_anon_key(self) -> str:
        return _read_secret_or_env(self.supabase_anon_key_file, self.supabase_anon_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
