"""Tarea Celery que ejecuta el planner PDDL sobre Singularity."""

from __future__ import annotations

from typing import Any

from celery.utils.log import get_task_logger

from portal_act3.adapters.singularity_runner import (
    SingularityNotConfiguredError,
    run_planner,
)
from portal_act3.config import get_settings
from portal_act3.domain.pddl_validator import parse_plan, sha256_lf
from portal_act3.tasks.celery_app import celery_app

logger = get_task_logger(__name__)


@celery_app.task(name="portal_act3.run_planner", bind=True)
def run_planner_task(
    self: Any,
    run_id: str,
    domain_slug: str,
    problem_slug: str,
    planner_name: str,
    timeout_seconds: int,
) -> dict[str, Any]:
    """Ejecuta el planner y devuelve un dict serializable.

    No persiste a Supabase directamente — el caller en la API es quien actualiza
    el registro tras consultar el AsyncResult de Celery.
    """
    settings = get_settings()
    domain_path = settings.pddl_dir / f"{domain_slug}.pddl"
    problem_path = settings.pddl_dir / f"{problem_slug}.pddl"
    plan_output = settings.plans_dir / f"{problem_slug}-plan.txt"

    if not domain_path.exists():
        return {
            "run_id": run_id,
            "status": "failed",
            "error_message": f"domain no encontrado: {domain_path}",
        }
    if not problem_path.exists():
        return {
            "run_id": run_id,
            "status": "failed",
            "error_message": f"problem no encontrado: {problem_path}",
        }

    try:
        result = run_planner(
            domain_path=domain_path,
            problem_path=problem_path,
            plan_output_path=plan_output,
            timeout_seconds=timeout_seconds,
        )
    except SingularityNotConfiguredError as exc:
        logger.warning("Singularity no configurado: %s", exc)
        return {
            "run_id": run_id,
            "status": "failed",
            "error_message": str(exc),
        }

    if result.timed_out:
        return {
            "run_id": run_id,
            "status": "timeout",
            "stdout": result.stdout,
            "stderr": result.stderr,
            "error_message": result.error_message,
        }
    if not result.success:
        return {
            "run_id": run_id,
            "status": "failed",
            "stdout": result.stdout,
            "stderr": result.stderr,
            "return_code": result.return_code,
            "error_message": result.error_message or "planner falló sin mensaje",
        }

    parsed = parse_plan(result.plan_text)
    return {
        "run_id": run_id,
        "status": "completed",
        "plan_text": result.plan_text,
        "plan_cost": parsed.total_cost,
        "plan_actions_count": len(parsed.actions),
        "plan_sha256": sha256_lf(result.plan_text),
        "stdout": result.stdout,
        "stderr": result.stderr,
        "planner_name": planner_name,
    }
