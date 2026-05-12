"""Tests de integración sobre los PDDL reales del repo.

Verifica que los 4 archivos de `entregables/pddl/` validan contra nuestro parser
y que los planes de referencia satisfacen sus goals respectivos.
"""

from __future__ import annotations

import pytest

from portal_act3.domain.pddl_validator import (
    parse_plan,
    sha256_lf,
    validate_domain,
    validate_problem,
)
from portal_act3.domain.plan_simulator import simulate


def test_domain_validates(domain_text: str) -> None:
    validate_domain(domain_text)


@pytest.mark.parametrize(
    "fixture_name",
    ["problem_1_text", "problem_2_text", "problem_3_text"],
)
def test_problems_validate(fixture_name: str, request: pytest.FixtureRequest) -> None:
    text = request.getfixturevalue(fixture_name)
    validate_problem(text)


def test_plan_1_satisfies_goal(problem_1_text: str, plan_1_text: str) -> None:
    result = simulate(problem_1_text, plan_1_text)
    assert result.success, f"plan-1 falló: {result.first_error}"
    assert result.cost == 14
    assert result.goal_satisfied is True


def test_plan_2_satisfies_goal(problem_2_text: str, plan_2_text: str) -> None:
    result = simulate(problem_2_text, plan_2_text)
    assert result.success, f"plan-2 falló: {result.first_error}"
    assert result.cost == 19
    assert result.goal_satisfied is True


def test_plan_3_satisfies_goal(problem_3_text: str, plan_3_text: str) -> None:
    result = simulate(problem_3_text, plan_3_text)
    assert result.success, f"plan-3 falló: {result.first_error}"
    assert result.cost == 20
    assert result.goal_satisfied is True


def test_plan_1_action_count(plan_1_text: str) -> None:
    parsed = parse_plan(plan_1_text)
    assert len(parsed.actions) == 14
    assert parsed.total_cost == 14.0


def test_plan_2_action_count(plan_2_text: str) -> None:
    parsed = parse_plan(plan_2_text)
    assert len(parsed.actions) == 19
    assert parsed.total_cost == 19.0


def test_plan_3_action_count(plan_3_text: str) -> None:
    parsed = parse_plan(plan_3_text)
    assert len(parsed.actions) == 20
    assert parsed.total_cost == 20.0


@pytest.mark.parametrize(
    "fixture_name",
    ["domain_text", "problem_1_text", "problem_2_text", "problem_3_text"],
)
def test_pddl_sha_is_stable(fixture_name: str, request: pytest.FixtureRequest) -> None:
    text = request.getfixturevalue(fixture_name)
    a = sha256_lf(text)
    b = sha256_lf(text.replace("\n", "\r\n"))
    assert a == b


def test_plan_1_uses_only_valid_actions(plan_1_text: str) -> None:
    parsed = parse_plan(plan_1_text)
    valid = {"move", "pickup", "deliver"}
    for action in parsed.actions:
        assert action.action_name in valid


def test_plan_2_visits_l6_after_l5(problem_2_text: str, plan_2_text: str) -> None:
    """El escenario 2 obliga a pasar por L5 antes de poder ir a L6 (unidir L5->L6)."""
    result = simulate(problem_2_text, plan_2_text)
    assert result.success
    visited_l5_before_l6 = False
    seen_l5 = False
    for step in result.steps:
        if step.action == "move" and step.parameters[2] == "L5":
            seen_l5 = True
        if step.action == "move" and step.parameters[2] == "L6":
            visited_l5_before_l6 = seen_l5
            break
    assert visited_l5_before_l6, "no pasó por L5 antes de L6"


def test_plan_3_uses_both_labs(problem_3_text: str, plan_3_text: str) -> None:
    """El escenario 3 tiene 2 labs y se espera que se aprovechen ambos."""
    result = simulate(problem_3_text, plan_3_text)
    assert result.success
    delivery_locations = {
        step.parameters[2] for step in result.steps if step.action == "deliver"
    }
    assert "L5" in delivery_locations
    assert "L7" in delivery_locations
