# Capturas de pantalla — evidencia visual

Acá viven los screenshots que prueban la ejecución del planner y demás artefactos.

## Convención de nombres

```
<criterio>-<descripcion>.png
```

Ejemplos:

```
c1-singularity-install.png
c1-snake-execution-terminal.png
c1-snake-plan-file.png
c2-rover-execution-terminal.png
c2-rover-plan-file.png
c3-<integrante>-execution.png
c3-<integrante>-plan-file.png
```

## Reglas

- Formato: **PNG** (mejor compresión para terminales).
- Resolución: máx 1920px de ancho. Comprimir con `pngquant` antes de commitear.
- Tamaño individual: < 500 KB ideal, < 1 MB máximo.
- Tamaño total de la carpeta: < 20 MB.
- Timestamps visibles en las capturas (ayuda al profesor a verificar autenticidad).
- Contexto claro: la terminal debe mostrar suficiente prompt para identificar el contenedor / sistema.

## Capturas mínimas requeridas

| Captura | Para criterio | Estado |
|---|---|---|
| `c1-singularity-install.png` | C1 nivel 3+ | ⬜ pendiente |
| `c1-snake-execution-terminal.png` | C1 nivel 3+ | ⬜ pendiente |
| `c1-snake-plan-file.png` | C1 nivel 4 | ⬜ pendiente |
| `c2-rover-execution-terminal.png` | C2 nivel 3+ | ⬜ pendiente |
| `c2-rover-plan-file.png` | C2 nivel 4 | ⬜ pendiente |
| `c3-integrante1-execution.png` | C3 | ⬜ pendiente |
| `c3-integrante2-execution.png` | C3 | ⬜ pendiente |
| `c3-integrante3-execution.png` | C3 | ⬜ pendiente |

## Cómo comprimir

```bash
# Una imagen
pngquant --quality=65-85 --output capt.png capt-original.png

# Toda la carpeta
find . -name "*.png" -exec pngquant --quality=65-85 --ext .png --force {} \;
```
