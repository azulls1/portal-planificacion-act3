#!/usr/bin/env bash
# Genera Figura 1 (comando de ejecución) y Figura 2 (plan obtenido) para Snake p01.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIG="${REPO}/entregables/reporte/figuras"
RENDER="${REPO}/tools/render_terminal_png.py"
SNAKE_PLAN="${REPO}/entregables/planes/snake-problem-1-plan.txt"
CAPT="${REPO}/entregables/capturas"

# --- FIGURA 1: comando IPC2018 ---
F1="$(mktemp)"
cat > "${F1}" <<'EOF'
$ # Script oficial DETAILS ON SINGULARITY del IPC2018
$ mkdir -p rundir
$ cp entregables/pddl/snake-ipc2018/domain.pddl rundir/
$ cp entregables/pddl/snake-ipc2018/p01.pddl    rundir/problem.pddl
$ RUNDIR="$(pwd)/rundir"
$ DOMAIN="$RUNDIR/domain.pddl"
$ PROBLEM="$RUNDIR/problem.pddl"
$ PLANFILE="$RUNDIR/sas_plan"
$
$ # Limites oficiales del IPC2018: 30 min CPU, 8 GB de memoria virtual
$ ulimit -t 1800
$ ulimit -v 8388608
$
$ singularity run -C -H "$RUNDIR" infra/singularity/planner.img \
    "$DOMAIN" "$PROBLEM" "$PLANFILE"
EOF

python3 "${RENDER}" \
  --input  "${F1}" \
  --output "${FIG}/figura-01-singularity-snake.png" \
  --title  "Snake p01 — ejecución de Delfi 1 vía Apptainer/Singularity" \
  --prompt "# Comando de ejecución (IPC2018 DETAILS ON SINGULARITY)"
cp "${FIG}/figura-01-singularity-snake.png" "${CAPT}/c1-snake-execution-terminal.png"
rm -f "${F1}"

# --- FIGURA 2: plan obtenido para Snake p01 ---
if [[ -f "${SNAKE_PLAN}" ]]; then
  ACTIONS=$(grep -cE '^\(' "${SNAKE_PLAN}")
  python3 "${RENDER}" \
    --input  "${SNAKE_PLAN}" \
    --output "${FIG}/figura-02-snake-plan.png" \
    --title  "snake-problem-1-plan.txt — ${ACTIONS} acciones (Delfi 1, optimal)" \
    --prompt "\$ cat entregables/planes/snake-problem-1-plan.txt"
  cp "${FIG}/figura-02-snake-plan.png" "${CAPT}/c1-snake-plan-file.png"
  # Limpiar la figura anterior que era log tail (ya no se usa)
  rm -f "${FIG}/figura-02-snake-log-tail.png" "${CAPT}/c1-snake-log-tail.png"
  echo "  ✓ Figura 2 generada con el plan obtenido (${ACTIONS} acciones)"
else
  echo "  ✗ No hay plan de Snake en ${SNAKE_PLAN}"
  exit 1
fi
echo "DONE"
