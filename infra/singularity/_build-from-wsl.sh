#!/usr/bin/env bash
# Auxiliar: construye delfi-1 desde WSL2 evitando I/O sobre /mnt/c.
# Output: /root/delfi-build/planner.img -> copia a infra/singularity/planner.img
set -euo pipefail

PROJ_DIR="/mnt/c/Users/shernandez/Desktop/mestria/Primer Semestre/Razonamiento y planificacion automatica/Actividad 2/portal-planificacion-act3"
TARGET_IMG="${PROJ_DIR}/infra/singularity/planner.img"
BUILD_DIR="/root/delfi-build"
# Bitbucket dejó de servir /raw/ para repos mercurial antiguos (2026: 404).
# Se descarga el tarball del branch y se extrae el archivo `Singularity`.
TARBALL_URL="https://bitbucket.org/ipc2018-classical/team23/get/ipc-2018-seq-opt.tar.gz"

echo "[0/4] sanity checks"
apptainer --version
test -d "$PROJ_DIR" || { echo "ERROR: proyecto no accesible: $PROJ_DIR"; exit 1; }

mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

if [[ ! -s Singularity ]]; then
  echo "[1/4] descargando tarball del branch ipc-2018-seq-opt (~107 MB)..."
  rm -f Singularity team23.tar.gz
  curl -fL --progress-bar -o team23.tar.gz "$TARBALL_URL"
  echo "       extrayendo archivo Singularity..."
  # El tarball expande a un dir con nombre dinámico tipo ipc2018-classical-team23-<hash>/
  tar -xzf team23.tar.gz
  RECIPE_SRC="$(find . -maxdepth 2 -name Singularity -type f | head -1)"
  if [[ -z "$RECIPE_SRC" ]]; then
    echo "ERROR: no se encontró archivo Singularity en el tarball"
    tar -tzf team23.tar.gz | head -20
    exit 1
  fi
  cp "$RECIPE_SRC" Singularity
fi
SIZE=$(wc -c < Singularity)
echo "      ✓ $SIZE bytes"
if [[ "$SIZE" -lt 500 ]]; then
  echo "ERROR: receta sospechosamente pequeña ($SIZE bytes); abort"
  head -20 Singularity
  exit 1
fi

if [[ -f planner.img ]]; then
  echo "[2/4] planner.img ya existe en $BUILD_DIR, skip build"
else
  echo "[2/4] apptainer build (10-30 min)..."
  apptainer build planner.img Singularity
fi
echo "      ✓ $(ls -lh planner.img | awk '{print $5}')"

echo "[3/4] copiando a $TARGET_IMG"
cp planner.img "$TARGET_IMG"
echo "      ✓ $(ls -lh "$TARGET_IMG" | awk '{print $5}')"

echo "[4/4] DONE"
