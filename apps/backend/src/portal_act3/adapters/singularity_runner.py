"""Adapter que invoca el binario `singularity` con la imagen .sif del planner.

Maneja:
  - Construcción del comando con bind-mounts de los .pddl
  - Captura de stdout/stderr
  - Detección de timeout
"""

from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path

from portal_act3.config import get_settings


@dataclass
class PlannerExecutionResult:
    success: bool
    plan_text: str
    stdout: str
    stderr: str
    return_code: int
    timed_out: bool = False
    error_message: str | None = None


class SingularityNotConfiguredError(RuntimeError):
    """Se intentó ejecutar Singularity pero `singularity_image_path` no está seteado."""


def run_planner(
    domain_path: Path,
    problem_path: Path,
    plan_output_path: Path,
    timeout_seconds: int | None = None,
) -> PlannerExecutionResult:
    """Ejecuta el planner sobre `domain + problem` y guarda el plan."""
    settings = get_settings()

    if settings.singularity_image_path is None:
        raise SingularityNotConfiguredError(
            "SINGULARITY_IMAGE_PATH no configurado en .env — "
            "ejecuta infra/singularity/pull-planner.sh primero."
        )

    timeout = timeout_seconds or settings.plan_timeout_seconds

    # Comando EXACTO del script "DETAILS ON SINGULARITY → How can I test my
    # containers?" del IPC2018 (https://ipc2018-classical.bitbucket.io/).
    # El profesor referencia este script literalmente.
    #
    # Forma del comando para planners IPC2018 sequential optimal track:
    #   singularity run -C -H <rundir> <image> <domain> <problem> <plan-file>
    #
    # - `run` (no `exec`) — invoca el runscript de la imagen.
    # - `-C` (contain) — aísla namespaces.
    # - `-H` (home) — fija el home al rundir para que el planner escriba ahí.
    # Los argumentos posicionales son consumidos por el runscript del .img.
    rundir = plan_output_path.parent.resolve()
    rundir.mkdir(parents=True, exist_ok=True)
    cmd = [
        "singularity",
        "run",
        "-C",
        "-H",
        str(rundir),
        str(settings.singularity_image_path),
        str(domain_path),
        str(problem_path),
        str(plan_output_path),
    ]

    try:
        completed = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        return PlannerExecutionResult(
            success=False,
            plan_text="",
            stdout=exc.stdout or "",
            stderr=exc.stderr or "",
            return_code=-1,
            timed_out=True,
            error_message=f"planner excedió timeout de {timeout}s",
        )
    except FileNotFoundError as exc:
        return PlannerExecutionResult(
            success=False,
            plan_text="",
            stdout="",
            stderr="",
            return_code=-1,
            error_message=f"binario `singularity` no encontrado: {exc}",
        )

    plan_text = ""
    if plan_output_path.exists():
        plan_text = plan_output_path.read_text(encoding="utf-8")

    return PlannerExecutionResult(
        success=completed.returncode == 0 and bool(plan_text),
        plan_text=plan_text,
        stdout=completed.stdout,
        stderr=completed.stderr,
        return_code=completed.returncode,
    )
