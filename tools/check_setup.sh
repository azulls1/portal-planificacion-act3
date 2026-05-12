#!/usr/bin/env bash
# =============================================================================
# Validador de setup — Singularity + Delfi 1 + PDDL
# =============================================================================
# Ejecuta este script en tu VPS/máquina Linux ANTES de empezar a trabajar para
# verificar que todo está listo para construir y ejecutar Delfi 1.
#
# Uso:  bash tools/check_setup.sh
# =============================================================================

set -u  # error si una variable no está definida (pero no -e, queremos seguir checando)

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
    local label="$1"
    local cmd="$2"
    local expected="${3:-}"

    printf "  %-40s " "${label}"
    if output=$(eval "${cmd}" 2>&1); then
        if [[ -n "${expected}" ]] && [[ "${output}" != *"${expected}"* ]]; then
            printf "${YELLOW}⚠${NC} %s\n" "${output}"
            WARN=$((WARN+1))
        else
            printf "${GREEN}✓${NC} %s\n" "${output}"
            PASS=$((PASS+1))
        fi
    else
        printf "${RED}✗${NC} (no instalado o falla)\n"
        FAIL=$((FAIL+1))
    fi
}

section() {
    echo ""
    echo -e "${BOLD}$1${NC}"
}

echo "==============================================================================="
echo " Validador de setup para Singularity + Delfi 1"
echo " $(date)"
echo "==============================================================================="

# -----------------------------------------------------------------------------
section "[1] Sistema operativo y kernel"
# -----------------------------------------------------------------------------
check "Distro"           "cat /etc/os-release | grep -E '^PRETTY_NAME' | cut -d= -f2 | tr -d '\"'"
check "Kernel"           "uname -r"
check "Arquitectura"     "uname -m"                                          "x86_64"
check "User namespaces"  "cat /proc/sys/kernel/unprivileged_userns_clone 2>/dev/null || echo 'n/a (kernel reciente, OK por defecto)'"

# -----------------------------------------------------------------------------
section "[2] Tipo de virtualización"
# -----------------------------------------------------------------------------
if command -v systemd-detect-virt >/dev/null 2>&1; then
    VIRT=$(systemd-detect-virt)
    printf "  %-40s " "Virtualización detectada"
    case "${VIRT}" in
        kvm|qemu|vmware|microsoft|xen|none)
            printf "${GREEN}✓${NC} %s (Singularity OK)\n" "${VIRT}"
            PASS=$((PASS+1))
            ;;
        openvz|lxc|lxc-libvirt)
            printf "${RED}✗${NC} %s (Singularity NO funcionará en contenedores compartidos)\n" "${VIRT}"
            FAIL=$((FAIL+1))
            ;;
        *)
            printf "${YELLOW}⚠${NC} %s (verificar manualmente)\n" "${VIRT}"
            WARN=$((WARN+1))
            ;;
    esac
else
    printf "  %-40s ${YELLOW}⚠${NC} systemd-detect-virt no disponible\n" "Virtualización"
    WARN=$((WARN+1))
fi

# -----------------------------------------------------------------------------
section "[3] Recursos"
# -----------------------------------------------------------------------------
check "CPUs"             "nproc"
check "RAM total"        "free -h | awk '/^Mem:/ {print \$2}'"
check "RAM disponible"   "free -h | awk '/^Mem:/ {print \$7}'"
check "Disco libre /"    "df -h / | awk 'NR==2 {print \$4}'"

# -----------------------------------------------------------------------------
section "[4] Privilegios"
# -----------------------------------------------------------------------------
printf "  %-40s " "sudo disponible"
if sudo -n true 2>/dev/null; then
    printf "${GREEN}✓${NC} sin contraseña\n"
    PASS=$((PASS+1))
elif sudo -v 2>/dev/null; then
    printf "${YELLOW}⚠${NC} requiere contraseña (OK pero menos cómodo)\n"
    WARN=$((WARN+1))
else
    printf "${RED}✗${NC} sin sudo (Singularity build requiere sudo)\n"
    FAIL=$((FAIL+1))
fi

