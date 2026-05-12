# Figuras del reporte APA

Imágenes que se embeben en el reporte académico (PDF/DOCX final).

## Convención de nombres

```
figura-NN-<descripcion-kebab>.{png,svg,jpg}
```

Ejemplos:

```
figura-01-topologia-rover.svg
figura-02-singularity-instalacion.png
figura-03-snake-plan-generado.png
figura-04-rover-plan-paso-a-paso.svg
figura-05-escenario-integrante-2.svg
```

## Reglas

| Aspecto | Convención |
|---|---|
| Formatos preferidos | **SVG** para diagramas · **PNG** para capturas · **JPG** solo para fotos |
| Resolución mínima | 300 DPI para impresión (rasterizadas) |
| Resolución máxima | 1920 px de ancho (peso razonable) |
| Numeración | Empieza en `01`, dos dígitos, consistente con la referencia en el reporte |
| Caption | El reporte (`reporte-template.md`) ya tiene `**Figura N.** ...` — solo asegurarse que el archivo y la referencia coincidan |

## Mínimas requeridas por el reporte template

| # | Descripción | Slug | Status |
|---|---|---|---|
| 1 | Captura terminal ejecutando script Singularity (Snake) | `figura-01-singularity-snake.png` | ⬜ |
| 2 | Captura archivo del plan Snake | `figura-02-snake-plan.png` | ⬜ |
| 3 | Grafo de localidades del problema base | `figura-03-rover-topologia.svg` | ⬜ (extraer del portal) |
| 4 | Plan generado para rover problem-1 | `figura-04-rover-plan-1.png` | ⬜ |
| 5+ | Una figura por escenario alternativo de integrante | `figura-NN-escenario-X.png` | ⬜ |

## Cómo exportar la topología del portal a SVG

La página `/rover` (tab Topología) tiene el grafo en SVG inline. Para exportarlo:

1. Abrir el portal en navegador en el modo desarrollador.
2. Inspeccionar el `<svg>` dentro de `app-rover-graph`.
3. Copiar el HTML del nodo.
4. Guardar como `figura-03-rover-topologia.svg` en esta carpeta.

Alternativa: Ctrl+Shift+S en Inkscape sobre el SVG abierto desde el portal.

## Diferencia con `entregables/capturas/`

| Carpeta | Propósito |
|---|---|
| `entregables/figuras/` (aquí) | Imágenes que **van dentro del reporte PDF/DOCX** |
| `entregables/capturas/` | Capturas que **complementan** la evidencia pero no necesariamente entran al reporte |
| `apps/frontend/public/images/` | Imágenes para mostrar **dentro del portal web** |

Una misma imagen puede vivir en varias si se necesita en múltiples contextos. Sin embargo, hay que **versionar la original aquí** y referenciarla por copia o link en las otras.

## Optimización antes de commit

```bash
# Capturas PNG: pngquant
find . -name "*.png" -exec pngquant --quality=80-95 --ext .png --force {} \;

# SVG: svgo
npx svgo *.svg

# Tamaño total objetivo
du -sh .
```

Objetivo: < 5 MB total.
