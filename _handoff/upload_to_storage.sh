#!/usr/bin/env bash
# Re-upload ZIP y PDF actualizados al bucket Supabase Storage.
# Uso: bash _handoff/upload_to_storage.sh
set -euo pipefail

REPO=/opt/stacks/portal-act3
BACKEND_CID=$(docker ps -q -f name=portal-act3_backend | head -1)

if [ -z "$BACKEND_CID" ]; then
    echo "[ERR] backend container no encontrado" >&2
    exit 1
fi

ZIP="$REPO/entregables/entregable-actividad-3.zip"
PDF="$REPO/entregables/reporte/reporte.pdf"

if [ ! -f "$ZIP" ] || [ ! -f "$PDF" ]; then
    echo "[ERR] ZIP o PDF no existen — regenerarlos primero" >&2
    exit 1
fi

# Copia los archivos al container para tener acceso a la SERVICE key
docker cp "$ZIP" "$BACKEND_CID":/tmp/zip.zip
docker cp "$PDF" "$BACKEND_CID":/tmp/reporte.pdf

docker exec "$BACKEND_CID" python3 -c '
import httpx
SVC = open("/run/secrets/portal_act3_supabase_service_key").read().strip()
URL = "http://supabase-maestria_kong:8000/storage/v1/object/entregables-portal-act3"
H = {"apikey": SVC, "Authorization": f"Bearer {SVC}"}
for src, dst, ctype in [
    ("/tmp/zip.zip", "entregable-actividad-3.zip", "application/zip"),
    ("/tmp/reporte.pdf", "reporte-actividad-3.pdf", "application/pdf"),
]:
    with open(src, "rb") as f:
        r = httpx.post(f"{URL}/{dst}", headers={**H, "Content-Type": ctype, "x-upsert": "true"},
                       content=f.read(), timeout=60)
    print(f"{dst:32s} -> {r.status_code}")
'

echo "[OK] subidos a bucket entregables-portal-act3"
echo "  ZIP: https://supabase-maestria.iagentek.com.mx/storage/v1/object/public/entregables-portal-act3/entregable-actividad-3.zip"
echo "  PDF: https://supabase-maestria.iagentek.com.mx/storage/v1/object/public/entregables-portal-act3/reporte-actividad-3.pdf"
