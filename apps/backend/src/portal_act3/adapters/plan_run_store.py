"""Persistencia de plan_runs.

Estrategia:
- Si Supabase está configurado → write-through a Supabase (source of truth)
  + cache local en memoria.
- Si Supabase NO está configurado → JSON local en `plans_dir/.runs.json`
  (modo degraded).

Tanto el backend como el worker comparten esta capa.
"""

from __future__ import annotations

import json
import logging
import threading
from pathlib import Path
from uuid import UUID

from portal_act3.adapters.supabase_repo import get_supabase_repo
from portal_act3.config import get_settings
from portal_act3.domain.models import PlanRun

logger = logging.getLogger(__name__)


class PlanRunStore:
    """Cache + persistencia thread-safe."""

    def __init__(self, storage_path: Path | None = None) -> None:
        settings = get_settings()
        self._path = storage_path or (settings.plans_dir / ".runs.json")
        self._lock = threading.RLock()
        self._cache: dict[UUID, PlanRun] = {}
        self._repo = get_supabase_repo()
        self._load()

    @property
    def backend_label(self) -> str:
        return "supabase" if not self._repo.degraded else "json-local"

    def _load(self) -> None:
        if not self._repo.degraded:
            runs = self._repo.list_plan_runs(limit=500)
            if runs is not None:
                for run in runs:
                    self._cache[run.run_id] = run
                logger.info("plan_run_store cargó %d runs desde Supabase", len(runs))
                return
            logger.warning(
                "plan_run_store: Supabase configurado pero list_plan_runs falló — "
                "fallback a JSON local"
            )

        # Fallback: JSON local
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
            except Exception:  # noqa: BLE001
                continue

    def _flush_local(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        serialized = [run.model_dump(mode="json") for run in self._cache.values()]
        self._path.write_text(
            json.dumps(serialized, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    def get(self, run_id: UUID) -> PlanRun | None:
        with self._lock:
            run = self._cache.get(run_id)
            if run is not None:
                return run
            # Cache miss → intenta DB (puede ser un run creado por otro proceso)
            if not self._repo.degraded:
                fresh = self._repo.get_plan_run(run_id)
                if fresh is not None:
                    self._cache[run_id] = fresh
                return fresh
            return None

    def put(self, run: PlanRun) -> None:
        with self._lock:
            self._cache[run.run_id] = run
            # Write-through a Supabase si está disponible
            if not self._repo.degraded:
                persisted = self._repo.upsert_plan_run(run)
                if persisted:
                    return
                logger.warning(
                    "plan_run_store: upsert a Supabase falló para run_id=%s — "
                    "guardando solo en cache+JSON local",
                    run.run_id,
                )
            # Modo degraded o fallback: JSON local
            self._flush_local()

    def list_all(self) -> list[PlanRun]:
        with self._lock:
            return sorted(
                self._cache.values(),
                key=lambda r: r.created_at,
                reverse=True,
            )

    def delete(self, run_id: UUID) -> bool:
        with self._lock:
            removed_from_cache = self._cache.pop(run_id, None) is not None
            removed_from_db = False
            if not self._repo.degraded:
                removed_from_db = self._repo.delete_plan_run(run_id)
                if removed_from_cache:
                    return True
                return removed_from_db
            if removed_from_cache:
                self._flush_local()
            return removed_from_cache


_store: PlanRunStore | None = None


def get_plan_run_store() -> PlanRunStore:
    global _store
    if _store is None:
        _store = PlanRunStore()
    return _store
