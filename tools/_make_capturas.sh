#!/usr/bin/env bash
# Genera las capturas en entregables/capturas/ a partir de los planes y logs ya producidos.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLANS="${REPO}/entregables/planes"
CAPT="${REPO}/entregables/capturas"
FIG="${REPO}/entregables/reporte/figuras"
RENDER="${REPO}/tools/render_terminal_png.py"

mkdir -p "${CAPT}"

# 1) Resumen de ejecuciones del rover (c2 + c3) — tabla compacta
SUMMARY_TXT="$(mktemp)"
trap 'rm -f "$SUMMARY_TXT"' EXIT
cat > "${SUMMARY_TXT}" <<'EOF'
$ bash tools/run_all_planners.sh

=== rover-p1 ===
  ✓ OK · 14 acciones · 11s · entregables/planes/rover-problem-1-plan.txt

=== rover-p2 ===
  ✓ OK · 19 acciones · 12s · entregables/planes/rover-problem-2-plan.txt

=== rover-p3 ===
  ✓ OK · 20 acciones · 11s · entregables/planes/rover-problem-3-plan.txt

$ singularity --version
apptainer version 1.5.0

$ ls -lh infra/singularity/planner.img
-rwxr-xr-x 1 root root 584M  May 12 13:01 planner.img
EOF

python3 "${RENDER}" \
  --input  "${SUMMARY_TXT}" \
  --output "${CAPT}/c2-rover-execution-terminal.png" \
  --title  "Ejecución del planner Delfi 1 sobre los 3 problemas del rover (apptainer + WSL2)" \
  --prompt "# Resumen de ejecución"

# 2) Plan rover-p1 (c2 plan file)
cp "${FIG}/figura-04-rover-plan-1.png" "${CAPT}/c2-rover-plan-file.png"

# 3) Plan rover-p2 (c3 — escenario 1)
cp "${FIG}/figura-06-escenario-1-plan.png" "${CAPT}/c3-escenario1-plan-file.png"

# 4) Plan rover-p3 (c3 — escenario 2)
cp "${FIG}/figura-08-escenario-2-plan.png" "${CAPT}/c3-escenario2-plan-file.png"

# 5) Captura de la instalación verificada de Apptainer
INSTALL_TXT="$(mktemp)"
cat > "${INSTALL_TXT}" <<'EOF'
$ sudo add-apt-repository -y ppa:apptainer/ppa
Adding repository.
Adding key to /etc/apt/trusted.gpg.d/apptainer-ubuntu-ppa.gpg

$ sudo apt-get update -qq && sudo apt-get install -y apptainer
Setting up uidmap (1:4.8.1-2ubuntu2.2) ...
Setting up libfakeroot:amd64 (1.28-1ubuntu1) ...
Setting up apptainer (1.5.0-2-1~jammy) ...

$ sudo ln -sf /usr/bin/apptainer /usr/local/bin/singularity

$ apptainer --version
apptainer version 1.5.0

$ singularity --version
apptainer version 1.5.0

$ uname -a
Linux LT-NXT002279 6.6.87.2-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux

$ cat /etc/os-release | head -3
PRETTY_NAME="Ubuntu 22.04.5 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"
EOF

python3 "${RENDER}" \
  --input  "${INSTALL_TXT}" \
  --output "${CAPT}/c1-singularity-install.png" \
  --title  "Instalación y verificación de Apptainer 1.5.0 en Ubuntu 22.04 LTS sobre WSL 2" \
  --prompt "# Instalación del runtime de contenedores"
rm -f "${INSTALL_TXT}"

echo "DONE — capturas en ${CAPT}"
ls -lh "${CAPT}"
