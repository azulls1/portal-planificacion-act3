# Steering — Sistema de diseño

## Decisión

El portal usa **Forest Design System v1.0** como única fuente de verdad de UI. Repo de referencia (clonado localmente):

- Local: `../../desing-system/`
- Origen: https://github.com/azulls1/desing-system.git

## Por qué

| Alternativa | Por qué no |
|---|---|
| Tailwind v4 plano sin DS | Cada componente desde cero → tiempo, inconsistencia |
| Material Angular | Estética muy genérica, no pega con un trabajo académico de planificación |
| PrimeNG | Pesa, restringe, estética enterprise |
| **Forest DS** ✅ | Tailwind v4 nativo · Angular 19+ compatible · clases de componentes listas (`btn`, `card`, `glass`, `animate-fadeInUp`) · light-mode estricto (menos decisiones) · estética que diferencia el entregable |

## Reglas no-negociables heredadas del Forest DS

1. **Light mode ONLY**. Nunca `dark:` ni `prefers-color-scheme: dark`. Para fondos oscuros usamos `.dark-surface` (sigue siendo light-mode global).
2. **Forest `#04202C` es el color de acción primario**.
3. **Fondo de página siempre** `bg-gray-50` (`#F7F8F7`), nunca blanco puro.
4. **Fuente mínima 12px** (`text-xs`). Nunca menor.
5. **Iconos siempre SVG inline**. Nada de entidades HTML.
6. **Easing único**: `cubic-bezier(0.25, 0.1, 0.25, 1)` en todas las transiciones.

## Paleta canónica (no inventar colores)

| Token | Hex | Uso |
|---|---|---|
| `forest` | `#04202C` | Botones primarios, títulos, acentos |
| `evergreen` | `#304040` | Subtítulos, fondos oscuros |
| `pine` | `#5B7065` | Iconos, labels, énfasis medio |
| `fog` | `#C9D1C8` | Bordes, divisores, placeholders |
| `moss` | `#9EADA3` | Texto deshabilitado, sutil |
| `bark` | `#1A3036` | Texto fuerte alternativo |
| `midnight` | `#021519` | Endpoints de gradientes oscuros |

Semánticos: `success #059669`, `error #DC2626`, `warning #D97706`, `info #2563EB`.

## Tipografía

| Rol | Fuente | Clase |
|---|---|---|
| Display / Títulos | **Sora** 400-700 | `.font-display` |
| Cuerpo / UI | **DM Sans** 400-700 | default `body` |
| Código / PDDL / tags | **JetBrains Mono** 400-600 | `.font-mono` |

Tamaños base: `15px` body · `12px` mínimo · `36px` 4xl máx para headers.

## Mapeo Forest DS → secciones del portal

| Sección portal | Componentes del DS a usar |
|---|---|
| `/` (home) | `.card-hero` con `.gradient-dark` + `.dark-surface` · `.stagger-children` · `.btn-cta` |
| `/snake` | `.card` para evidencias · `.tabs` (instalación / ejecución / plan) · `.badge-active`/`badge-error` por estado · `.alert-info` con caveats |
| `/rover` | `.card-section` para enunciado · grafo en `<svg>` sobre `.glass` · Monaco editor (PDDL) dentro de `.card` · `.tabs` (domain / problem / plan) · `.progress` para visualización del plan paso a paso |
| `/escenarios` | grid de `.card-feature` (uno por integrante) · `.tag` con `font-mono` para `problem-N.pddl` · `.empty-state` para integrantes pendientes |
| `/escenarios/<integrante>` | `.card` + diff viewer · `.btn btn-cta` para "Re-ejecutar" · `.toast-success`/`toast-error` post-ejecución |
| `/reporte` | PDF viewer dentro de `.card-section` · `.table` para referencias APA · `.btn-secondary` "Descargar PDF" / "Descargar .bib" |
| Layout global | `.navbar` con `.glass` · `.sidebar` con `.sidebar-link` activos por ruta · `.breadcrumb` |
| Estados async | `.skeleton` para placeholders · `.loading-dots` durante ejecución del planner · `.progress--indeterminate` mientras Celery procesa |

