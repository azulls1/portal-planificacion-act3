"""Simulador del dominio `rover-mineral-transport` para validar planes.

Ejecuta cada acción de un plan contra el estado inicial del problema y verifica
que las precondiciones se cumplen y que el estado final satisface el goal.

Útil para tests de regresión y como gate antes de entregar un plan.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from portal_act3.domain.pddl_validator import parse_plan


@dataclass
class RoverState:
    """Estado del mundo en un instante."""

    rover_at: dict[str, str] = field(default_factory=dict)        # rover -> location
    free: set[str] = field(default_factory=set)                    # rovers libres
    mineral_at: dict[str, str] = field(default_factory=dict)       # mineral -> location
    carrying: dict[str, str] = field(default_factory=dict)         # mineral -> rover (mineral está en rover)
    analyzed: set[str] = field(default_factory=set)
    paths: set[tuple[str, str]] = field(default_factory=set)       # (from, to)
    labs: set[str] = field(default_factory=set)


@dataclass
class StepResult:
    step: int
    action: str
    parameters: list[str]
    ok: bool
    error: str | None = None


@dataclass
class SimulationResult:
    success: bool
    steps: list[StepResult]
    final_state: RoverState
    goal_satisfied: bool
    cost: int

    @property
    def first_error(self) -> StepResult | None:
        return next((s for s in self.steps if not s.ok), None)


# -------------------------------------------------------------
# Parsing mínimo del problem.pddl para extraer estado inicial
# -------------------------------------------------------------

_INIT_RE = re.compile(r"\(:init\s+(.*?)\)\s*\(:goal", re.DOTALL | re.IGNORECASE)
_GOAL_RE = re.compile(r"\(:goal\s+(.*?)\)\s*(?:\(:metric|\)$|\s*\)\s*$)", re.DOTALL | re.IGNORECASE)
_ATOM_RE = re.compile(r"\(([\w\-]+)((?:\s+[\w\-]+)*)\)")


def parse_problem_init(problem_text: str) -> RoverState:
    """Extrae el estado inicial del archivo problem.pddl."""
    state = RoverState()
    init_match = _INIT_RE.search(problem_text)
    if not init_match:
        return state
    init_body = init_match.group(1)

    for atom in _ATOM_RE.finditer(init_body):
        predicate = atom.group(1).lower()
        args_raw = atom.group(2).strip()
        args = args_raw.split() if args_raw else []

        if predicate == "at" and len(args) == 2:
            state.rover_at[args[0]] = args[1]
        elif predicate == "free" and len(args) == 1:
            state.free.add(args[0])
        elif predicate == "mineral-at" and len(args) == 2:
            state.mineral_at[args[0]] = args[1]
        elif predicate == "path" and len(args) == 2:
            state.paths.add((args[0], args[1]))
        elif predicate == "lab-at" and len(args) == 1:
            state.labs.add(args[0])
    return state


def parse_problem_goals(problem_text: str) -> list[tuple[str, list[str]]]:
    """Extrae los goals como lista de (predicado, args)."""
    goal_match = _GOAL_RE.search(problem_text)
    if not goal_match:
        return []
    goal_body = goal_match.group(1)
    return [(m.group(1).lower(), m.group(2).strip().split()) for m in _ATOM_RE.finditer(goal_body)]


# -------------------------------------------------------------
# Simulación
# -------------------------------------------------------------

def apply_action(state: RoverState, name: str, params: list[str]) -> tuple[bool, str | None]:
    """Aplica una acción al estado in-place. Devuelve (ok, error_message)."""
    name = name.lower()

    if name == "move":
        if len(params) != 3:
            return False, f"move requiere 3 args, recibió {len(params)}"
        rover, frm, to = params
        if state.rover_at.get(rover) != frm:
            return False, f"precondición (at {rover} {frm}) no se cumple"
        if (frm, to) not in state.paths:
            return False, f"precondición (path {frm} {to}) no se cumple"
        state.rover_at[rover] = to
        return True, None

    if name == "pickup":
        if len(params) != 3:
            return False, f"pickup requiere 3 args, recibió {len(params)}"
        rover, mineral, loc = params
        if state.rover_at.get(rover) != loc:
            return False, f"precondición (at {rover} {loc}) no se cumple"
        if state.mineral_at.get(mineral) != loc:
            return False, f"precondición (mineral-at {mineral} {loc}) no se cumple"
        if rover not in state.free:
            return False, f"precondición (free {rover}) no se cumple (ya carga algo)"
        state.carrying[mineral] = rover
        del state.mineral_at[mineral]
        state.free.discard(rover)
        return True, None

    if name == "deliver":
        if len(params) != 3:
            return False, f"deliver requiere 3 args, recibió {len(params)}"
        rover, mineral, loc = params
        if state.rover_at.get(rover) != loc:
            return False, f"precondición (at {rover} {loc}) no se cumple"
        if loc not in state.labs:
            return False, f"precondición (lab-at {loc}) no se cumple"
        if state.carrying.get(mineral) != rover:
            return False, f"precondición (carrying {rover} {mineral}) no se cumple"
        state.analyzed.add(mineral)
        del state.carrying[mineral]
        state.free.add(rover)
        return True, None

    return False, f"acción desconocida: {name}"


def goal_satisfied(state: RoverState, goals: list[tuple[str, list[str]]]) -> bool:
    for predicate, args in goals:
        if predicate == "analyzed" and len(args) == 1 and args[0] not in state.analyzed:
            return False
        if predicate == "at" and len(args) == 2 and state.rover_at.get(args[0]) != args[1]:
            return False
    return True


def simulate(problem_text: str, plan_text: str) -> SimulationResult:
    """Simula el plan sobre el estado inicial del problema."""
    state = parse_problem_init(problem_text)
    goals = parse_problem_goals(problem_text)
    parsed = parse_plan(plan_text)

    step_results: list[StepResult] = []
    cost = 0
    for action in parsed.actions:
        ok, err = apply_action(state, action.action_name, action.parameters)
        step_results.append(
            StepResult(
                step=action.step,
                action=action.action_name,
                parameters=action.parameters,
                ok=ok,
                error=err,
            )
        )
        if ok:
            cost += 1
        else:
            break

    return SimulationResult(
        success=all(s.ok for s in step_results) and goal_satisfied(state, goals),
        steps=step_results,
        final_state=state,
        goal_satisfied=goal_satisfied(state, goals),
        cost=cost,
    )
