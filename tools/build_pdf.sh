#!/usr/bin/env bash
# Regenera entregables/reporte/reporte.pdf desde reporte.md con pandoc/xelatex.
#
# Cambios respecto a una conversión directa:
#   1. Reemplaza caracteres unicode no cubiertos por Latin Modern Roman
#      (↔, ≈) por equivalentes ASCII solo en una copia temporal del .md.
#      El .md original queda intacto.
#   2. Aplica el header LaTeX en `entregables/reporte/_header.tex`
#      para densidad de página suficiente que entre en 12 págs.
#
# Uso:
#   bash tools/build_pdf.sh
#
# Salida:
#   entregables/reporte/reporte.pdf  (12 págs · ~325 KB)
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
RD="$REPO/entregables/reporte"
SRC="$RD/reporte.md"
TMP="$RD/.reporte-pdf-source.md"
PDF="$RD/reporte.pdf"
HEADER="$RD/_header.tex"

if [ ! -f "$SRC" ]; then
    echo "[ERR] reporte.md no encontrado en $SRC" >&2
    exit 1
fi

# Header LaTeX (si no existe, lo crea)
if [ ! -f "$HEADER" ]; then
    cat > "$HEADER" <<'LATEX'
\setlength{\parskip}{4pt}
\setlength{\parindent}{0pt}
\AtBeginDocument{\setkeys{Gin}{width=0.6\linewidth,keepaspectratio}}
\usepackage{titlesec}
\titlespacing*{\section}{0pt}{8pt}{4pt}
\titlespacing*{\subsection}{0pt}{6pt}{2pt}
LATEX
fi

# Sustituye caracteres que Latin Modern no incluye, sin tocar el .md fuente.
# ↔ → <->   ≈ → ~   ←/→/↑/↓ → <-/->/↑/↓ (estos últimos sí están en LM)
sed \
    -e 's/↔/<->/g' \
    -e 's/≈/~/g' \
    "$SRC" > "$TMP"

echo "[1/2] Pandoc → xelatex"
docker run --rm \
    -v "$RD:/data" -w /data \
    pandoc/extra:latest \
    --from markdown --to pdf --pdf-engine=xelatex \
    -V geometry:margin=1.8cm \
    -V fontsize=11pt \
    -V linestretch=1.0 \
    -V documentclass=article \
    -V colorlinks=true \
    -V papersize=letter \
    --syntax-highlighting=tango \
    -H "_header.tex" \
    -o "reporte.pdf" \
    ".reporte-pdf-source.md"

rm -f "$TMP"

if [ ! -f "$PDF" ]; then
    echo "[ERR] No se generó el PDF" >&2
    exit 1
fi

# Conteo de páginas (best-effort, requiere container poppler)
PAGES="$(docker run --rm -v "$RD:/d" minidocks/poppler:latest pdfinfo /d/reporte.pdf 2>/dev/null | awk '/^Pages:/ {print $2}' || echo "?")"
SIZE="$(du -h "$PDF" | cut -f1)"
echo "[2/2] OK: $PDF · $SIZE · $PAGES páginas"
