"""Tests del simulador del dominio rover."""

from __future__ import annotations

import pytest

from portal_act3.domain.plan_simulator import (
    apply_action,
    parse_problem_goals,
    parse_problem_init,
    simulate,
)

PROBLEM = """
(define (problem t)
  (:domain rover-mineral-transport)
  (:objects A B C - location M1 - mineral R1 - rover)
  (:init
    (at R1 A) (free R1)
    (mineral-at M1 B)
    (lab-at C)
    (path A B) (path B A)
    (path B C) (path C B)
  )
  (:goal (and (analyzed M1)))
)
"""

VALID_PLAN = """
(move R1 A B)
(pickup R1 M1 B)
(move R1 B C)
(deliver R1 M1 C)
"""

INVALID_PLAN_BAD_PATH = """
(move R1 A C)
"""

INVALID_PLAN_NO_FREE = """
(move R1 A B)
(pickup R1 M1 B)
(pickup R1 M1 B)
"""


def test_parse_init() -> None:
    state = parse_problem_init(PROBLEM)
    assert state.rover_at["R1"] == "A"
    assert "R1" in state.free
    assert state.mineral_at["M1"] == "B"
    assert ("A", "B") in state.paths
    assert ("B", "C") in state.paths
    assert "C" in state.labs


def test_parse_goal() -> None:
    goals = parse_problem_goals(PROBLEM)
    assert ("analyzed", ["M1"]) in goals


def test_valid_plan_satisfies_goal() -> None:
    result = simulate(PROBLEM, VALID_PLAN)
    assert result.success
    assert result.goal_satisfied
    assert result.cost == 4
    assert "M1" in result.final_state.analyzed


def test_invalid_path_fails_at_first_action() -> None:
    result = simulate(PROBLEM, INVALID_PLAN_BAD_PATH)
    assert result.success is False
    first_error = result.first_error
    assert first_error is not None
    assert first_error.step == 1
    assert "path" in (first_error.error or "")


def test_pickup_twice_fails() -> None:
    result = simulate(PROBLEM, INVALID_PLAN_NO_FREE)
    assert result.success is False
    first_error = result.first_error
    assert first_error is not None
    assert first_error.step == 3


def test_apply_unknown_action() -> None:
    state = parse_problem_init(PROBLEM)
    ok, err = apply_action(state, "fly", ["R1", "A", "B"])
    assert ok is False
    assert err is not None
    assert "desconocida" in err


def test_apply_deliver_wrong_loc() -> None:
    state = parse_problem_init(PROBLEM)
    # Rover está en A, no en lab. deliver debería fallar.
    state.carrying["M1"] = "R1"
    state.free.discard("R1")
    ok, err = apply_action(state, "deliver", ["R1", "M1", "A"])
    assert ok is False
    assert err is not None
    assert "lab-at" in err


@pytest.mark.parametrize(
    "plan,expected_cost",
    [
        (VALID_PLAN, 4),
    ],
)
def test_cost_equals_actions(plan: str, expected_cost: int) -> None:
    result = simulate(PROBLEM, plan)
    assert result.cost == expected_cost
