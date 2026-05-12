#!/usr/bin/env bash
# =============================================================================
# Construye la imagen Singularity de Delfi 1
# Ganador del Optimal Track del IPC2018 Classical (Katz et al., 2018)
# =============================================================================
# Verificado contra el sitio oficial del profesor:
#   https://ipc2018-classical.bitbucket.io/
#
# Fuente del planner:
#   https://bitbucket.org/ipc2018-classical/team23/src/ipc-2018-seq-opt/
#
# Receta Singularity (raw):
#   https://bitbucket.org/ipc2018-classical/team23/raw/ipc-2018-seq-opt/Singularity
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# URL exacta del archivo `Singularity` (receta) en el repo del equipo23 (Delfi 1)
SINGULARITY_RECIPE_URL="https://bitbucket.org/ipc2018-classical/team23/raw/ipc-2018-seq-opt/Singularity"
RECIPE_FILE="${SCRIPT_DIR}/Singularity"
IMAGE_FILE="${SCRIPT_DIR}/planner.img"   # nota: el profesor usa .img, no .sif

echo "[1/3] Descargando receta Singularity de Delfi 1..."
if [[ ! -f "${RECIPE_FILE}" ]]; then
    wget --quiet -O "${RECIPE_FILE}" "${SINGULARITY_RECIPE_URL}"
fi
echo "      ✓ ${RECIPE_FILE} ($(wc -c < "${RECIPE_FILE}") bytes)"

echo "[2/3] Construyendo imagen (sudo singularity build)..."
echo "      Este paso requiere sudo y puede tardar 10-30 minutos"
echo "      porque Delfi 1 compila Fast Downward + heurísticas + symba desde fuente."

if [[ -f "${IMAGE_FILE}" ]]; then
    echo "      ✓ Imagen ya existe en ${IMAGE_FILE} — skipping build"
else
    sudo singularity build "${IMAGE_FILE}" "${RECIPE_FILE}"
fi
echo "      ✓ ${IMAGE_FILE}"

echo "[3/3] Listo. Para ejecutar:"
cat <<EOF

  # Crear un rundir con domain + problem
  mkdir -p rundir
  cp /ruta/a/domain.pddl rundir/
  cp /ruta/a/problem.pddl rundir/

  # Ejecutar el planner (sigue el script de DETAILS ON SINGULARITY del IPC2018)
  RUNDIR="\$(pwd)/rundir"
  DOMAIN="\$RUNDIR/domain.pddl"
  PROBLEM="\$RUNDIR/problem.pddl"
  PLANFILE="\$RUNDIR/sas_plan"
  ulimit -t 1800       # límite 30 min de CPU
  ulimit -v 8388608    # límite 8 GB de memoria virtual
  singularity run -C -H "\$RUNDIR" "${IMAGE_FILE}" "\$DOMAIN" "\$PROBLEM" "\$PLANFILE"

  # Si exit code = 0 y existe \$PLANFILE: plan obtenido ✓
EOF

echo ""
echo "Actualiza .env del proyecto:"
echo "  SINGULARITY_IMAGE_PATH=${IMAGE_FILE}"
echo "  SINGULARITY_PLANNER_NAME=delfi-1"
