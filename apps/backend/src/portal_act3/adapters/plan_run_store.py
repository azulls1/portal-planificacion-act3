"""Persistencia local de plan_runs en JSON.

Mientras Supabase no esté configurado, las ejecuciones se serializan a un
archivo JSON local en `plans_dir/.runs.json`. Esto evita perder el estado
ante reinicios del backend en desarrollo.
"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from uuid import UUID

from portal_act3.config import get_settings
from portal_act3.domain.models import PlanRun


class PlanRunStore:
    """Cache + persistencia thread-safe de PlanRun."""

    def __init__(self, storage_path: Path | None = None) -> None:
        settings = get_settings()
        self._path = storage_path or (settings.plans_dir / ".runs.json")
        self._lock = threading.RLock()
        self._cache: dict[UUID, PlanRun] = {}
        self._load()

    def _load(self) -> None:
        if not self._path.exists():
            return
        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return
        for entry in raw:
            try:
                run = PlanRun.model_validate(entry)
                self._cache[run.run_id] = run
            except Exception:
                continue

    def _flush(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        serialized = [run.model_dump(mode="json") for run in self._cache.values()]
        self._path.write_text(
            json.dumps(serialized, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    def get(self, run_id: UUID) -> PlanRun | None:
        with self._lock:
            return self._cache.get(run_id)

    def put(self, run: PlanRun) -> None:
        with self._lock:
            self._cache[run.run_id] = run
            self._flush()

    def list_all(self) -> list[PlanRun]:
        with self._lock:
            return sorted(
                self._cache.values(),
                key=lambda r: r.created_at,
                reverse=True,
            )

    def delete(self, run_id: UUID) -> bool:
        with self._lock:
            if run_id not in self._cache:
                return False
            del self._cache[run_id]
            self._flush()
            return True


_store: PlanRunStore | None = None


def get_plan_run_store() -> PlanRunStore:
    global _store
    if _store is None:
        _store = PlanRunStore()
    return _store
