#!/usr/bin/env python3
"""
Genera el ZIP final del entregable de la Actividad 3.

Estructura del ZIP (alineada con la rúbrica del profesor: 3 criterios · 10 pts):

    entregable-actividad-3-adonai-hernandez.zip
    ├── LEEME.md                       (mapeo a rúbrica)
    ├── 01-pddl/                       (criterio 2: abstracción PDDL)
    │   ├── domain.pddl
    │   ├── problem-1.pddl             (rover base)
    │   ├── problem-2.pddl             (escenario alternativo 1)
    │   ├── problem-3.pddl             (escenario alternativo 2)
    │   └── snake-ipc2018/{domain,p01}.pddl
    ├── 02-planes/                     (planes generados por Delfi 1)
    │   ├── snake-problem-1-plan.txt   (24 acciones — criterio 1)
    │   ├── rover-problem-1-plan.txt   (14 acciones — criterio 2)
    │   ├── rover-problem-2-plan.txt   (19 acciones — criterio 2)
    │   └── rover-problem-3-plan.txt   (20 acciones — criterio 2)
    ├── 03-capturas/                   (evidencia visual por criterio)
    │   └── c1-*.png · c2-*.png · c3-*.png
    └── 04-reporte/                    (criterio 3: APA)
        ├── reporte.md
        ├── reporte.pdf                (si existe)
        ├── references.bib
        └── figuras/figura-{01..08}.{png,svg}

Uso:
    python tools/build_entregable_zip.py

Salida:
    entregables/entregable-actividad-3.zip
"""
from __future__ import annotations

import hashlib
import sys
import zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "entregables"
OUT = REPO / "entregables" / "entregable-actividad-3.zip"


LEEME = """\
# Entregable — Actividad 3: Razonamiento y planificación automática

Autor: **Adonai Samael Hernández Mata**
Programa: Maestría en Inteligencia Artificial — Universidad Internacional de La Rioja (UNIR)
Fecha: 12 de mayo de 2026

---

## Mapeo a la rúbrica (3 criterios · 10 pts totales)

| Criterio | Pts | Evidencia en este ZIP |
|---|---|---|
| **C1** Ejecución de Delfi 1 sobre Snake p01 | 3 | `02-planes/snake-problem-1-plan.txt` (24 acciones) + `03-capturas/c1-*.png` |
| **C2** Detección de anomalías / abstracción PDDL del rover | 5 | `01-pddl/{domain,problem-1,problem-2,problem-3}.pddl` + `02-planes/rover-problem-{1,2,3}-plan.txt` + `04-reporte/figuras/figura-{03..08}.*` |
| **C3** Redacción, formato y citación APA | 2 | `04-reporte/reporte.{md,pdf}` + `04-reporte/references.bib` |

## Resumen de evidencia

- **4 archivos PDDL del rover** (1 dominio + 3 problemas, los problem-2 y problem-3 son escenarios alternativos diseñados por el autor)
- **4 planes generados por Delfi 1**, ganador del optimal track del IPC2018 — todos óptimos:
  - Snake p01: 24 acciones (393 s)
  - Rover problem-1: 14 acciones (11 s)
  - Rover problem-2: 19 acciones (12 s)
  - Rover problem-3: 20 acciones (11 s)
- **Reporte APA** de 11 secciones con 11 referencias bibliográficas
- **8 figuras** numeradas + **7 capturas** anexas para criterios C1–C2

## Hashes SHA-256 de los planes (verificable con `sha256sum`)

Los hashes están listados en la sección 6.3 del reporte.

## Cómo reproducir las ejecuciones

Pipeline detallado en el reporte (sección 3) y en el repositorio:
<https://github.com/azulls1/portal-planificacion-act3>

Pasos cortos:
1. Instalar Apptainer 1.5.0 en Ubuntu 22.04 (PPA `apptainer/ppa`).
2. Build de la imagen Delfi 1 (~16 min, 584 MB): `bash infra/singularity/_build-from-wsl.sh`
3. Ejecutar los 4 problemas: `bash tools/run_all_planners.sh`
"""


def add_file(z: zipfile.ZipFile, src: Path, arcname: str) -> int:
    """Agrega un archivo al ZIP. Devuelve el tamaño en bytes."""
    if not src.exists():
        print(f"  [!] omitido (no existe): {src}", file=sys.stderr)
        return 0
    z.write(src, arcname)
    return src.stat().st_size


def main() -> int:
    if not SRC.is_dir():
        print(f"ERROR: no encuentro {SRC}", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)

    total_files = 0
    total_bytes = 0
    skipped: list[str] = []

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        # LEEME.md
        z.writestr("LEEME.md", LEEME)
        total_files += 1
        total_bytes += len(LEEME.encode("utf-8"))

        # 01-pddl/
        for name in ("domain.pddl", "problem-1.pddl", "problem-2.pddl", "problem-3.pddl"):
            size = add_file(z, SRC / "pddl" / name, f"01-pddl/{name}")
            if size:
                total_files += 1
                total_bytes += size
            else:
                skipped.append(f"01-pddl/{name}")

        # Snake IPC2018 originales
        for name in ("domain.pddl", "p01.pddl"):
            size = add_file(
                z, SRC / "pddl" / "snake-ipc2018" / name,
                f"01-pddl/snake-ipc2018/{name}",
            )
            if size:
                total_files += 1
                total_bytes += size

        # 02-planes/
        for plan in (SRC / "planes").glob("*-plan.txt"):
            size = add_file(z, plan, f"02-planes/{plan.name}")
            if size:
                total_files += 1
                total_bytes += size

        # 03-capturas/
        capturas_dir = SRC / "capturas"
        if capturas_dir.is_dir():
            for capt in sorted(capturas_dir.glob("*.png")):
                size = add_file(z, capt, f"03-capturas/{capt.name}")
                if size:
                    total_files += 1
                    total_bytes += size

        # 04-reporte/
        reporte_dir = SRC / "reporte"
        for top_name in ("reporte.md", "reporte.pdf", "references.bib"):
            size = add_file(z, reporte_dir / top_name, f"04-reporte/{top_name}")
            if size:
                total_files += 1
                total_bytes += size
            else:
                if top_name == "reporte.pdf":
                    skipped.append("04-reporte/reporte.pdf (aún no exportado)")
                else:
                    skipped.append(f"04-reporte/{top_name}")

        # Figuras del reporte
        figs_dir = reporte_dir / "figuras"
        if figs_dir.is_dir():
            for fig in sorted(figs_dir.iterdir()):
                if fig.is_file() and fig.suffix.lower() in {".png", ".svg", ".jpg", ".jpeg"}:
                    size = add_file(z, fig, f"04-reporte/figuras/{fig.name}")
                    if size:
                        total_files += 1
                        total_bytes += size

    # Hash del ZIP resultante
    h = hashlib.sha256()
    with OUT.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)

    size_mb = OUT.stat().st_size / (1024 * 1024)
    print(f"[OK] ZIP generado: {OUT}")
    print(f"  {total_files} archivos · {total_bytes / 1024:.1f} KB sin comprimir · {size_mb:.2f} MB comprimido")
    print(f"  SHA-256: {h.hexdigest()}")
    if skipped:
        print(f"\n  [!] Omitidos ({len(skipped)}):")
        for s in skipped:
            print(f"    - {s}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