## Patrones específicos para datos de planificación

| Caso | Patrón Forest DS |
|---|---|
| Plan generado (texto plano) | `<pre class="font-mono">` dentro de `.card`, opcionalmente con `.dark-surface` para contraste estilo terminal |
| Acción del plan (item) | `.card-compact` + `.tag` para el nombre de la acción + `.badge` con coste |
| Estado del planner | `.badge-active` (running), `.badge-info` (queued), `.badge-error` (failed), `.badge` neutro (completed) |
| Diff entre `problem-1.pddl` y `problem-N.pddl` | `.card-section` con dos columnas + highlight verde/rojo usando `success.bg` / `error.bg` semánticos |
| Topología L1-L5 del rover | SVG sobre `.glass-subtle`, nodos con stroke `pine`, flechas dirigidas en `forest`, flechas bidireccionales en `evergreen` |
| CTA "Re-ejecutar planner" | `.btn btn-cta` con `.hover-lift` |

## Cómo se integra en el repo del portal

```
portal-actividad3/
└── apps/frontend/
    ├── package.json
    ├── postcss.config.js          # plugin @tailwindcss/postcss
    ├── src/
    │   ├── styles.css             # @import "tailwindcss"; @import "./forest/forest.css";
    │   └── forest/                # COPIA de desing-system/css/
    │       ├── forest.css
    │       ├── forest-theme.css
    │       ├── forest-components.css
    │       ├── forest-utilities.css
    │       ├── forest-animations.css
    │       ├── forest-dark-surface.css
    │       └── forest-print.css
    └── index.html                 # <link> Sora / DM Sans / JetBrains Mono
```

**Estrategia de vendoring**: copiamos los CSS al repo del portal (`src/forest/`) — no instalamos vía npm desde GitHub. Razón: el DS es un proyecto sibling del equipo, no un paquete versionado en registry. Si el DS evoluciona, hacemos `pull` consciente y registramos la versión en `decisions/ADR-005-design-system-version.md`.

## Reglas anti-deriva

1. **Prohibido crear nuevas clases CSS globales** fuera de `forest/`. Si necesitamos algo, primero buscamos en `desing-system/docs/*.md`; si no existe, abrimos issue en el repo del DS.
2. **Prohibido usar colores hex literales** en componentes Angular. Solo tokens Tailwind (`bg-forest`, `text-pine`, etc.).
3. **Prohibido instalar otra librería de UI** (Material, PrimeNG, Ng-Zorro, etc.).
4. **Prohibido dark mode**. Repetimos: light only.
5. **Componentes Angular = wrappers ultra-finos** sobre clases Forest. No reescribir estilos.

## Verificación previa a merge

| Check | Cómo |
|---|---|
| No hay `dark:` en templates Angular | `grep -r "dark:" apps/frontend/src` debe estar vacío (excepto `.dark-surface`) |
| No hay colores hex en CSS de componentes | Lint custom o grep `#[0-9a-fA-F]{3,8}` en `apps/frontend/src/app/**/*.css` |
| No hay fonts menores a `text-xs` | grep `text-(2xs|tiny)` debe estar vacío |
| Iconos son SVG inline | grep `&#` en templates debe estar vacío |

## Pendientes

| ID | Pregunta | Bloquea |
|---|---|---|
| DS-1 | ¿Subimos un fork del DS al GitLab interno o lo vendoreamos solamente en el portal? | Estrategia de mantenimiento |
| DS-2 | ¿El profesor verá el portal en navegador del laptop o impreso? Si imprime, `forest-print.css` es crítico | Prioridad de `forest-print.css` |
| DS-3 | ¿Hay logo / imagen institucional del equipo o del curso para `/`? | Hero |
