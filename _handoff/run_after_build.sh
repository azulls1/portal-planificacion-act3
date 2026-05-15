#!/usr/bin/env bash
# ============================================================================
# Script todo-en-uno: ejecutar planner real + regenerar artefactos + redeploy
# ============================================================================
# Espera a que termine el build del planner.sif, luego:
#   1. Ejecuta Delfi 1 sobre los 4 problemas
#   2. Reemplaza planes/*.txt con el output real
#   3. Renderiza capturas con el stdout real
#   4. Recomputa hashes SHA-256 en reporte.md
#   5. Regenera PDF y ZIP
#   6. Sube a Supabase Storage
#   7. Rebuild imagen backend + redeploy
#
# Uso (en el VPS):
#   nohup bash /opt/stacks/portal-act3/_handoff/run_after_build.sh \
#       > /opt/stacks/portal-act3/_handoff/run.log 2>&1 &
# Cuando termina, revisar run.log para ver el resumen.
# ============================================================================
set -uo pipefail

REPO=/opt/stacks/portal-act3
SIF=/opt/delfi-build/planner.sif
BUILD_LOG=/opt/delfi-build/build.log
HANDOFF_LOG=$REPO/_handoff/run.log

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

cd "$REPO" || { log "ERR: no se pudo cd a $REPO"; exit 1; }

# ----------------------------------------------------------------------------
# Paso 0: esperar a que termine el build
# ----------------------------------------------------------------------------
log "==== PASO 0: esperando que termine el build de planner.sif ===="
WAITED=0
MAX_WAIT=3600  # 1 h
while [ ! -f "$SIF" ]; do
    if [ $WAITED -ge $MAX_WAIT ]; then
        log "ERR: timeout esperando el build después de $MAX_WAIT s"
        log "     revisar: tail $BUILD_LOG"
        exit 1
    fi
    # ¿Container sigue vivo?
    if ! docker ps --filter ancestor=quay.io/singularity/singularity:v4.0.0 --format '{{.ID}}' | grep -q .; then
        # No hay container y no hay sif → falló
        log "ERR: container de build ya no existe y planner.sif no se generó"
        log "     últimas 30 líneas del log:"
        tail -30 "$BUILD_LOG" | sed 's/^/        /'
        exit 1
    fi
    sleep 60
    WAITED=$((WAITED + 60))
    log "  esperando... ($WAITED s) · log $(wc -l < "$BUILD_LOG") líneas"
done
SIF_SIZE=$(stat -c%s "$SIF")
log "OK: planner.sif listo (${SIF_SIZE} bytes = $((SIF_SIZE / 1024 / 1024)) MB)"

# ----------------------------------------------------------------------------
# Paso 1: ejecutar planner sobre los 4 problemas
# ----------------------------------------------------------------------------
log "==== PASO 1: ejecutando Delfi 1 sobre 4 problemas ===="
bash tools/run_real_planner.sh 2>&1 | sed 's/^/    /'

# Verificar que los 4 planes existen
ALL_OK=true
for p in snake-problem-1 rover-problem-1 rover-problem-2 rover-problem-3; do
    if [ ! -f "entregables/planes/${p}-plan.txt" ]; then
        log "ERR: falta entregables/planes/${p}-plan.txt"
        ALL_OK=false
    fi
done
if [ "$ALL_OK" != "true" ]; then
    log "ERR: alguno de los 4 problemas no produjo plan — abort"
    exit 1
fi

# ----------------------------------------------------------------------------
# Paso 2: actualizar hashes SHA-256 en reporte.md
# ----------------------------------------------------------------------------
log "==== PASO 2: actualizando hashes en reporte.md ===="
python3 <<'PYEOF'
import hashlib
import re
from pathlib import Path

REPO = Path("/opt/stacks/portal-act3")
report = REPO / "entregables/reporte/reporte.md"
text = report.read_text(encoding="utf-8")

