# Ilustraciones y gráficos decorativos

Ilustraciones SVG/PNG que decoran el portal sin ser logos ni capturas (ej: gráficos de flujo, diagramas conceptuales, ilustraciones de hero).

## Naming

```
illustrations/<nombre-kebab>.{svg,png}
```

Ejemplos:

```
illustrations/planning-flow.svg
illustrations/rover-isometric.svg
illustrations/pddl-pipeline.svg
illustrations/hero-pattern.svg
```

## Especificaciones

| Atributo | Valor |
|---|---|
| Formato preferido | **SVG** (escala perfecta, peso mínimo) |
| Alternativa rasterizada | PNG con fondo transparente, 2x resolución |
| Estilo | Coherente con Forest DS: paleta `forest`/`pine`/`fog`/`moss`, sin texturas estilo bitmap |
| Colores | Usar tokens del DS (var(--color-forest), etc.) — no hex literales fuera de paleta |

## Uso en componentes

```html
<!-- Decorativa -->
<img
  src="/illustrations/planning-flow.svg"
  alt=""
  aria-hidden="true"
  class="w-64 mx-auto"
/>

<!-- Significativa -->
<img
  src="/illustrations/rover-isometric.svg"
  alt="Ilustración isométrica del rover transportando minerales"
  class="w-full max-w-md"
/>
```

> **Importante**: si la ilustración es solo decorativa, usa `alt=""` y `aria-hidden="true"` para que los lectores de pantalla la ignoren. Si comunica información, descripción significativa en `alt`.

## SVG inline vs. archivo

| Caso | Cuándo |
|---|---|
| **SVG inline** en `.component.ts` | Iconos pequeños (≤ 24px), reutilizables, necesitan ser tematizados con `currentColor` |
| **Archivo SVG** en `illustrations/` | Ilustraciones más complejas (> 50 KB inline penaliza bundle), no necesitan tematizado dinámico |

## Optimización SVG

```bash
# Limpia metadata, comentarios, atributos redundantes
npx svgo *.svg

# Multi-archivo
npx svgo --folder=. --recursive
```

Idealmente cada ilustración SVG: < 20 KB después de `svgo`.

## Si no tienes ilustraciones propias

Fuentes libres/atribuibles compatible con uso académico:

- https://undraw.co/ — SVG personalizables, licencia open
- https://heroicons.com/ — iconos (no ilustraciones), MIT
- https://blush.design/ — ilustraciones más artísticas
- https://www.opendoodles.com/ — open source

> Si usas una fuente externa, **registra la atribución** en este README al pie y/o en el reporte APA según sea relevante.

## Atribuciones (vacío de momento)

| Archivo | Fuente | Licencia |
|---|---|---|
| (ninguna aún) | | |
