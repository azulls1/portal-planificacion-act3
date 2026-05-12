# Steering — Tech Stack

Stack pinneado del proyecto. Cambios requieren ADR en `decisions/`.

## Frontend

| Componente | Tecnología | Versión objetivo | Notas |
|---|---|---|---|
| Framework | **Angular** | ≥ 19 (última estable a 2026-05) | Standalone components, signals, control flow nuevo (`@if`, `@for`) |
| Estilos base | **Tailwind CSS v4** | ≥ 4.0 | Con `@theme` overrides (no `tailwind.config.js`) |
| Sistema de diseño | **Forest Design System v1.0** | (vendoreado desde `desing-system/`) | Light-mode ONLY, paleta forest, glassmorphism, easing Apple. Ver `steering/design-system.md` |
| Fuentes | Sora · DM Sans · JetBrains Mono | Google Fonts | Vía `<link>` en `index.html` |
| Editor de código (PDDL viewer) | Monaco Editor | ≥ 0.45 | Vía `ngx-monaco-editor-v2` o wrapper propio |
| Visualización de grafos | D3.js o `vis-network` | latest | Para topologías de localidades del rover |
| Visor PDF | `ngx-extended-pdf-viewer` | latest | Para embeber el reporte APA |
| Routing | Angular Router | (incluido) | Lazy loading por feature |
| Estado | Signals + RxJS | (incluido) | NgRx solo si surge necesidad |
| HTTP | `HttpClient` | (incluido) | Interceptor para errores |
| Build | Vite (Angular CLI moderno) | (incluido) | |
| Test | Jest o Karma+Jasmine | (default Angular CLI) | Mínimo: smoke tests |

## Backend

| Componente | Tecnología | Versión objetivo | Notas |
|---|---|---|---|
| Lenguaje | **Python** | ≥ 3.11 | Type hints obligatorios; mypy strict |
| Framework web | **FastAPI** | ≥ 0.115 | Async-first, OpenAPI automático |
| Validación | Pydantic | ≥ 2.10 | Modelos como contratos |
| Cola de tareas | **Celery** | ≥ 5.4 | Para ejecuciones de planner que pueden tardar |
| Broker | **Redis** | ≥ 7.2 | También como result backend de Celery |
| Cliente Supabase | `supabase-py` | latest | Auth + DB + Storage |
| Ejecución de planner | `subprocess` + Singularity CLI | — | Wrapper Python que invoca `singularity exec` |
| Test | pytest + pytest-asyncio | latest | Validators de planes PDDL como tests |
| Lint | Ruff | ≥ 0.7 | |
| Format | Ruff format (reemplaza Black) | — | |

## Base de datos / Auth / Storage

| Aspecto | Tecnología | Notas |
|---|---|---|
| Base de datos | **Supabase** (Postgres 15+) | Tablas: `plan_runs`, `scenarios`, `team_members`, `references` |
| Auth | Supabase Auth | Email/password para los integrantes del equipo |
| Storage | Supabase Storage | Buckets: `pddl-files/`, `plans/`, `screenshots/`, `report/` |
| Row Level Security | habilitada | Profesor lee todo; integrantes editan solo lo suyo |

## Planificación PDDL

| Aspecto | Tecnología | Notas |
|---|---|---|
| Planner principal | **Ganador del IPC2018 optimal track** | A determinar tras leer slides Results — candidatos comunes: `Delfi`, `Complementary2`, `Scorpion` |
| Runtime de contenedores | **Singularity / Apptainer** | ≥ 3.5 (versión del guide del docx) |
| Plan B (si Singularity falla) | Editor online: `editor.planning.domains` | Documentar fallback en reporte |
| Parser PDDL para validación | `pddl` (paquete Python) o `lark`-based propio | Para validar archivos antes de mandarlos al planner |

## Infraestructura local

| Aspecto | Tecnología | Notas |
|---|---|---|
| Orquestación local | Docker Compose | Servicios: `frontend`, `backend`, `redis`, `worker` (Celery) |
| Supabase local | `supabase` CLI (`supabase start`) | Opcional; alternativa: usar proyecto Supabase Cloud free tier |
| Reverse proxy local | Caddy o Vite proxy dev | Para evitar CORS |
| Singularity | Instalado fuera de Docker (host directo o WSL) | Singularity no se puede correr dentro de Docker fácilmente |

## Versionado y CI

| Aspecto | Tecnología | Notas |
|---|---|---|
| VCS | Git + GitHub | Convención de ramas: `main` + `feat/<nombre>` |
| Commits | Conventional Commits | `feat(rover): añadir problem-2 escenario X` |
| CI | GitHub Actions (opcional) | Solo si tenemos tiempo: lint + tests + build |
| Pre-commit | `pre-commit` framework | Hooks: ruff, prettier, conventional-commits |

## Decisiones de stack ya tomadas

- ✅ Angular sobre React/Vue: porque el equipo tiene mayor familiaridad y porque Angular tiene patrones estructurados que se alinean con la disciplina del framework.
- ✅ FastAPI sobre Django/Flask: async-first, OpenAPI auto, más liviano para un portal de este alcance.
- ✅ Supabase sobre Postgres self-hosted: setup en minutos, Auth + Storage incluidos, free tier suficiente.
- ✅ Celery+Redis sobre alternativas (RQ, Dramatiq, ARQ): el usuario lo solicitó explícitamente.
- ✅ Singularity nativo (o WSL) sobre simulación: cumple el criterio 1 nivel 3+ del profesor.

## Pendientes a decidir

| ID | Decisión | Quién | Cuándo |
|---|---|---|---|
| TS-1 | Identificar planner exacto del IPC2018 optimal track ganador | Líder infra | Antes de H1 |
| TS-2 | Supabase local vs Cloud | Líder backend | Antes de H4 |
| TS-3 | Monaco vs CodeMirror para PDDL viewer | Líder frontend | Antes de H4 |
| TS-4 | Si exponer Celery Flower para debug | Líder backend | Antes de H4 |
