# Imágenes del portal

Carpeta para imágenes generales que el portal sirve directamente al navegador.

## Cómo se sirven

Todo lo que está en `apps/frontend/public/` se sirve desde la **raíz del sitio**.

| Archivo aquí | URL en el portal |
|---|---|
| `public/images/team.jpg` | `/images/team.jpg` |
| `public/images/screenshot-snake.png` | `/images/screenshot-snake.png` |

## Uso en componentes Angular

```html
<!-- en cualquier .component.ts template -->
<img src="/images/team.jpg" alt="Equipo" class="rounded-2xl shadow-soft" />
```

## Convenciones

- **Formatos**: SVG (preferido para vectores) · PNG (capturas, gráficos) · JPG (fotos) · WebP (cuando el peso importa).
- **Naming**: kebab-case, descriptivo. `snake-execution-terminal.png` ✅ `IMG_001.png` ❌
- **Tamaños**:
  - Hero: máximo 1920px de ancho · comprimir a < 200 KB
  - Cards: máximo 800px · < 80 KB
  - Iconos / decorativos: SVG inline en componentes, no aquí
- **Atributo `alt`**: SIEMPRE presente. Forest DS exige a11y (`docs/12-accessibility.md` del DS).
- **Sin texto incrustado**: para texto, usar HTML real (i18n y selección).

## Subcarpetas sugeridas

```
public/images/
├── README.md                ← este archivo
├── team/                    ← fotos de los integrantes del equipo
│   ├── integrante-1.jpg
│   ├── integrante-2.jpg
│   └── integrante-3.jpg
├── screenshots/             ← evidencias visibles dentro del portal
│   ├── snake-execution.png
│   └── rover-plan-output.png
└── illustrations/           ← gráficos decorativos
    └── planning-flow.svg
```

## Diferencia con `entregables/capturas/`

| Carpeta | Audiencia | Servida por |
|---|---|---|
| `apps/frontend/public/images/` | Visible dentro del **portal en vivo** | Angular dev-server (HTTP) |
| `entregables/capturas/` | Adjunta al **reporte PDF** del profesor | Lectura local desde el reporte |

Una misma imagen puede vivir en ambas si se usa en los dos contextos.

## Optimización

Antes de commitear:

```bash
# PNG: pngquant comprime sin pérdida visible
pngquant --quality=70-90 --output imagen.png imagen-original.png

# JPG: mozjpeg o magick
magick imagen.jpg -quality 82 imagen-optimizada.jpg

# SVG: svgo limpia metadata
npx svgo imagen.svg
```

Tamaño total objetivo de la carpeta: **< 10 MB**.
