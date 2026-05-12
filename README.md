# Portal Actividad 3 — Planificación PDDL

> Autor: **Adonai Samael Hernández Mata** · Maestría en Inteligencia Artificial — UNIR · 2026

Portal web que sirve como entregable digital de la Actividad 3 del curso **Razonamiento y planificación automática** (Maestría, Primer Semestre).

Reúne en un solo lugar:

- 🐍 **Tarea Snake** del IPC2018 ejecutada con el planner ganador del optimal track
- 🤖 **Modelado PDDL del rover** (dominio + 3 problemas: base + 2 alternativos por integrante)
- 📊 **Visualización** de topologías, planes paso a paso y diffs entre escenarios
- 📄 **Reporte APA** descargable (máx 12 págs)

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 19+ standalone · Tailwind CSS v4 · **Forest Design System v1.0** (vendoreado) |
| Backend | Python 3.11+ · FastAPI · Celery · Redis |
| Datos / Auth | Supabase (Postgres + Auth + Storage) — opcional, fallback a modo degraded |
| Planificación | Singularity / Apptainer · planner ganador IPC2018 optimal track |
| Orquestación | Docker Compose |

## Quickstart (5 minutos)

### 1. Pre-requisitos

| Herramienta | Versión mínima |
|---|---|
| Python | 3.11 |
| Node.js | 22 |
| Docker Desktop | 4.x |
| Singularity / Apptainer | 3.5 (en Linux nativo, VM o WSL2) |

### 2. Clonar y configurar

```bash
git clone <url-del-repo> portal-planificacion-act3
cd portal-planificacion-act3
cp .env.example .env
# (opcional) editar .env con credenciales de Supabase
```

### 3. Backend + Redis con Docker Compose

```bash
docker compose up redis backend worker
# API en http://localhost:8000  (OpenAPI en /docs)
```

### 4. Frontend Angular

En otra terminal:

```bash
cd apps/frontend
npm install
npm start
# Portal en http://localhost:4200
```

### 5. (Opcional) Singularity + planner

Solo necesario para ejecutar el planner real desde el portal:

```bash
cd infra/singularity
./pull-planner.sh
# editar .env con SINGULARITY_IMAGE_PATH apuntando a planner.sif
```

## Estructura del repo

```
portal-planificacion-act3/
├── README.md                  ← este archivo
├── docker-compose.yml
├── .env.example
├── .nxt-ai/                   ← framework NXT-AI (constitución, steering, specs, ADRs)
├── apps/
│   ├── frontend/              ← Angular 19 + Forest DS
│   └── backend/               ← FastAPI + Celery
├── entregables/               ← LO QUE SE ENTREGA AL PROFESOR
│   ├── pddl/                  ← 1 domain + 3 problem.pddl
│   ├── planes/                ← planes generados (output del planner)
│   ├── capturas/              ← screenshots de evidencia
│   └── reporte/               ← reporte APA en PDF
├── infra/
│   ├── singularity/           ← scripts y guía de instalación
│   ├── supabase/              ← migrations SQL + setup
│   └── celery/                ← guía del worker
└── docs/                      ← documentación interna
```

## Mapeo a la rúbrica del profesor (3 criterios · 10 pts totales)

| Criterio | Pts | Sección del portal | Entregable físico |
|---|---|---|---|
| **C1** Ejecución de Delfi 1 sobre Snake p01 | 3 | `/snake` | capturas + `entregables/planes/snake-problem-1-plan.txt` (24 acciones) |
| **C2** Detección de anomalías / abstracción PDDL del rover | 5 | `/rover` + `/escenarios/*` | `entregables/pddl/{domain,problem-1,problem-2,problem-3}.pddl` + 3 planes generados |
| **C3** Redacción, formato y citación APA | 2 | `/reporte` | `entregables/reporte/reporte.pdf` ≤ 12 págs |

> Los escenarios alternativos `problem-2.pddl` y `problem-3.pddl` forman parte de la evidencia del C2 (capacidad de abstracción), no son un criterio independiente.

## Documentación interna

| Archivo | Contenido |
|---|---|
| [`docs/00-getting-started.md`](docs/00-getting-started.md) | Onboarding del equipo · primeros pasos |
| [`docs/01-pddl-modeling-decisions.md`](docs/01-pddl-modeling-decisions.md) | ADRs de modelado del rover |
| [`docs/GLOSSARY.md`](docs/GLOSSARY.md) | Glosario de 62 términos del proyecto |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | 15 escenarios de error con solución |
| [`docs/analisis-de-requerimientos/`](docs/analisis-de-requerimientos/) | Análisis previo del .docx del profesor: descomposición, matriz rúbrica, auditoría completa |
| [`.nxt-ai/constitution.md`](.nxt-ai/constitution.md) | Invariantes del proyecto |
| [`.nxt-ai/steering/`](.nxt-ai/steering/) | Producto, stack, estructura, design system |
| [`.nxt-ai/features/FEAT-001-portal-actividad3/feature-spec.md`](.nxt-ai/features/FEAT-001-portal-actividad3/feature-spec.md) | Spec EARS con 23 criterios |

## Pendientes conocidos

Ver `.nxt-ai/features/FEAT-001-portal-actividad3/feature-spec.md` §7 — ambigüedades por resolver con el profesor (cantidad de integrantes, individual vs equipo, capacidad del rover, fecha de entrega, etc.).

## Licencia

Trabajo académico interno del equipo. No redistribuir sin autorización.
