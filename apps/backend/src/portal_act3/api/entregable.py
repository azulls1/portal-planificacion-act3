"""Endpoint `/api/entregable` — sirve el ZIP final + descargas individuales.

Estrategia de servir archivos:
  1. Si el archivo existe en el filesystem del container → FileResponse directo
     (path rápido, sin red).
  2. Si NO existe pero hay Supabase Storage configurado → 302 redirect a la
     URL pública del bucket (no requiere rebuild de la imagen para actualizar).
  3. Si tampoco → 404.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel

from portal_act3.config import get_settings


class EntregableInfo(BaseModel):
    exists: bool
    filename: str
    size_bytes: int | None = None
    sha256: str | None = None
    download_url: str | None = None
    reporte_pdf_exists: bool = False
    reporte_pdf_size_bytes: int | None = None
    reporte_pdf_url: str | None = None
    # Backup: URL pública directa al bucket de Storage (si el filesystem no
    # tiene los archivos, el portal puede ofrecer descarga vía Supabase).
    storage_zip_url: str | None = None
    storage_pdf_url: str | None = None


router = APIRouter()


def _zip_path() -> Path:
    settings = get_settings()
    return settings.plans_dir.parent / "entregable-actividad-3.zip"


def _reporte_pdf_path() -> Path:
    settings = get_settings()
    return settings.plans_dir.parent / "reporte" / "reporte.pdf"


def _storage_public_url(object_path: str) -> str | None:
    settings = get_settings()
    base = (settings.supabase_public_url or "").rstrip("/")
    if not base or not settings.entregables_bucket:
        return None
    return f"{base}/storage/v1/object/public/{settings.entregables_bucket}/{object_path}"


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


@router.get("/info", response_model=EntregableInfo)
async def get_entregable_info() -> EntregableInfo:
    zip_p = _zip_path()
    pdf_p = _reporte_pdf_path()

    storage_zip = _storage_public_url("entregable-actividad-3.zip")
    storage_pdf = _storage_public_url("reporte-actividad-3.pdf")

    info = EntregableInfo(
        exists=zip_p.is_file(),
        filename=zip_p.name,
        reporte_pdf_exists=pdf_p.is_file(),
        storage_zip_url=storage_zip,
        storage_pdf_url=storage_pdf,
    )
    if zip_p.is_file():
        info.size_bytes = zip_p.stat().st_size
        info.sha256 = _sha256(zip_p)
        info.download_url = "/api/entregable/download"
    elif storage_zip:
        info.download_url = "/api/entregable/download"  # mismo path, hará redirect

    if pdf_p.is_file():
        info.reporte_pdf_size_bytes = pdf_p.stat().st_size
        info.reporte_pdf_url = "/api/entregable/reporte.pdf"
    elif storage_pdf:
        info.reporte_pdf_url = "/api/entregable/reporte.pdf"
    return info


@router.get("/download")
async def download_entregable() -> FileResponse | RedirectResponse:
    p = _zip_path()
    if p.is_file():
        return FileResponse(
            path=p,
            filename="entregable-actividad-3-adonai-hernandez.zip",
            media_type="application/zip",
        )
    storage_url = _storage_public_url("entregable-actividad-3.zip")
    if storage_url:
        return RedirectResponse(storage_url, status_code=302)
    raise HTTPException(
        status_code=404,
        detail=(
            "ZIP no encontrado ni en filesystem ni en Supabase Storage. "
            "Generarlo con `python tools/build_entregable_zip.py` y/o subirlo al bucket."
        ),
    )


@router.get("/reporte.pdf")
async def download_reporte_pdf() -> FileResponse | RedirectResponse:
    """Descarga directa del PDF del reporte."""
    p = _reporte_pdf_path()
    if p.is_file():
        return FileResponse(
            path=p,
            filename="reporte-actividad-3-adonai-hernandez.pdf",
            media_type="application/pdf",
        )
    storage_url = _storage_public_url("reporte-actividad-3.pdf")
    if storage_url:
        return RedirectResponse(storage_url, status_code=302)
    raise HTTPException(
        status_code=404,
        detail="PDF no encontrado ni en filesystem ni en Supabase Storage.",
    )
