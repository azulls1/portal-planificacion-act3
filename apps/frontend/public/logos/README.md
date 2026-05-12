# Logos del portal

Logos institucionales y de marca usados en el portal.

## Cómo se sirven

| Archivo aquí | URL en el portal |
|---|---|
| `public/logos/universidad.svg` | `/logos/universidad.svg` |
| `public/logos/curso.png` | `/logos/curso.png` |

## Uso en componentes Angular

```html
<img
  src="/logos/universidad.svg"
  alt="Logotipo de la Universidad"
  class="h-10 w-auto"
/>
```

## Convenciones obligatorias

1. **SVG sobre PNG** siempre que se pueda. Escala perfecta a cualquier tamaño.
2. **Versiones light + dark** si el logo lo requiere, sufijo `-light` / `-dark`:
   ```
   universidad.svg          ← versión principal (sobre fondo claro)
   universidad-on-dark.svg  ← versión para fondos forest/midnight
   ```
3. **Optimización SVG**: pasar por SVGO antes de commitear:
   ```bash
   npx svgo public/logos/*.svg
   ```
4. **Sin texto rasterizado**: si el logo tiene texto, debe ser path vectorial, no fuente.
5. **Naming kebab-case**: `nxt-corp.svg`, no `NXT_Corp.svg`.
6. **Atributo `alt` descriptivo**: el nombre de la entidad, no la palabra "logo".
   - ✅ `alt="Universidad XYZ"`
   - ❌ `alt="logo"`

## Logos típicos para esta actividad

| Logo | Slug sugerido | Uso |
|---|---|---|
| Universidad / posgrado | `universidad.svg` | Header del reporte · footer del portal |
| Logo del curso / programa | `curso.svg` | Hero de `/` |
| Logo del equipo (opcional) | `equipo.svg` | `/equipo` |
| Logo del profesor / cátedra | `catedra.svg` | Sección de créditos |

## Dimensiones recomendadas

- Logos vectoriales (SVG): sin restricción.
- Logos rasterizados (PNG): 2x resolución para retina display.
  - Lockup horizontal: 600×200 px @ 2x
  - Marca cuadrada: 512×512 px @ 2x
  - Favicon: 64×64 px (ya está en `../favicon.svg`)

## Licencia y permisos

- **Verificar derechos de uso** antes de commitear cualquier logo institucional.
- Si el logo es propiedad de la universidad, validar que su uso en contexto académico está permitido.
- No incluir logos de terceros (Singularity, Python, etc.) sin atribución explícita.

## Implementación actual en el portal

| Componente | Logo usado | Estado |
|---|---|---|
| `app.component` brand (sidebar) | ★ inline SVG (no archivo) | ✅ |
| `home.component` hero | (sin logo) | ⬜ pendiente — añadir aquí |
| `report.component` | (sin logo) | ⬜ pendiente |
| footer | (sin logo) | ⬜ pendiente |
