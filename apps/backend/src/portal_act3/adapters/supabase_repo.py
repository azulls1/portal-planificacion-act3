"""Repositorio de Supabase para el portal.

Encapsula las consultas a PostgREST (vía supabase-py) detrás de una interfaz
estrecha por entidad. Si Supabase no está configurado / no responde, los
métodos devuelven `None` o lista vacía y dejan que la capa superior decida
el fallback (hardcoded / JSON local).

Las tablas que toca este repo viven en el schema `public` de la instancia
`supabase-maestria` y comparten el prefijo `portal_act3_*`. Ver
`infra/supabase/migrations/`.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any
from uuid import UUID

from portal_act3.adapters.supabase_client import get_supabase_client, is_degraded
from portal_act3.domain.models import PlanRun, PlanRunStatus, Scenario, TeamMember

logger = logging.getLogger(__name__)

T_SCENARIOS = "portal_act3_scenarios"
T_TEAM_MEMBERS = "portal_act3_team_members"
T_PLAN_RUNS = "portal_act3_plan_runs"
T_AUDIT = "portal_act3_audit_log"


class SupabaseRepo:
    """Repositorio único; instánciese una sola vez por proceso."""

    def __init__(self) -> None:
        self._client = get_supabase_client()
        self._degraded = is_degraded()

    @property
    def degraded(self) -> bool:
        return self._degraded

    # ---------------------------------------------------------------- scenarios
    def list_scenarios(self) -> list[Scenario] | None:
        if self._degraded:
            return None
        try:
            res = (
                self._client.table(T_SCENARIOS)
                .select("*")
                .order("display_order")
                .execute()
            )
            rows = getattr(res, "data", None) or []
            return [self._row_to_scenario(row) for row in rows]
        except Exception:  # noqa: BLE001
            logger.exception("supabase.list_scenarios fallo — fallback")
            return None

    def get_scenario(self, slug: str) -> Scenario | None:
        if self._degraded:
            return None
        try:
            res = (
                self._client.table(T_SCENARIOS)
                .select("*")
                .eq("problem_slug", slug)
                .limit(1)
                .execute()
            )
            rows = getattr(res, "data", None) or []
            if not rows:
                # también probamos por member_slug
                res = (
                    self._client.table(T_SCENARIOS)
                    .select("*")
                    .eq("member_slug", slug)
                    .limit(1)
                    .execute()
                )
                rows = getattr(res, "data", None) or []
            return self._row_to_scenario(rows[0]) if rows else None
        except Exception:  # noqa: BLE001
            logger.exception("supabase.get_scenario fallo")
            return None

    @staticmethod
    def _row_to_scenario(row: dict[str, Any]) -> Scenario:
        return Scenario(
            scenario_id=UUID(row["id"]),
            member_slug=row["member_slug"],
            member_name=row["member_name"],
            title=row["title"],
            description=row["description"],
            problem_slug=row["problem_slug"],
            differs_from_base=row.get("differs_from_base") or [],
        )

    # ------------------------------------------------------------- team members
    def list_team_members(self) -> list[TeamMember] | None:
        if self._degraded:
            return None
        try:
            res = self._client.table(T_TEAM_MEMBERS).select("*").execute()
            rows = getattr(res, "data", None) or []
            return [self._row_to_team_member(row) for row in rows]
        except Exception:  # noqa: BLE001
            logger.exception("supabase.list_team_members fallo")
            return None

    def get_team_member(self, slug: str) -> TeamMember | None:
        if self._degraded:
            return None
        try:
            res = (
                self._client.table(T_TEAM_MEMBERS)
                .select("*")
                .eq("slug", slug)
                .limit(1)
                .execute()
            )
            rows = getattr(res, "data", None) or []
            return self._row_to_team_member(rows[0]) if rows else None
        except Exception:  # noqa: BLE001
            logger.exception("supabase.get_team_member fallo")
            return None

    @staticmethod
    def _row_to_team_member(row: dict[str, Any]) -> TeamMember:
        return TeamMember(
            slug=row["slug"],
            name=row["full_name"],
            role=row.get("role") or "",
            portal_route=f"/{row['slug']}",
            scenario_problem_slug=None,
        )

    # ---------------------------------------------------------------- plan runs
    def upsert_plan_run(self, run: PlanRun) -> bool:
        """Upsert por `run_id`. Devuelve True si se persistió, False si degraded/error."""
        if self._degraded:
            return False
        try:
            payload = self._plan_run_to_row(run)
            (
                self._client.table(T_PLAN_RUNS)
                .upsert(payload, on_conflict="run_id")
                .execute()
            )
            return True
        except Exception:  # noqa: BLE001
            logger.exception("supabase.upsert_plan_run fallo")
            return False

    def get_plan_run(self, run_id: UUID) -> PlanRun | None:
        if self._degraded:
            return None
        try:
            res = (
                self._client.table(T_PLAN_RUNS)
                .select("*")
                .eq("run_id", str(run_id))
                .limit(1)
                .execute()
            )
            rows = getattr(res, "data", None) or []
            return self._row_to_plan_run(rows[0]) if rows else None
        except Exception:  # noqa: BLE001
            logger.exception("supabase.get_plan_run fallo")
            return None

    def list_plan_runs(self, limit: int = 100) -> list[PlanRun] | None:
        if self._degraded:
            return None
        try:
            res = (
                self._client.table(T_PLAN_RUNS)
                .select("*")
                .order("submitted_at", desc=True)
                .limit(limit)
                .execute()
            )
            rows = getattr(res, "data", None) or []
            return [self._row_to_plan_run(row) for row in rows]
        except Exception:  # noqa: BLE001
            logger.exception("supabase.list_plan_runs fallo")
            return None

    def delete_plan_run(self, run_id: UUID) -> bool:
        if self._degraded:
            return False
        try:
            res = (
                self._client.table(T_PLAN_RUNS)
                .delete()
                .eq("run_id", str(run_id))
                .execute()
            )
            rows = getattr(res, "data", None) or []
            return bool(rows)
        except Exception:  # noqa: BLE001
            logger.exception("supabase.delete_plan_run fallo")
            return False

    @staticmethod
    def _plan_run_to_row(run: PlanRun) -> dict[str, Any]:
        return {
            "run_id": str(run.run_id),
            "domain_slug": run.domain_slug,
            "problem_slug": run.problem_slug,
            "planner_name": run.planner_name,
            "status": run.status.value,
            "submitted_at": run.created_at.isoformat(),
            "plan_text": run.plan_text,
            "plan_cost": run.plan_cost,
            "plan_actions_count": run.plan_actions_count,
            "plan_sha256": run.plan_sha256,
            "stdout": run.stdout,
            "stderr": run.stderr,
            "error_message": run.error_message,
        }

    @staticmethod
    def _row_to_plan_run(row: dict[str, Any]) -> PlanRun:
        def _parse_dt(value: Any) -> datetime | None:
            if not value:
                return None
            if isinstance(value, datetime):
                return value
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                return None

        return PlanRun(
            run_id=UUID(row["run_id"]),
            domain_slug=row.get("domain_slug") or "",
            problem_slug=row["problem_slug"],
            planner_name=row.get("planner_name") or "delfi",
            status=PlanRunStatus(row.get("status", "failed")),
            created_at=_parse_dt(row.get("submitted_at")) or datetime.utcnow(),
            updated_at=_parse_dt(row.get("updated_at")) or datetime.utcnow(),
            plan_text=row.get("plan_text"),
            plan_cost=row.get("plan_cost"),
            plan_actions_count=row.get("plan_actions_count"),
            plan_sha256=row.get("plan_sha256"),
            stdout=row.get("stdout"),
            stderr=row.get("stderr"),
            error_message=row.get("error_message"),
        )

    # ---------------------------------------------------------------- audit
    def audit(
        self,
        event_type: str,
        payload: dict[str, Any] | None = None,
        requester_ip: str | None = None,
        user_agent: str | None = None,
    ) -> bool:
        if self._degraded:
            return False
        try:
            self._client.table(T_AUDIT).insert(
                {
                    "event_type": event_type,
                    "payload": payload or {},
                    "requester_ip": requester_ip,
                    "user_agent": user_agent,
                }
            ).execute()
            return True
        except Exception:  # noqa: BLE001
            logger.exception("supabase.audit fallo")
            return False


_repo: SupabaseRepo | None = None


def get_supabase_repo() -> SupabaseRepo:
    global _repo
    if _repo is None:
        _repo = SupabaseRepo()
    return _repo
