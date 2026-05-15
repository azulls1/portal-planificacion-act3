"""Cliente Supabase singleton.

Si no hay credenciales configuradas, opera en modo `degraded`: las llamadas devuelven
None / lista vacía sin lanzar excepciones, para permitir desarrollo local sin Supabase.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from portal_act3.config import get_settings


class SupabaseDegradedClient:
    """Stand-in cuando Supabase no está configurado."""

    def table(self, name: str) -> SupabaseDegradedTable:
        return SupabaseDegradedTable()

    def storage(self) -> SupabaseDegradedStorage:
        return SupabaseDegradedStorage()


class SupabaseDegradedTable:
    def select(self, *_args: Any, **_kwargs: Any) -> SupabaseDegradedTable:
        return self

    def insert(self, *_args: Any, **_kwargs: Any) -> SupabaseDegradedTable:
        return self

    def update(self, *_args: Any, **_kwargs: Any) -> SupabaseDegradedTable:
        return self

    def eq(self, *_args: Any, **_kwargs: Any) -> SupabaseDegradedTable:
        return self

    def execute(self) -> dict[str, Any]:
        return {"data": [], "count": 0}


class SupabaseDegradedStorage:
    def from_(self, _bucket: str) -> SupabaseDegradedStorage:
        return self

    def upload(self, *_args: Any, **_kwargs: Any) -> dict[str, Any]:
        return {"path": None, "degraded": True}


@lru_cache
def get_supabase_client() -> Any:
    settings = get_settings()
    service_key = settings.resolved_supabase_service_role_key()
    if not settings.supabase_url or not service_key:
        return SupabaseDegradedClient()
    try:
        from supabase import create_client
    except ImportError:
        return SupabaseDegradedClient()
    try:
        return create_client(settings.supabase_url, service_key)
    except Exception:  # noqa: BLE001
        return SupabaseDegradedClient()


def is_degraded() -> bool:
    client = get_supabase_client()
    return isinstance(client, SupabaseDegradedClient)
