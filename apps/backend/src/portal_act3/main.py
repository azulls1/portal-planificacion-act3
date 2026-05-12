"""Entry point del backend FastAPI."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from portal_act3.api import captures, entregable, pddl_files, plan_runs, plans, scenarios
from portal_act3.config import get_settings

if TYPE_CHECKING:
    from collections.abc import AsyncIterator


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Hook de startup/shutdown."""
    settings = get_settings()
    settings.plans_dir.mkdir(parents=True, exist_ok=True)
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Portal Actividad 3 — API",
        version="0.1.0",
        description=(
            "Backend del portal de entrega de la Actividad 3 del curso "
            "Razonamiento y planificación automática. Encola ejecuciones de "
            "planners PDDL sobre Singularity vía Celery + Redis."
        ),
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(plan_runs.router, prefix="/api/plan-runs", tags=["plan-runs"])
    app.include_router(pddl_files.router, prefix="/api/pddl-files", tags=["pddl-files"])
    app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
    app.include_router(scenarios.router, prefix="/api/scenarios", tags=["scenarios"])
    app.include_router(captures.router, prefix="/api/captures", tags=["captures"])
    app.include_router(entregable.router, prefix="/api/entregable", tags=["entregable"])

    @app.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.app_name}

    return app


app = create_app()


def run() -> None:
    """Entry point para `portal-act3` script."""
    uvicorn.run(
        "portal_act3.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    run()