def sha256_of(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

new_hashes = {}
for plan_name in ["snake-problem-1-plan.txt", "rover-problem-1-plan.txt",
                  "rover-problem-2-plan.txt", "rover-problem-3-plan.txt"]:
    p = REPO / "entregables/planes" / plan_name
    if p.is_file():
        new_hashes[plan_name] = sha256_of(p)
        print(f"  {plan_name}: {new_hashes[plan_name][:16]}...")

# Reemplaza la tabla de hashes (formato: | `plan-name.txt` | `hash` |)
for plan_name, new_hash in new_hashes.items():
    pattern = rf"(\| `{re.escape(plan_name)}` \| `)[a-f0-9]{{64}}(` \|)"
    text = re.sub(pattern, rf"\g<1>{new_hash}\g<2>", text)
    # También el hash inline si aparece en §4.3 (Snake)
    if plan_name == "snake-problem-1-plan.txt":
        text = re.sub(r"^[a-f0-9]{64}$", new_hash, text, flags=re.MULTILINE)

report.write_text(text, encoding="utf-8")
print("OK: hashes actualizados en reporte.md")
PYEOF

# ----------------------------------------------------------------------------
# Paso 3: regenerar PDF
# ----------------------------------------------------------------------------
log "==== PASO 3: regenerando PDF ===="
bash tools/build_pdf.sh 2>&1 | sed 's/^/    /'

# ----------------------------------------------------------------------------
# Paso 4: regenerar capturas con stdout real (best-effort)
# ----------------------------------------------------------------------------
log "==== PASO 4: regenerando capturas con stdout real ===="
# Usar render_terminal_png.py si existe, alimentando el verbose real del planner
RENDER=$REPO/tools/render_terminal_png.py
if [ -f "$RENDER" ]; then
    for p in snake-problem-1 rover-problem-1 rover-problem-2 rover-problem-3; do
        stdout_file="$REPO/entregables/planes/_runs/${p}.stdout"
        if [ -f "$stdout_file" ]; then
            # Mapeo: snake-problem-1 → c1-snake-execution-terminal.png
            case "$p" in
                snake-problem-1)
                    out="$REPO/entregables/capturas/c1-snake-execution-terminal.png"
                    title="Snake p01 — ejecución real de Delfi 1"
                    ;;
                rover-problem-1)
                    out="$REPO/entregables/capturas/c2-rover-execution-terminal.png"
                    title="Rover problem-1 — ejecución real de Delfi 1"
                    ;;
                rover-problem-2)
                    out="$REPO/entregables/capturas/c3-escenario1-plan-file.png"
                    title="Rover problem-2 (escenario 1) — ejecución real"
                    ;;
                rover-problem-3)
                    out="$REPO/entregables/capturas/c3-escenario2-plan-file.png"
                    title="Rover problem-3 (escenario 2) — ejecución real"
                    ;;
            esac
            # Tail 60 líneas del stdout (lo más relevante: cierre del planner + plan)
            tail -60 "$stdout_file" | python3 "$RENDER" --title "$title" --output "$out" 2>&1 | sed 's/^/      /' || true
        fi
    done
else
    log "  (render_terminal_png.py no encontrado — capturas no regeneradas)"
fi

# ----------------------------------------------------------------------------
# Paso 5: regenerar ZIP
# ----------------------------------------------------------------------------
log "==== PASO 5: regenerando ZIP ===="
python3 tools/build_entregable_zip.py 2>&1 | sed 's/^/    /'

# ----------------------------------------------------------------------------
# Paso 6: subir a Supabase Storage
# ----------------------------------------------------------------------------
log "==== PASO 6: subiendo a Supabase Storage ===="
bash _handoff/upload_to_storage.sh 2>&1 | sed 's/^/    /'

# ----------------------------------------------------------------------------
# Paso 7: rebuild imagen + redeploy
# ----------------------------------------------------------------------------
log "==== PASO 7: rebuild backend image + redeploy ===="
docker build -t portal-act3-backend:latest -f apps/backend/Dockerfile.prod . 2>&1 | tail -3 | sed 's/^/    /'
docker service update --force --image portal-act3-backend:latest portal-act3_backend --detach=true 2>&1 | sed 's/^/    /'

# ----------------------------------------------------------------------------
# Paso 8: verificación final
# ----------------------------------------------------------------------------
log "==== PASO 8: verificación final ===="
sleep 25
log "  curl /api/entregable/info:"
curl -sS https://rover-mineral-transport.iagentek.com.mx/api/entregable/info \
    | python3 -m json.tool 2>/dev/null | sed 's/^/    /'

log ""
log "════════════════════════════════════════"
log "  HANDOFF COMPLETADO · $(date)"
log "════════════════════════════════════════"
log ""
log "Para ver resultados:"
log "  - Portal: https://rover-mineral-transport.iagentek.com.mx/entregables"
log "  - Planes nuevos: $REPO/entregables/planes/"
log "  - Capturas nuevas: $REPO/entregables/capturas/"
log "  - Stdouts del planner: $REPO/entregables/planes/_runs/"
log ""
log "Próximos pasos opcionales (humano):"
log "  - Revisar capturas y aceptarlas o regenerar manualmente"
log "  - git add + commit + push de los cambios"
