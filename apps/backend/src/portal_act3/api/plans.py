"""Endpoints `/api/plans` — sirve los planes generados (.txt)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from portal_act3.config import get_settings
from portal_act3.domain.pddl_validator import parse_plan, sha256_lf


class PlanFileInfo(BaseModel):
    slug: str
    filename: str
    size_bytes: int
    sha256: str
    actions_count: int
    total_cost: float


router = APIRouter()


@router.get("", response_model=list[PlanFileInfo])
async def list_plans() -> list[PlanFileInfo]:
    settings = get_settings()
    if not settings.plans_dir.exists():
        return []
    out: list[PlanFileInfo] = []
    for path in sorted(settings.plans_dir.glob("*-plan.txt")):
        text = path.read_text(encoding="utf-8")
        parsed = parse_plan(text)
        out.append(
            PlanFileInfo(
                slug=path.stem.replace("-plan", ""),
                filename=path.name,
                size_bytes=len(text.encode("utf-8")),
                sha256=sha256_lf(text),
                actions_count=len(parsed.actions),
                total_cost=parsed.total_cost,
            )
        )
    return out


@router.get("/{slug}", response_class=PlainTextResponse)
async def get_plan_file(slug: str) -> str:
    settings = get_settings()
    safe = slug.replace("/", "").replace("\\", "").replace("..", "")
    candidate = settings.plans_dir / f"{safe}-plan.txt"
    if not candidate.exists():
        candidate = settings.plans_dir / f"{safe}.txt"
    if not candidate.exists():
        raise HTTPException(status_code=404, detail=f"plan no encontrado: {safe}")
    return candidate.read_text(encoding="utf-8")
