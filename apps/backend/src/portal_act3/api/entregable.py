"""Endpoint `/api/entregable` — sirve el ZIP final del entregable."""

from __future__ import annotations

import hashlib
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from portal_act3.config import get_settings


class EntregableInfo(BaseModel):
    exists: bool
    filename: str
    size_bytes: int | None = None
    sha256: str | None = None
    download_url: str | None = None


router = APIRouter()


def _zip_path() -> Path:
    settings = get_settings()
    # entregables/entregable-actividad-3.zip
    return settings.plans_dir.parent / "entregable-actividad-3.zip"


@router.get("/info", response_model=EntregableInfo)
async def get_entregable_info() -> EntregableInfo:
    p = _zip_path()
    if not p.is_file():
        return EntregableInfo(exists=False, filename="entregable-actividad-3.zip")
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return EntregableInfo(
        exists=True,
        filename=p.name,
        size_bytes=p.stat().st_size,
        sha256=h.hexdigest(),
        download_url="/api/entregable/download",
    )


@router.get("/download")
async def download_entregable() -> FileResponse:
    p = _zip_path()
    if not p.is_file():
        raise HTTPException(
            status_code=404,
            detail=(
                "ZIP no encontrado. Generarlo con "
                "`python tools/build_entregable_zip.py`."
            ),
        )
    return FileResponse(
        path=p,
        filename="entregable-actividad-3-adonai-hernandez.zip",
        media_type="application/zip",
    )
