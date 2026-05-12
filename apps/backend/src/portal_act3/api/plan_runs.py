"""Endpoints `/api/plan-runs`."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status

from portal_act3.adapters.plan_run_store import get_plan_run_store
from portal_act3.config import get_settings
from portal_act3.domain.models import PlanRun, PlanRunRequest, PlanRunStatus
from portal_act3.domain.pddl_validator import (
    PddlValidationError,
    parse_plan,
    sha256_lf,
    validate_domain,
    validate_problem,
)
from portal_act3.domain.plan_simulator import simulate
from portal_act3.tasks.celery_app import celery_app
from portal_act3.tasks.run_planner import run_planner_task

router = APIRouter()


def _validate_request(request: PlanRunRequest) -> None:
    settings = get_settings()
    domain_path = settings.pddl_dir / f"{request.domain_slug}.pddl"
    problem_path = settings.pddl_dir / f"{request.problem_slug}.pddl"
    if not domain_path.exists():
        raise HTTPException(status_code=404, detail=f"domain no encontrado: {request.domain_slug}")
    if not problem_path.exists():
        raise HTTPException(status_code=404, detail=f"problem no encontrado: {request.problem_slug}")
    try:
        validate_domain(domain_path.read_text(encoding="utf-8"))
        validate_problem(problem_path.read_text(encoding="utf-8"))
    except PddlValidationError as exc:
        raise HTTPException(status_code=422, detail=f"PDDL inválido: {exc}") from exc


@router.post("", status_code=status.HTTP_202_ACCEPTED, response_model=PlanRun)
async def create_plan_run(request: PlanRunRequest) -> PlanRun:
    """Encola una ejecución del planner."""
    _validate_request(request)

    run = PlanRun(
        run_id=uuid4(),
        domain_slug=request.domain_slug,
        problem_slug=request.problem_slug,
        planner_name=request.planner_name,
        status=PlanRunStatus.QUEUED,
    )
    store = get_plan_run_store()
    store.put(run)

    try:
        run_planner_task.apply_async(
            kwargs={
                "run_id": str(run.run_id),
                "domain_slug": request.domain_slug,
                "problem_slug": request.problem_slug,
                "planner_name": request.planner_name,
                "timeout_seconds": request.timeout_seconds,
            },
            task_id=str(run.run_id),
        )
    except Exception as exc:
        run.status = PlanRunStatus.FAILED
        run.error_message = f"no se pudo encolar la tarea: {exc}"
        run.updated_at = datetime.now(UTC)
        store.put(run)
    return run


@router.get("/{run_id}", response_model=PlanRun)
async def get_plan_run(run_id: UUID) -> PlanRun:
    store = get_plan_run_store()
    run = store.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="plan_run no encontrado")

    try:
        async_result = celery_app.AsyncResult(str(run_id))
        celery_state = async_result.state
        ready = async_result.ready()
        result_payload = async_result.result if ready else None
    except Exception:
        return run

    if celery_state == "STARTED":
        run.status = PlanRunStatus.RUNNING
        run.updated_at = datetime.now(UTC)
        store.put(run)
    elif ready:
        result = result_payload if isinstance(result_payload, dict) else {}
        run.status = PlanRunStatus(result.get("status", "failed"))
        run.plan_text = result.get("plan_text")
        run.plan_cost = result.get("plan_cost")
        run.plan_actions_count = result.get("plan_actions_count")
        run.plan_sha256 = result.get("plan_sha256")
        run.stdout = result.get("stdout")
        run.stderr = result.get("stderr")
        run.error_message = result.get("error_message")
        run.updated_at = datetime.now(UTC)
        store.put(run)
    return run


@router.get("", response_model=list[PlanRun])
async def list_plan_runs() -> list[PlanRun]:
    return get_plan_run_store().list_all()


@router.delete("/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan_run(run_id: UUID) -> None:
    if not get_plan_run_store().delete(run_id):
        raise HTTPException(status_code=404, detail="plan_run no encontrado")


@router.post("/{problem_slug}/simulate")
async def simulate_stored_plan(problem_slug: str) -> dict[str, object]:
    """Simula el plan persistido contra el problema correspondiente.

    Útil como tests de regresión semántica sin necesidad del planner.
    """
    settings = get_settings()
    problem_path = settings.pddl_dir / f"{problem_slug}.pddl"
    plan_path = settings.plans_dir / f"rover-{problem_slug}-plan.txt"
    if not problem_path.exists():
        raise HTTPException(status_code=404, detail=f"problem no encontrado: {problem_slug}")
    if not plan_path.exists():
        raise HTTPException(status_code=404, detail=f"plan no encontrado: rover-{problem_slug}-plan.txt")

    problem_text = problem_path.read_text(encoding="utf-8")
    plan_text = plan_path.read_text(encoding="utf-8")
    result = simulate(problem_text, plan_text)

    return {
        "problem_slug": problem_slug,
        "success": result.success,
        "goal_satisfied": result.goal_satisfied,
        "cost": result.cost,
        "actions_count": len(result.steps),
        "plan_sha256": sha256_lf(plan_text),
        "first_error": (
            None
            if result.first_error is None
            else {
                "step": result.first_error.step,
                "action": result.first_error.action,
                "parameters": result.first_error.parameters,
                "error": result.first_error.error,
            }
        ),
        "parsed_cost": parse_plan(plan_text).total_cost,
    }
