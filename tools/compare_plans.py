#!/usr/bin/env python3
"""Compara dos planes PDDL.

Útil para validar que el plan generado por Delfi 1 sobre uno de nuestros
problemas es equivalente al plan de referencia que tenemos persistido en
`entregables/planes/`.

Equivalencia significa:
    - Mismo número de acciones
    - Mismo costo total
    - Mismos sub-objetivos satisfechos
    - Ambos válidos contra el `domain.pddl` y el `problem.pddl`

El orden de acciones puede diferir por simetrías (M1↔M2 son intercambiables);
esto no es un error.

Uso:
    python tools/compare_plans.py problem-1 path/al/plan/de/delfi/sas_plan

    python tools/compare_plans.py problem-2 \\
        infra/singularity/rundir-rover-2/sas_plan
"""

from __future__ import annotations

import io
import os
import sys
from pathlib import Path

# Forzar UTF-8 en stdout (Windows cp1252 no soporta ✓ ✗ ⚠)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ANSI colors solo en TTY compatible
_USE_COLOR = sys.stdout.isatty() and os.environ.get("TERM", "") != "dumb"

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "apps" / "backend" / "src"))

from portal_act3.domain.pddl_validator import parse_plan, sha256_lf  # noqa: E402
from portal_act3.domain.plan_simulator import simulate  # noqa: E402


def _wrap(code: str, s: str) -> str:
    return f"\033[{code}m{s}\033[0m" if _USE_COLOR else s


def red(s: str) -> str: return _wrap("91", s)
def green(s: str) -> str: return _wrap("92", s)
def yellow(s: str) -> str: return _wrap("93", s)
def bold(s: str) -> str: return _wrap("1", s)


def main() -> int:
    if len(sys.argv) != 3:
        print(f"Uso: {sys.argv[0]} <problem-slug> <path-al-plan-de-delfi>")
        print("Ejemplo: tools/compare_plans.py problem-1 rundir/sas_plan")
        return 2

    problem_slug = sys.argv[1]
    delfi_plan_path = Path(sys.argv[2])

    pddl_dir = REPO_ROOT / "entregables" / "pddl"
    plans_dir = REPO_ROOT / "entregables" / "planes"

    problem_path = pddl_dir / f"{problem_slug}.pddl"
    reference_plan_path = plans_dir / f"rover-{problem_slug}-plan.txt"

    if not problem_path.exists():
        print(red(f"✗ problem no encontrado: {problem_path}"))
        return 1

    if not delfi_plan_path.exists():
        print(red(f"✗ plan de Delfi no encontrado: {delfi_plan_path}"))
        return 1

    if not reference_plan_path.exists():
        print(red(f"✗ plan de referencia no encontrado: {reference_plan_path}"))
        return 1

    problem_text = problem_path.read_text(encoding="utf-8")
    delfi_text = delfi_plan_path.read_text(encoding="utf-8")
    reference_text = reference_plan_path.read_text(encoding="utf-8")

    print(bold(f"=== Comparación de planes para {problem_slug}.pddl ==="))
    print()

    # 1. Simular plan de Delfi contra el problema
    print(bold("[1] Validando plan de Delfi contra el dominio..."))
    delfi_result = simulate(problem_text, delfi_text)
    delfi_parsed = parse_plan(delfi_text)
    if delfi_result.success:
        print(green(f"    ✓ Plan válido. Acciones: {len(delfi_result.steps)}. "
                    f"Costo: {delfi_result.cost}. Goal: {delfi_result.goal_satisfied}"))
    else:
        err = delfi_result.first_error
        if err:
            print(red(f"    ✗ Plan INVÁLIDO. Falló en paso {err.step}: {err.error}"))
        else:
            print(red(f"    ✗ Plan INVÁLIDO. Goal no satisfecho."))
        return 1

    print()

    # 2. Simular plan de referencia
    print(bold("[2] Validando plan de referencia contra el dominio..."))
    ref_result = simulate(problem_text, reference_text)
    if ref_result.success:
        print(green(f"    ✓ Plan de referencia válido. Acciones: {len(ref_result.steps)}. "
                    f"Costo: {ref_result.cost}"))
    else:
        print(red(f"    ✗ Plan de referencia inválido"))
        return 1

    print()

    # 3. Comparar
    print(bold("[3] Comparación..."))

    same_cost = delfi_result.cost == ref_result.cost
    same_actions = len(delfi_result.steps) == len(ref_result.steps)
    same_goal = delfi_result.goal_satisfied and ref_result.goal_satisfied

    print(f"    Costo:       Delfi={delfi_result.cost}  Ref={ref_result.cost}  " +
          (green("✓ igual") if same_cost else red(f"✗ difieren en {delfi_result.cost - ref_result.cost}")))
    print(f"    Acciones:    Delfi={len(delfi_result.steps)}  Ref={len(ref_result.steps)}  " +
          (green("✓ igual") if same_actions else yellow("⚠ difieren")))
    print(f"    Goal:        " + (green("✓ ambos satisfechos") if same_goal else red("✗ no satisfecho")))

    # 4. Diff de acciones (para mostrar diferencias por simetría)
    delfi_actions = [(a.action_name, tuple(a.parameters)) for a in delfi_parsed.actions]
    ref_parsed = parse_plan(reference_text)
    ref_actions = [(a.action_name, tuple(a.parameters)) for a in ref_parsed.actions]

    same_sequence = delfi_actions == ref_actions
    same_multiset = sorted(delfi_actions) == sorted(ref_actions)

    print()
    print(bold("[4] Estructura del plan..."))
    print(f"    Secuencia idéntica:        " +
          (green("✓ sí") if same_sequence else yellow("⚠ no (orden diferente, posibles simetrías)")))
    print(f"    Multiset de acciones:      " +
          (green("✓ sí") if same_multiset else red("✗ no — acciones distintas")))

    # 5. Hashes
    print()
    print(bold("[5] Hashes SHA-256 (normalizados LF)..."))
    print(f"    Delfi:       {sha256_lf(delfi_text)[:32]}...")
    print(f"    Referencia:  {sha256_lf(reference_text)[:32]}...")

    # 6. Veredicto
    print()
    print(bold("=== Veredicto ==="))
    if same_cost and same_goal:
        if same_sequence:
            print(green("✓ Planes idénticos. Delfi reprodujo nuestra solución exacta."))
        elif same_multiset:
            print(green("✓ Planes equivalentes (mismo multiset de acciones, distinto orden)."))
            print(yellow("  Esto es esperable por simetrías M1↔M2."))
        else:
            print(green("✓ Planes ÓPTIMAMENTE equivalentes (mismo costo, plan distinto)."))
            print(yellow("  Hay múltiples planes óptimos para este problema. Ambos son válidos."))
        return 0
    else:
        print(red("✗ Planes NO equivalentes. Revisar modelado."))
        return 1


if __name__ == "__main__":
    sys.exit(main())
