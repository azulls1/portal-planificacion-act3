# Steering — Estructura del repositorio

Cómo se organiza el código del portal y los entregables académicos.

## Layout propuesto (monorepo simple)

```
portal-actividad3/
├── README.md                       ← arranque del proyecto en local
├── docker-compose.yml              ← orquestación local de servicios
├── .env.example                    ← plantilla de variables de entorno
├── .nxt-ai/                        ← (la carpeta de este análisis se MUEVE al repo final)
│
├── apps/
│   ├── frontend/                   ← Angular
│   │   ├── package.json
│   │   ├── angular.json
│   │   ├── tailwind.config.js
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app/
│   │       │   ├── core/           ← servicios singleton, interceptors
│   │       │   ├── shared/         ← componentes reutilizables (Monaco wrapper, layout, etc.)
│   │       │   ├── features/
│   │       │   │   ├── home/
│   │       │   │   ├── snake/      ← Criterio 1
│   │       │   │   ├── rover/      ← Criterio 2
│   │       │   │   ├── scenarios/  ← Criterio 3
│   │       │   │   └── report/     ← Criterio 4
│   │       │   └── app.routes.ts
│   │       └── styles.css          ← Tailwind directives
│   │
│   └── backend/                    ← Python + FastAPI + Celery
│       ├── pyproject.toml
│       ├── src/
│       │   └── portal_act3/
│       │       ├── main.py         ← FastAPI app
│       │       ├── config.py       ← Pydantic settings
│       │       ├── api/
│       │       │   ├── plan_runs.py
│       │       │   ├── pddl_files.py
│       │       │   └── scenarios.py
│       │       ├── tasks/
│       │       │   ├── celery_app.py
│       │       │   └── run_planner.py    ← invoca Singularity
│       │       ├── domain/
│       │       │   ├── models.py         ← Pydantic models
│       │       │   └── pddl_validator.py ← parser de planes
│       │       └── adapters/
│       │           ├── supabase_client.py
│       │           └── singularity_runner.py
│       └── tests/
│           ├── test_pddl_validator.py
│           └── test_plan_runs_api.py
│
├── entregables/                    ← LO QUE SE ENTREGA AL PROFESOR
│   ├── reporte/
│   │   ├── reporte.docx            ← fuente
│   │   ├── reporte.pdf             ← entregable final
│   │   ├── referencias.bib         ← referencias APA
│   │   └── figuras/                ← imágenes del reporte
│   │
│   ├── pddl/
│   │   ├── domain.pddl             ← UN dominio común
│   │   ├── problem-1.pddl          ← rover base (5 localidades, 2 minerales)
│   │   ├── problem-2.pddl          ← escenario integrante 1
│   │   ├── problem-3.pddl          ← escenario integrante 2
│   │   └── README.md               ← cómo ejecutar cada uno
│   │
│   ├── planes/                     ← outputs del planner
│   │   ├── snake-problem-1-plan.txt
│   │   ├── rover-problem-1-plan.txt
│   │   ├── rover-problem-2-plan.txt
│   │   └── rover-problem-3-plan.txt
│   │
│   └── capturas/                   ← evidencia visual
│       ├── singularity-install.png
│       ├── snake-execution.png
│       ├── snake-plan-file.png
│       ├── rover-execution.png
│       └── ...
│
├── infra/
│   ├── singularity/
│   │   ├── README.md               ← instrucciones de instalación
│   │   └── pull-planner.sh         ← script para descargar el .sif del planner
│   ├── supabase/
│   │   ├── migrations/
│   │   │   └── 0001_initial.sql
│   │   └── seed.sql
│   └── celery/
│       └── README.md               ← cómo arrancar el worker
│
└── docs/                           ← documentación interna del repo
    ├── 00-getting-started.md
    ├── 01-pddl-modeling-decisions.md
    ├── 02-portal-architecture.md
    └── ADR/
        ├── ADR-001-capacidad-rover.md
        ├── ADR-002-funcion-costo.md
        └── ...
```

## Convenciones de nomenclatura

| Tipo | Convención | Ejemplo |
|---|---|---|
| Carpetas | kebab-case | `plan-runs/` |
| Archivos Python | snake_case | `pddl_validator.py` |
| Archivos Angular | kebab-case | `snake-execution.component.ts` |
| Archivos PDDL | kebab-case con número | `problem-1.pddl` |
| Ramas Git | `feat/<area>-<descripcion>` | `feat/rover-domain-modeling` |
| ADRs | `ADR-NNN-<slug>.md` | `ADR-001-capacidad-rover.md` |

## Single-writer por carpeta (regla del framework)

| Rol | Carpetas que edita exclusivamente |
|---|---|
| Constitutionalist (equipo) | `.nxt-ai/constitution.md`, `.nxt-ai/steering/` |
| Strategist (equipo) | `.nxt-ai/features/*/feature-spec.md`, `entregables/reporte/` |
| Architect (líder técnico) | `.nxt-ai/features/*/plan.md`, `.nxt-ai/decisions/ADR-*`, `infra/` |
| Sharder (líder técnico) | `.nxt-ai/features/*/unit-specs/`, `tasks.md` |
| Builder (cada integrante) | `apps/frontend/src/**`, `apps/backend/src/**`, `entregables/pddl/problem-{su-numero}.pddl` |

## Definición de Done por carpeta

| Carpeta | DoD |
|---|---|
| `entregables/pddl/` | Cada `.pddl` pasa el parser y produce plan |
| `entregables/reporte/` | PDF ≤ 12 págs, APA verificado |
| `entregables/capturas/` | Mínimo legible, contexto claro |
| `apps/frontend/` | `ng build` sin errores, lazy routes funcionan |
| `apps/backend/` | `pytest` verde, OpenAPI generado |
| `infra/singularity/` | README permite a un nuevo integrante instalar desde cero |

## Política de imágenes y assets

- Capturas de pantalla → PNG, máximo 1920px de ancho, comprimidas con `pngquant`.
- Figuras del reporte → SVG cuando sea posible (diagramas), PNG para screenshots.
- Logo / favicon del portal → SVG.
- Tamaño total de `entregables/capturas/` < 20 MB.
