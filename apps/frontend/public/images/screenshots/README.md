# Capturas de pantalla embebidas en el portal

Capturas que se muestran **dentro del portal en vivo** (ej: sección `/snake/ejecucion`).

> ⚠️ NO confundir con `entregables/capturas/` — esa carpeta es para capturas que adjuntas al reporte PDF para el profesor. Aquí van las que enseñas en el portal navegable.

## Naming (mismo patrón que entregables/capturas/)

```
screenshots/<criterio>-<descripcion>.png
```

| Slug | Para criterio | Mostrar en |
|---|---|---|
| `c1-singularity-install.png` | C1 · Snake | `/snake` tab Instalación |
| `c1-snake-execution-terminal.png` | C1 · Snake | `/snake` tab Ejecución |
| `c1-snake-plan-file.png` | C1 · Snake | `/snake` tab Plan generado |
| `c2-rover-execution-terminal.png` | C2 · Rover | `/rover` tab Plan paso a paso |
| `c2-rover-plan-file.png` | C2 · Rover | `/rover` tab Plan paso a paso |
| `c3-<integrante>-execution.png` | C3 · Escenarios | `/escenarios/<slug>` |
| `c3-<integrante>-plan-file.png` | C3 · Escenarios | `/escenarios/<slug>` |

## Especificaciones

| Atributo | Valor |
|---|---|
| Formato | **PNG** (mejor para terminales con texto fino) |
| Ancho máximo | 1920 px |
| Peso máximo | 500 KB por captura |
| Resolución | Suficiente para que se lea el texto al hacer zoom moderado |
| Timestamps | Visibles en la captura (autenticidad) |
| Contenido | Solo lo relevante; recortar (no incluir taskbar de Windows, otras ventanas, etc.) |

## Uso en componente

Ejemplo en `snake.component.ts`:

```html
<img
  src="/images/screenshots/c1-snake-execution-terminal.png"
  alt="Terminal ejecutando el script de Singularity para la tarea Snake"
  class="rounded-2xl shadow-soft w-full max-w-3xl mx-auto"
/>
```

## Optimización antes de commit

```bash
# Una captura
pngquant --quality=70-90 --output capt.png capt-original.png

# Toda la carpeta
find . -name "*.png" -exec pngquant --quality=70-90 --ext .png --force {} \;
```

## Doble residencia (igual archivo en dos sitios)

Si quieres usar la misma captura en el portal Y en el reporte PDF:

1. Versiónala en `entregables/capturas/` (fuente de verdad)
2. Copia un símbolo o duplicado a `apps/frontend/public/images/screenshots/`
3. Documenta el origen en este README si no es obvio

O usa un script `predeploy` que sincronice ambas carpetas.
