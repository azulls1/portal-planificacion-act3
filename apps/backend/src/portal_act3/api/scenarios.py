"""Endpoints `/api/scenarios` — escenarios alternativos diseñados por el autor único.

Esta actividad es individual. El autor diseña 2 escenarios alternativos al
problema base del rover (problem-2.pddl y problem-3.pddl), cada uno con
design rationale académico distinto.
"""

from __future__ import annotations

from fastapi import APIRouter

from portal_act3.domain.models import Scenario, TeamMember

router = APIRouter()


# Trabajo individual — un solo autor
_AUTHOR: TeamMember = TeamMember(
    slug="autor",
    name="Adonai Samael Hernández Mata",
    role="Estudiante de la maestría — autor único de la actividad",
    portal_route="/autor",
    scenario_problem_slug=None,  # el autor es responsable de ambos escenarios
)


_SCENARIOS: list[Scenario] = [
    Scenario(
        member_slug="problem-2",
        member_name="Adonai Samael Hernández Mata",
        title="Tres minerales con acceso condicionado por el laboratorio",
        description=(
            "Extensión del problema base con un tercer mineral (M3) en una "
            "nueva localidad (L6) y una arista unidireccional L5→L6 que "
            "obliga al rover a visitar el laboratorio antes de poder "
            "acceder a M3. Examina si el planner razona sobre "
            "precondiciones topológicas no triviales. Plan óptimo: 19 "
            "acciones."
        ),
        problem_slug="problem-2",
        differs_from_base=[
            "+1 mineral (M3 en L6)",
            "+1 localidad (L6)",
            "+1 arista bidireccional (L4↔L6)",
            "+1 arista UNIDIRECCIONAL (L5→L6) — restricción del escenario",
        ],
    ),
    Scenario(
        member_slug="problem-3",
        member_name="Adonai Samael Hernández Mata",
        title="Dos laboratorios con asignación oportunista",
        description=(
            "Extensión del problema base con un segundo laboratorio (L7) "
            "que también puede aceptar cualquier mineral, dos minerales "
            "adicionales (M3 en L6 y M4 en L7), y aristas bidireccionales "
            "L5↔L6↔L7. M4 está en el mismo nodo del segundo lab, "
            "permitiendo resolverse en 2 acciones. Examina si el planner "
            "elige asignación oportunista (entregar M3 en L7 para "
            "encadenar con M4) en lugar de la ruta obvia. Plan óptimo: "
            "20 acciones."
        ),
        problem_slug="problem-3",
        differs_from_base=[
            "+2 localidades (L6, L7)",
            "+2 minerales (M3 en L6, M4 en L7)",
            "+1 laboratorio adicional (L7 también es lab)",
            "+4 aristas bidireccionales (L5↔L6, L6↔L7)",
        ],
    ),
]


@router.get("/team", response_model=list[TeamMember])
async def list_team_members() -> list[TeamMember]:
    """Trabajo individual: devuelve el autor único como elemento de la lista."""
    return [_AUTHOR]


@router.get("/author", response_model=TeamMember)
async def get_author() -> TeamMember:
    return _AUTHOR


@router.get("", response_model=list[Scenario])
async def list_scenarios() -> list[Scenario]:
    return _SCENARIOS


@router.get("/{slug}", response_model=Scenario | None)
async def get_scenario_by_slug(slug: str) -> Scenario | None:
    for scenario in _SCENARIOS:
        if scenario.member_slug == slug or scenario.problem_slug == slug:
            return scenario
    return None
