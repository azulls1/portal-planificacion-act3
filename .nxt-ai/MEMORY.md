# Índice de artefactos NXT-AI

## Constitución y steering

- [Constitución](constitution.md) — 10 artículos rectores · v1.0.0 · 2026-05-11
- [Steering — Producto](steering/product.md) — qué construimos · para quién · métricas
- [Steering — Stack](steering/tech-stack.md) — Angular 19+ · Tailwind v4 + Forest DS · FastAPI · Celery · Redis · Supabase · Singularity
- [Steering — Estructura](steering/structure.md) — layout del monorepo · single-writer por carpeta
- [Steering — Design System](steering/design-system.md) — Forest DS v1.0 · light-mode ONLY · paleta · mapeo a secciones del portal

## Features

- [FEAT-001 Portal Actividad 3](features/FEAT-001-portal-actividad3/feature-spec.md) — 7 US · 23 AC EARS · trazabilidad a rúbrica C1-C4
- [FEAT-001 Personas](features/FEAT-001-portal-actividad3/personas.md) — profesor · integrante · revisor · operador

## Handoffs (registro de comandos ejecutados)

- [spec-2026-05-11](handoffs/FEAT-001-portal-actividad3/spec-2026-05-11.json) — `/nxt-ai.spec` greenfield L2 · 7 NC pendientes
- [impl-scaffold-2026-05-11](handoffs/FEAT-001-portal-actividad3/impl-scaffold-2026-05-11.json) — `/nxt-ai.impl` scaffold completo · 43 archivos · 4 PDDL validados
- [verify-complete-2026-05-11](handoffs/FEAT-001-portal-actividad3/verify-complete-2026-05-11.json) — `/nxt-ai.verify` pase completo · 105 archivos · 55/55 tests · planes 14/19/20 simulados ✅

## Decisiones (ADR)

- ADR-001 — capacidad del rover = 1 mineral (documentado en `../docs/01-pddl-modeling-decisions.md`)
- ADR-002 — costo unitario por acción (documentado en `../docs/01-pddl-modeling-decisions.md`)
- ADR-003 — aristas dirigidas con `(path ?f ?t)` (documentado en `../docs/01-pddl-modeling-decisions.md`)
- ADR-004 — "mal tiempo" no se modela como literal (documentado en `../docs/01-pddl-modeling-decisions.md`)
- [ADR-005](decisions/ADR-005-design-system-forest.md) — adopción de Forest DS v1.0 vendoreado · 2026-05-11 ✅
- ADR-006 — 3 acciones del dominio: move, pickup, deliver (documentado en `../docs/01-pddl-modeling-decisions.md`)

## Documentos del proyecto

- [`../README.md`](../README.md) — quickstart del repo
- [`../docs/00-getting-started.md`](../docs/00-getting-started.md) — onboarding del equipo
- [`../docs/01-pddl-modeling-decisions.md`](../docs/01-pddl-modeling-decisions.md) — ADRs de modelado PDDL detallados
- [`../entregables/pddl/README.md`](../entregables/pddl/README.md) — cómo ejecutar el planner
