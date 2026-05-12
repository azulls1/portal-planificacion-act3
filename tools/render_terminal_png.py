#!/usr/bin/env python3
"""
Renderiza el contenido de un archivo de texto como una imagen PNG con
estilo terminal (fondo oscuro, fuente monoespaciada, prompt incluido).

Uso:
    python tools/render_terminal_png.py \\
        --input  entregables/planes/rover-problem-1-plan.txt \\
        --output entregables/reporte/figuras/figura-04-rover-plan-1.png \\
        --title  "Plan generado por Delfi 1 para problem-1.pddl del rover" \\
        --prompt "$ cat sas_plan"

Sin deps externas más allá de Pillow.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BG = (24, 24, 27)          # zinc-900
FG = (228, 228, 231)       # zinc-200
ACCENT = (110, 231, 183)   # emerald-300 (para el prompt)
TITLE_BG = (39, 39, 42)    # zinc-800
TITLE_FG = (212, 212, 216) # zinc-300


def find_mono_font(size: int) -> ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSansMono.ttf",
        "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/CascadiaMono.ttf",
        "C:/Windows/Fonts/lucon.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def render(input_path: Path, output_path: Path, title: str, prompt: str) -> None:
    body = input_path.read_text(encoding="utf-8", errors="replace").rstrip("\n").split("\n")
    font = find_mono_font(16)
    title_font = find_mono_font(14)

    line_h = 22
    pad_x = 24
    pad_y = 20
    title_h = 36

    lines: list[tuple[tuple[int, int, int], str]] = [(ACCENT, prompt)]
    for ln in body:
        lines.append((FG, ln))

    longest = max((len(ln[1]) for ln in lines), default=80)
    char_w = font.getlength("M") if hasattr(font, "getlength") else 10
    width = int(pad_x * 2 + longest * char_w)
    width = max(width, 720)
    height = title_h + pad_y * 2 + line_h * len(lines)

    img = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(0, 0), (width, title_h)], fill=TITLE_BG)
    draw.ellipse([(14, 10), (30, 26)], fill=(255, 95, 86))
    draw.ellipse([(36, 10), (52, 26)], fill=(255, 189, 46))
    draw.ellipse([(58, 10), (74, 26)], fill=(39, 201, 63))
    draw.text((96, 10), title, font=title_font, fill=TITLE_FG)

    y = title_h + pad_y
    for color, text in lines:
        draw.text((pad_x, y), text, font=font, fill=color)
        y += line_h

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="PNG", optimize=True)
    print(f"  ✓ {output_path}  ({width}x{height})")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True, type=Path)
    p.add_argument("--output", required=True, type=Path)
    p.add_argument("--title", default="terminal")
    p.add_argument("--prompt", default="$")
    args = p.parse_args()
    render(args.input, args.output, args.title, args.prompt)


if __name__ == "__main__":
    main()
