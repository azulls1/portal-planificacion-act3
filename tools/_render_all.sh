#!/usr/bin/env bash
# Genera PNGs de los planes ya producidos por run_all_planners.sh
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLANS="${REPO}/entregables/planes"
FIG="${REPO}/entregables/reporte/figuras"
RENDER="${REPO}/tools/render_terminal_png.py"

mkdir -p "${FIG}"

python3 "${RENDER}" \
  --input  "${PLANS}/rover-problem-1-plan.txt" \
  --output "${FIG}/figura-04-rover-plan-1.png" \
  --title  "rover-problem-1-plan.txt — 14 acciones (Delfi 1, óptimo)" \
  --prompt "\$ cat entregables/planes/rover-problem-1-plan.txt"

python3 "${RENDER}" \
  --input  "${PLANS}/rover-problem-2-plan.txt" \
  --output "${FIG}/figura-06-escenario-1-plan.png" \
  --title  "rover-problem-2-plan.txt — 19 acciones (Delfi 1, óptimo)" \
  --prompt "\$ cat entregables/planes/rover-problem-2-plan.txt"

python3 "${RENDER}" \
  --input  "${PLANS}/rover-problem-3-plan.txt" \
  --output "${FIG}/figura-08-escenario-2-plan.png" \
  --title  "rover-problem-3-plan.txt — 20 acciones (Delfi 1, óptimo · M3 entregado en L7)" \
  --prompt "\$ cat entregables/planes/rover-problem-3-plan.txt"

echo "DONE"
