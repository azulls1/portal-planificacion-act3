"""Endpoints `/api/captures` — listado de capturas de pantalla del repo."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from portal_act3.config import get_settings

router = APIRouter()


class CaptureInfo(BaseModel):
    slug: str
    filename: str
    criterio: str
    size_bytes: int


def _criterio_from_slug(slug: str) -> str:
    if slug.startswith("c1-"):
        return "C1"
    if slug.startswith("c2-"):
        return "C2"
    if slug.startswith("c3-"):
        return "C3"
    if slug.startswith("c4-"):
        return "C4"
    return "otro"


@router.get("", response_model=list[CaptureInfo])
async def list_captures() -> list[CaptureInfo]:
    settings = get_settings()
    captures_dir = settings.pddl_dir.parent / "capturas"
    if not captures_dir.exists():
        return []
    out: list[CaptureInfo] = []
    for path in sorted(captures_dir.iterdir()):
        if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}:
            out.append(
                CaptureInfo(
                    slug=path.stem,
                    filename=path.name,
                    criterio=_criterio_from_slug(path.stem),
                    size_bytes=path.stat().st_size,
                )
            )
    return out


@router.get("/{filename}")
async def get_capture(filename: str) -> FileResponse:
    settings = get_settings()
    captures_dir = settings.pddl_dir.parent / "capturas"
    safe = filename.replace("/", "").replace("\\", "").replace("..", "")
    path = captures_dir / safe
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail=f"captura no encontrada: {safe}")
    return FileResponse(path)
