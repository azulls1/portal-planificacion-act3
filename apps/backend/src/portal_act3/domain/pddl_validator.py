"""Parser y validador básico de archivos PDDL y de planes generados.

Implementación deliberadamente liviana: NO es un parser PDDL completo. Solo:
  - Valida balance de paréntesis y palabras clave mínimas en domain/problem.
  - Parsea un plan generado por planner (formato "(action arg1 arg2 ...)" por línea).
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass

from portal_act3.domain.models import ParsedPlan, PlanAction

PDDL_KEYWORD_RE = re.compile(r"\(:\w+", re.IGNORECASE)
ACTION_LINE_RE = re.compile(r"^\s*(?:\d+:\s*)?\(\s*([\w\-]+)((?:\s+[\w\-]+)*)\s*\)\s*$")
COST_LINE_RE = re.compile(r";\s*cost\s*=\s*([\d.]+)", re.IGNORECASE)


@dataclass(frozen=True)
class PddlValidationError(Exception):
    message: str
    line: int | None = None

    def __str__(self) -> str:
        prefix = f"line {self.line}: " if self.line else ""
        return f"{prefix}{self.message}"


def check_balanced_parens(text: str) -> None:
    """Verifica balance de paréntesis. Sube `PddlValidationError` si falla."""
    depth = 0
    for line_no, raw in enumerate(text.splitlines(), start=1):
        line = re.sub(r";.*$", "", raw)
        for ch in line:
            if ch == "(":
                depth += 1
            elif ch == ")":
                depth -= 1
                if depth < 0:
                    raise PddlValidationError(
                        "paréntesis de cierre sin apertura", line=line_no
                    )
    if depth != 0:
        raise PddlValidationError(f"paréntesis desbalanceados: {depth} sin cerrar")


def validate_domain(text: str) -> None:
    """Chequeos mínimos sobre un archivo domain.pddl."""
    check_balanced_parens(text)
    if not re.search(r"\(define\s+\(domain\s+[\w\-]+\)", text, re.IGNORECASE):
        raise PddlValidationError("falta `(define (domain ...))`")
    if not re.search(r"\(:predicates", text, re.IGNORECASE):
        raise PddlValidationError("falta `:predicates`")
    if not re.search(r"\(:action", text, re.IGNORECASE):
        raise PddlValidationError("debe declarar al menos una `:action`")


def validate_problem(text: str) -> None:
    """Chequeos mínimos sobre un archivo problem.pddl."""
    check_balanced_parens(text)
    if not re.search(r"\(define\s+\(problem\s+[\w\-]+\)", text, re.IGNORECASE):
        raise PddlValidationError("falta `(define (problem ...))`")
    if not re.search(r"\(:domain\s+[\w\-]+\)", text, re.IGNORECASE):
        raise PddlValidationError("falta `:domain`")
    if not re.search(r"\(:init", text, re.IGNORECASE):
        raise PddlValidationError("falta `:init`")
    if not re.search(r"\(:goal", text, re.IGNORECASE):
        raise PddlValidationError("falta `:goal`")


def parse_plan(text: str) -> ParsedPlan:
    """Parsea un plan textual a estructura.

    Formato aceptado (ejemplos):
        (move R1 L4 L3)
        1: (move R1 L4 L3)
        ; cost = 14
    """
    actions: list[PlanAction] = []
    total_cost: float = 0.0
    step = 0
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        cost_match = COST_LINE_RE.search(line)
        if cost_match:
            total_cost = float(cost_match.group(1))
            continue
        if line.startswith(";"):
            continue
        m = ACTION_LINE_RE.match(line)
        if not m:
            continue
        step += 1
        action_name = m.group(1)
        params_raw = m.group(2).strip()
        params = params_raw.split() if params_raw else []
        actions.append(PlanAction(step=step, action_name=action_name, parameters=params))

    if total_cost == 0.0 and actions:
        total_cost = float(len(actions))

    return ParsedPlan(actions=actions, total_cost=total_cost, raw=text)


def sha256_lf(text: str) -> str:
    """Hash SHA-256 con normalización LF (consistente con `trace-map` del framework)."""
    normalized = text.replace("\r\n", "\n").replace("\r", "\n").encode("utf-8")
    return hashlib.sha256(normalized).hexdigest()
