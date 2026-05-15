#!/usr/bin/env bash
# =============================================================================
# Ejecuta Delfi 1 (Singularity image) sobre los 4 problemas del entregable
# usando singularity-in-docker (sin instalar Singularity en el host).
#
# Pre-requisitos:
#   - /opt/delfi-build/planner.sif construido (ver tools/build_pdf.sh build)
#   - docker disponible (con --privileged)
#
# Captura:
#   - stdout completo de cada ejecución → entregables/planes/_runs/<problem>.stdout
#   - el plan generado por Delfi → entregables/planes/<problem>-plan.txt
#
# Uso:
#   bash tools/run_real_planner.sh
# =============================================================================
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SIF="/opt/delfi-build/planner.sif"
RUNS_DIR="$REPO/entregables/planes/_runs"
mkdir -p "$RUNS_DIR"

if [ ! -f "$SIF" ]; then
    echo "[ERR] planner.sif no encontrado en $SIF" >&2
    exit 1
fi

# Problemas a ejecutar: nombre, dominio, problema, archivo plan destino
PROBLEMS=(
    "snake-problem-1|$REPO/entregables/pddl/snake-ipc2018/domain.pddl|$REPO/entregables/pddl/snake-ipc2018/p01.pddl|snake-problem-1-plan.txt"
    "rover-problem-1|$REPO/entregables/pddl/domain.pddl|$REPO/entregables/pddl/problem-1.pddl|rover-problem-1-plan.txt"
    "rover-problem-2|$REPO/entregables/pddl/domain.pddl|$REPO/entregables/pddl/problem-2.pddl|rover-problem-2-plan.txt"
    "rover-problem-3|$REPO/entregables/pddl/domain.pddl|$REPO/entregables/pddl/problem-3.pddl|rover-problem-3-plan.txt"
)

for entry in "${PROBLEMS[@]}"; do
    IFS='|' read -r name domain problem plan_out <<< "$entry"
    rundir="$(mktemp -d -p /tmp delfi-XXXX)"
    cp "$domain"  "$rundir/domain.pddl"
    cp "$problem" "$rundir/problem.pddl"

    echo
    echo "========================================================"
    echo "[$name] iniciando · $(date)"
    echo "========================================================"

    # Singularity script oficial del IPC2018 (DETAILS ON SINGULARITY)
    # Limites: 30 min CPU, 8 GB virtual memory
    start_ts=$(date +%s)
    (
        cd "$rundir"
        docker run --privileged --rm \
            -v "$rundir:/work" \
            -v "$SIF:/planner.sif:ro" \
            --workdir /work \
            quay.io/singularity/singularity:v4.0.0 \
            run -C -H /work /planner.sif /work/domain.pddl /work/problem.pddl /work/sas_plan
    ) > "$RUNS_DIR/$name.stdout" 2>&1 || true
    end_ts=$(date +%s)
    elapsed=$((end_ts - start_ts))

    # Buscar el archivo de plan (Delfi puede generar sas_plan.1, sas_plan, etc.)
    plan_found=""
    for candidate in "$rundir/sas_plan" "$rundir/sas_plan.1" "$rundir/sas_plan.2"; do
        if [ -f "$candidate" ]; then
            plan_found="$candidate"
        fi
    done
    if [ -z "$plan_found" ]; then
        # buscar cualquier sas_plan*
        plan_found="$(ls -1 "$rundir"/sas_plan* 2>/dev/null | sort -V | tail -1 || true)"
    fi

    if [ -n "$plan_found" ] && [ -f "$plan_found" ]; then
        cp "$plan_found" "$REPO/entregables/planes/$plan_out"
        actions=$(grep -c '^(' "$plan_found" || echo 0)
        echo "[$name] OK · $actions acciones · ${elapsed}s · $plan_out"
    else
        echo "[$name] FAIL · sin plan generado · ${elapsed}s · ver $RUNS_DIR/$name.stdout"
    fi

    rm -rf "$rundir"
done

echo
echo "========================================================"
echo "Resumen final · $(date)"
echo "========================================================"
for entry in "${PROBLEMS[@]}"; do
    IFS='|' read -r name _ _ plan_out <<< "$entry"
    target="$REPO/entregables/planes/$plan_out"
    if [ -f "$target" ]; then
        actions=$(grep -c '^(' "$target")
        sha=$(sha256sum "$target" | cut -c1-16)
        echo "  ✓ $name · $actions acciones · sha=$sha"
    else
        echo "  ✗ $name · sin plan"
    fi
done
