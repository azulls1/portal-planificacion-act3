#!/usr/bin/env bash
# =============================================================================
# Ejecuta Delfi 1 sobre los 4 problemas que entregamos
# =============================================================================
# Requiere:  Singularity instalado + planner.img construido
#            (correr antes:  ./infra/singularity/pull-planner.sh)
#
# Genera:    entregables/planes/{snake-problem-1, rover-problem-1, -2, -3}-plan.txt
#
# Uso:       bash tools/run_all_planners.sh
# =============================================================================

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMG="${REPO}/infra/singularity/planner.img"
PDDL="${REPO}/entregables/pddl"
PLANS="${REPO}/entregables/planes"

if [[ ! -f "${IMG}" ]]; then
    echo "ERROR: planner.img no encontrado en ${IMG}"
    echo "Ejecuta primero:  cd infra/singularity && ./pull-planner.sh"
    exit 1
fi

run_planner() {
    local label="$1"        # "snake-p01"
    local domain="$2"       # path al domain.pddl
    local problem="$3"      # path al problem.pddl
    local out_plan="$4"     # path donde guardar el plan

    echo "=== ${label} ==="
    local rundir
    rundir="$(mktemp -d -t "delfi-${label}-XXXXXX")"
    cp "${domain}"  "${rundir}/domain.pddl"
    cp "${problem}" "${rundir}/problem.pddl"

    local sas_plan="${rundir}/sas_plan"
    local stdout_log="${rundir}/stdout.log"
    local start_ts
    start_ts=$(date +%s)

    # Límites oficiales del IPC 2018
    ulimit -t 1800
    ulimit -v 8388608

    set +e
    singularity run -C -H "${rundir}" "${IMG}" \
        "${rundir}/domain.pddl" "${rundir}/problem.pddl" "${sas_plan}" \
        > "${stdout_log}" 2>&1
    local rc=$?
    set -e

    local end_ts
    end_ts=$(date +%s)
    local elapsed=$((end_ts - start_ts))

    if [[ -f "${sas_plan}" ]] && [[ ${rc} -eq 0 ]]; then
        cp "${sas_plan}" "${out_plan}"
        local actions
        actions=$(grep -cE '^\(' "${sas_plan}" || true)
        echo "  ✓ OK · ${actions} acciones · ${elapsed}s · ${out_plan}"
    else
        echo "  ✗ FALLÓ con exit=${rc} en ${elapsed}s"
        echo "    log preservado en: ${stdout_log}"
        # No exit 1 — queremos seguir con los demás
    fi
    echo ""
}

# Orden: rovers primero (rápidos, < 1 min cada uno), Snake al final (potencial 30 min).

# Rover problem-1 (criterio 2)
run_planner "rover-p1" \
    "${PDDL}/domain.pddl" \
    "${PDDL}/problem-1.pddl" \
    "${PLANS}/rover-problem-1-plan.txt"

# Rover problem-2 (criterio 3 - escenario alternativo 1)
run_planner "rover-p2" \
    "${PDDL}/domain.pddl" \
    "${PDDL}/problem-2.pddl" \
    "${PLANS}/rover-problem-2-plan.txt"

# Rover problem-3 (criterio 3 - escenario alternativo 2)
run_planner "rover-p3" \
    "${PDDL}/domain.pddl" \
    "${PDDL}/problem-3.pddl" \
    "${PLANS}/rover-problem-3-plan.txt"

# Snake p01 (criterio 1) — Delfi 1 cubre 11/20 problemas Snake; puede no resolver.
run_planner "snake-p01" \
    "${PDDL}/snake-ipc2018/domain.pddl" \
    "${PDDL}/snake-ipc2018/p01.pddl" \
    "${PLANS}/snake-problem-1-plan.txt"

echo "==============================================================================="
echo "Ejecuciones completadas."
echo "Próximo paso: validar con el comparador:"
echo ""
echo "  python tools/compare_plans.py problem-1 ${PLANS}/rover-problem-1-plan.txt"
echo "  python tools/compare_plans.py problem-2 ${PLANS}/rover-problem-2-plan.txt"
echo "  python tools/compare_plans.py problem-3 ${PLANS}/rover-problem-3-plan.txt"
echo ""
echo "Y tomar capturas del último output de cada ejecución para el reporte."
echo "==============================================================================="
