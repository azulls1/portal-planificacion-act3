#!/usr/bin/env bash
# Re-ejecuta SOLO snake-p01 con el log preservado para evidencia.
set -uo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMG="${REPO}/infra/singularity/planner.img"
PDDL="${REPO}/entregables/pddl/snake-ipc2018"
LOGDIR="/root/snake-rerun"

mkdir -p "${LOGDIR}"
cp "${PDDL}/domain.pddl"  "${LOGDIR}/domain.pddl"
cp "${PDDL}/p01.pddl"     "${LOGDIR}/problem.pddl"

PLANFILE="${LOGDIR}/sas_plan"
STDOUT_LOG="${LOGDIR}/stdout.log"

ulimit -t 1800
ulimit -v 8388608

echo "Iniciando: $(date)"
START=$(date +%s)
set +e
singularity run -C -H "${LOGDIR}" "${IMG}" \
  "${LOGDIR}/domain.pddl" "${LOGDIR}/problem.pddl" "${PLANFILE}" \
  > "${STDOUT_LOG}" 2>&1
RC=$?
set -e
END=$(date +%s)
ELAPSED=$((END - START))

echo "Finalizado: $(date) · exit=${RC} · ${ELAPSED}s"
echo "Log: ${STDOUT_LOG}  ($(wc -l < "${STDOUT_LOG}" 2>/dev/null) líneas)"

if [[ -f "${PLANFILE}" ]]; then
  echo "PLAN OBTENIDO: $(grep -cE '^\(' "${PLANFILE}") acciones"
  cp "${PLANFILE}" "${REPO}/entregables/planes/snake-problem-1-plan.txt"
else
  echo "NO HUBO PLAN"
fi
