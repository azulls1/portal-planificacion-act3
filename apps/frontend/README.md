# Frontend — Portal Actividad 3

Angular 19 standalone + Tailwind CSS v4 + Forest Design System v1.0 (vendoreado en `src/forest/`).

## Arranque local

```bash
cd apps/frontend
npm install
npm start                # http://localhost:4200
```

El proxy `proxy.conf.json` enruta `/api/*` a `http://localhost:8000` (backend FastAPI).

## Estructura

```
src/
├── index.html                 # link a fuentes Sora/DM Sans/JetBrains Mono
├── styles.css                 # @import tailwindcss + forest.css
├── main.ts                    # bootstrapApplication
├── forest/                    # CSS vendoreado del Forest DS
└── app/
    ├── app.component.ts       # layout + navbar
    ├── app.config.ts          # providers
    ├── app.routes.ts          # rutas lazy
    ├── core/api.service.ts    # cliente del backend
    └── features/
        ├── home/              # /
        ├── snake/             # /snake (criterio 1)
        ├── rover/             # /rover (criterio 2)
        │   ├── rover.component.ts
        │   └── rover-graph.component.ts (SVG topología)
        ├── scenarios/         # /escenarios (criterio 3)
        └── report/            # /reporte (criterio 4)
```

## Reglas heredadas del Forest DS (no negociables)

- Light mode ONLY. Prohibido `dark:` y `prefers-color-scheme: dark`.
- Fondo de página: `bg-gray-50`.
- Fuente mínima: `text-xs` (12px).
- Iconos SVG inline siempre.
- Tokens de color: `forest`, `evergreen`, `pine`, `fog`, `moss`, `bark`, `midnight`.

## Build de producción

```bash
npm run build
# salida: dist/portal-act3/
```
