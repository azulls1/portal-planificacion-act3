"""Endpoints `/api/pddl-files` — sirve los archivos PDDL del repo."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from portal_act3.config import get_settings
from portal_act3.domain.pddl_validator import (
    PddlValidationError,
    sha256_lf,
    validate_domain,
    validate_problem,
)

router = APIRouter()


class PddlFileInfo(BaseModel):
    slug: str
    kind: str
    size_bytes: int
    sha256: str
    is_valid: bool
    validation_error: str | None = None


@router.get("", response_model=list[PddlFileInfo])
async def list_pddl_files() -> list[PddlFileInfo]:
    settings = get_settings()
    if not settings.pddl_dir.exists():
        return []
    out: list[PddlFileInfo] = []
    for path in sorted(settings.pddl_dir.glob("*.pddl")):
        text = path.read_text(encoding="utf-8")
        slug = path.stem
        kind = "domain" if slug.startswith("domain") else "problem"
        is_valid = True
        err: str | None = None
        try:
            if kind == "domain":
                validate_domain(text)
            else:
                validate_problem(text)
        except PddlValidationError as exc:
            is_valid = False
            err = str(exc)
        out.append(
            PddlFileInfo(
                slug=slug,
                kind=kind,
                size_bytes=len(text.encode("utf-8")),
                sha256=sha256_lf(text),
                is_valid=is_valid,
                validation_error=err,
            )
        )
    return out


@router.get("/{slug}", response_class=PlainTextResponse)
async def get_pddl_file(slug: str) -> str:
    settings = get_settings()
    safe_slug = slug.replace("/", "").replace("\\", "").replace("..", "")
    path = settings.pddl_dir / f"{safe_slug}.pddl"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"PDDL no encontrado: {safe_slug}")
    return path.read_text(encoding="utf-8")
