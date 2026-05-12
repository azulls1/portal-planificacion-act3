"""Modelos Pydantic — contratos entre frontend, API y workers."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class PlanRunStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"


class PlanRunRequest(BaseModel):
    """Payload de entrada para `POST /api/plan-runs`."""

    domain_slug: str = Field(..., examples=["rover-mineral-transport"])
    problem_slug: str = Field(..., examples=["problem-1", "problem-2"])
    planner_name: str = Field(default="delfi", examples=["delfi", "scorpion"])
    timeout_seconds: int = Field(default=1800, ge=10, le=7200)


class PlanRun(BaseModel):
    """Estado de una ejecución del planner."""

    run_id: UUID = Field(default_factory=uuid4)
    domain_slug: str
    problem_slug: str
    planner_name: str
    status: PlanRunStatus = PlanRunStatus.QUEUED
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    plan_text: str | None = None
    plan_cost: float | None = None
    plan_actions_count: int | None = None
    plan_sha256: str | None = None

    stdout: str | None = None
    stderr: str | None = None
    error_message: str | None = None


class PlanAction(BaseModel):
    """Acción individual dentro de un plan parseado."""

    step: int
    action_name: str
    parameters: list[str]


class ParsedPlan(BaseModel):
    """Plan ya parseado a estructura navegable."""

    actions: list[PlanAction]
    total_cost: float
    raw: str


class Scenario(BaseModel):
    """Escenario alternativo de un integrante del equipo."""

    scenario_id: UUID = Field(default_factory=uuid4)
    member_slug: str = Field(..., examples=["alice", "bob"])
    member_name: str
    title: str
    description: str
    problem_slug: str
    differs_from_base: list[str] = Field(
        ...,
        description=(
            "Lista de diferencias respecto a problem-1: "
            "p.ej. ['+1 mineral', '+laboratorio en L7']"
        ),
    )


class TeamMember(BaseModel):
    """Integrante del equipo."""

    slug: str
    name: str
    role: str
    portal_route: str
    scenario_problem_slug: str | None = None
