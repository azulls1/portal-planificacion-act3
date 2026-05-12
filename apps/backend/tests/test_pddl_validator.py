"""Tests del parser/validador PDDL."""

from __future__ import annotations

import pytest

from portal_act3.domain.pddl_validator import (
    PddlValidationError,
    parse_plan,
    sha256_lf,
    validate_domain,
    validate_problem,
)

VALID_DOMAIN = """
(define (domain test-d)
  (:requirements :typing)
  (:types loc)
  (:predicates (at ?l - loc))
  (:action move
    :parameters (?from - loc ?to - loc)
    :precondition (at ?from)
    :effect (and (not (at ?from)) (at ?to))))
"""

VALID_PROBLEM = """
(define (problem p1)
  (:domain test-d)
  (:objects A B - loc)
  (:init (at A))
  (:goal (at B)))
"""

VALID_PLAN = """
1: (move R1 L4 L3)
2: (move R1 L3 L1)
3: (pickup R1 M1 L1)
; cost = 3
"""


def test_validate_domain_ok() -> None:
    validate_domain(VALID_DOMAIN)


def test_validate_problem_ok() -> None:
    validate_problem(VALID_PROBLEM)


def test_validate_domain_missing_predicates() -> None:
    bad = VALID_DOMAIN.replace("(:predicates (at ?l - loc))", "")
    with pytest.raises(PddlValidationError, match="predicates"):
        validate_domain(bad)


def test_validate_problem_missing_goal() -> None:
    bad = VALID_PROBLEM.replace("(:goal (at B))", "")
    with pytest.raises(PddlValidationError, match="goal"):
        validate_problem(bad)


def test_parse_plan_basic() -> None:
    parsed = parse_plan(VALID_PLAN)
    assert len(parsed.actions) == 3
    assert parsed.actions[0].action_name == "move"
    assert parsed.actions[0].parameters == ["R1", "L4", "L3"]
    assert parsed.total_cost == 3.0


def test_sha256_lf_normalizes_crlf() -> None:
    a = sha256_lf("line1\nline2\n")
    b = sha256_lf("line1\r\nline2\r\n")
    assert a == b


def test_unbalanced_parens_raises() -> None:
    with pytest.raises(PddlValidationError, match="paréntesis"):
        validate_domain("(define (domain x) (:predicates (foo))")
