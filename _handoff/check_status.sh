#!/usr/bin/env bash
# Diagnóstico rápido del estado del handoff.
# Uso: bash _handoff/check_status.sh
set -uo pipefail

SIF=/opt/delfi-build/planner.sif
LOG=/opt/delfi-build/build.log
REPO=/opt/stacks/portal-act3

echo "════════════════════════════════════════"
echo " ESTADO DEL HANDOFF · $(date)"
echo "════════════════════════════════════════"

echo
echo "[1/5] Build del planner.sif"
if [ -f "$SIF" ]; then
    size=$(stat -c%s "$SIF")
    mb=$((size / 1024 / 1024))
    echo "  ✅ TERMINADO · planner.sif · ${mb} MB"
else
    echo "  🟡 En curso..."
    if [ -f "$LOG" ]; then
        echo "     log: $(wc -l < "$LOG") líneas · iniciado $(head -1 "$LOG" | sed 's/BUILD STARTED: //')"
        echo "     última fase: $(tail -1 "$LOG" | head -c 100)"
    fi
    if docker ps --filter ancestor=quay.io/singularity/singularity:v4.0.0 --format '{{.ID}}' | grep -q .; then
        echo "     container vivo: $(docker ps --filter ancestor=quay.io/singularity/singularity:v4.0.0 --format '{{.Status}}')"
    else
        echo "     ⚠️ container ya no corre — revisar log para ver si terminó OK o falló"
    fi
fi

echo
echo "[2/5] Planes en repositorio (txt files)"
for p in snake-problem-1 rover-problem-1 rover-problem-2 rover-problem-3; do
    f="$REPO/entregables/planes/${p}-plan.txt"
    if [ -f "$f" ]; then
        actions=$(grep -c '^(' "$f" 2>/dev/null || echo 0)
        sha=$(sha256sum "$f" | cut -c1-16)
        mtime=$(date -r "$f" '+%Y-%m-%d %H:%M')
        echo "  ✓ $p · $actions acciones · sha=$sha · mtime=$mtime"
    else
        echo "  ✗ $p · NO existe"
    fi
done

echo
echo "[3/5] Outputs stdout de ejecución real"
if [ -d "$REPO/entregables/planes/_runs" ]; then
    ls -la "$REPO/entregables/planes/_runs/" 2>&1 | tail -5
else
    echo "  (vacío — aún no se ejecutó el planner real)"
fi

echo
echo "[4/5] Portal en producción"
echo "  /api/entregable/info:"
curl -sS https://rover-mineral-transport.iagentek.com.mx/api/entregable/info \
    | python3 -c 'import json,sys
d = json.load(sys.stdin)
print(f"    ZIP exists={d[\"exists\"]} size={d[\"size_bytes\"]} sha={d[\"sha256\"][:16] if d[\"sha256\"] else None}...")
print(f"    PDF exists={d[\"reporte_pdf_exists\"]} size={d[\"reporte_pdf_size_bytes\"]}")'

echo
echo "[5/5] Próximo paso"
if [ -f "$SIF" ]; then
    echo "  ▶ bash $REPO/_handoff/run_after_build.sh"
    echo "    (ejecuta planner real + regenera capturas + rebuild + redeploy)"
else
    echo "  ⏳ esperar a que termine el build (revisar tail $LOG)"
    echo "    cuando termine, correr: bash $REPO/_handoff/run_after_build.sh"
fi
echo "════════════════════════════════════════"