# -----------------------------------------------------------------------------
section "[5] Dependencias del sistema (apt)"
# -----------------------------------------------------------------------------
for pkg in build-essential libseccomp-dev pkg-config squashfs-tools cryptsetup curl wget git; do
    printf "  %-40s " "${pkg}"
    if dpkg -l "${pkg}" 2>/dev/null | grep -q "^ii"; then
        printf "${GREEN}✓${NC} instalado\n"
        PASS=$((PASS+1))
    else
        printf "${RED}✗${NC} NO instalado — sudo apt install -y ${pkg}\n"
        FAIL=$((FAIL+1))
    fi
done

# -----------------------------------------------------------------------------
section "[6] Go (requerido por Singularity)"
# -----------------------------------------------------------------------------
printf "  %-40s " "Go ≥ 1.18"
if command -v go >/dev/null 2>&1; then
    GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
    printf "${GREEN}✓${NC} %s\n" "${GO_VERSION}"
    PASS=$((PASS+1))
else
    printf "${RED}✗${NC} no instalado\n"
    FAIL=$((FAIL+1))
fi

# -----------------------------------------------------------------------------
section "[7] Singularity"
# -----------------------------------------------------------------------------
printf "  %-40s " "Singularity ≥ 3.5"
if command -v singularity >/dev/null 2>&1; then
    SING_VERSION=$(singularity --version 2>&1 | head -1)
    printf "${GREEN}✓${NC} %s\n" "${SING_VERSION}"
    PASS=$((PASS+1))
else
    printf "${YELLOW}⚠${NC} no instalado (proceder a infra/singularity/README.md)\n"
    WARN=$((WARN+1))
fi

# -----------------------------------------------------------------------------
section "[8] Conectividad a bitbucket (para descargar Delfi 1)"
# -----------------------------------------------------------------------------
printf "  %-40s " "HTTPS a bitbucket.org"
if curl -sI -o /dev/null -w "%{http_code}" https://bitbucket.org 2>/dev/null | grep -q "200\|301\|302"; then
    printf "${GREEN}✓${NC}\n"
    PASS=$((PASS+1))
else
    printf "${RED}✗${NC} sin acceso\n"
    FAIL=$((FAIL+1))
fi

# -----------------------------------------------------------------------------
section "[9] Archivos del proyecto"
# -----------------------------------------------------------------------------
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
check "domain.pddl rover"       "test -f '${PROJECT_ROOT}/entregables/pddl/domain.pddl' && echo present"
check "problem-1.pddl rover"    "test -f '${PROJECT_ROOT}/entregables/pddl/problem-1.pddl' && echo present"
check "problem-2.pddl rover"    "test -f '${PROJECT_ROOT}/entregables/pddl/problem-2.pddl' && echo present"
check "problem-3.pddl rover"    "test -f '${PROJECT_ROOT}/entregables/pddl/problem-3.pddl' && echo present"
check "Snake domain.pddl"       "test -f '${PROJECT_ROOT}/entregables/pddl/snake-ipc2018/domain.pddl' && echo present"
check "Snake p01.pddl"          "test -f '${PROJECT_ROOT}/entregables/pddl/snake-ipc2018/p01.pddl' && echo present"
check "pull-planner.sh"         "test -x '${PROJECT_ROOT}/infra/singularity/pull-planner.sh' && echo executable"

# -----------------------------------------------------------------------------
# Resumen
# -----------------------------------------------------------------------------
echo ""
echo "==============================================================================="
echo -e " ${BOLD}Resumen${NC}: ${GREEN}${PASS} OK${NC} · ${YELLOW}${WARN} warnings${NC} · ${RED}${FAIL} fallos${NC}"
echo "==============================================================================="

if [[ ${FAIL} -gt 0 ]]; then
    echo ""
    echo -e "${RED}✗ Hay fallos. Resuélvelos antes de continuar.${NC}"
    echo "  Mira infra/singularity/README.md para instalación paso a paso."
    exit 1
elif [[ ${WARN} -gt 0 ]]; then
    echo ""
    echo -e "${YELLOW}⚠ Setup utilizable con advertencias. Procede con cuidado.${NC}"
    exit 0
else
    echo ""
    echo -e "${GREEN}✓ Setup completo. Listo para correr Delfi 1.${NC}"
    echo ""
    echo "Próximo paso:"
    echo "  cd infra/singularity && ./pull-planner.sh"
    exit 0
fi
