# Steering — Producto

## Qué construimos

Un **portal web académico** que sirve como entregable digital de la Actividad 3 del curso "Razonamiento y planificación automática" de la maestría. El portal:

1. **Presenta** el reporte APA en formato navegable.
2. **Expone** los archivos PDDL (dominio + problemas) con visualización syntax-highlighted.
3. **Visualiza** las topologías de los problemas de planificación (grafos de localidades, minerales, laboratorios).
4. **Ejecuta** los planificadores PDDL bajo demanda usando un backend Python con cola Celery+Redis y contenedores Singularity (donde sea viable).
5. **Documenta** la ejecución de la tarea Snake del IPC2018 (criterio 1 de la rúbrica).
6. **Organiza** los escenarios alternativos de cada integrante del equipo.

## Para quién

- **Audiencia primaria**: el profesor del curso, que evaluará la actividad según la rúbrica.
- **Audiencia secundaria**: los integrantes del equipo, que usarán el portal como hub de coordinación.
- **Audiencia terciaria** (opcional): otros estudiantes del curso que vean el portal como referencia.

## Por qué hacer un portal en lugar de solo un PDF

| Si solo entregamos PDF + zip | Si hacemos el portal |
|---|---|
| Profesor abre 5+ archivos | Una URL/carpeta single-entry |
| PDDL en bloque de código del PDF, poco legible | Monaco editor con highlight |
| Topología solo como imagen estática | Grafos interactivos navegables |
| Plan en texto plano | Plan paso-a-paso con visualización del estado |
| Cada integrante un anexo | Cada integrante tiene su sub-ruta |
| Demuestra **modelado** | Demuestra **modelado + ingeniería** |

El portal eleva el techo del entregable sin sacrificar el techo del reporte APA.

## Lo que el portal NO es

- ❌ No es un editor PDDL online (existen — planning.domains)
- ❌ No es un planner desde cero (usamos el del IPC2018 vía Singularity)
- ❌ No es un sustituto del reporte APA — el PDF sigue siendo entregable
- ❌ No es un portal multi-tenant ni multi-curso — es para esta actividad

## Estado actual y métricas de éxito

| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Cobertura rúbrica | 9.4 / 10 (realista) | Suma de niveles alcanzados |
| Reporte APA | ≤ 12 págs, ≥ 5 referencias verificadas | Conteo manual + Zotero check |
| Planes ejecutables | 4 (1 Snake + 1 rover base + ≥ 2 alternos) | Test runner del repo |
| Integrantes con escenario | 100% del equipo | Listado en `/escenarios` del portal |
| Portal arranca en local | < 5 minutos desde clone | Tiempo medido en máquina limpia |

## Lista de integrantes del equipo

> **PENDIENTE DE LLENAR** — bloqueador para Artículo 7 de la constitución.

```yaml
team:
  - name: "[NEEDS CLARIFICATION: integrante 1]"
    role: "líder de infraestructura | modelado | redacción | escenarios"
    github: "@..."
    scenario: "problem-N.pddl"
    portal_slug: "/escenarios/..."
  - name: "[NEEDS CLARIFICATION: integrante 2]"
    ...
```

## Hitos del proyecto

| Hito | Fecha objetivo | Entregable |
|---|---|---|
| H0 — Constitución y spec aprobadas | semana 0 | `constitution.md`, `feature-spec.md` |
| H1 — Singularity instalado + Snake plan obtenido | semana 1 | captura plan Snake (criterio 1) |
| H2 — `domain.pddl` + `problem-1.pddl` del rover ejecutándose | semana 2 | plan rover (criterio 2) |
| H3 — Escenarios alternos de cada integrante | semana 3 | `problem-2.pddl`, `problem-3.pddl` (criterio 3) |
| H4 — Portal web local funcional con todo arriba | semana 4 | portal navegable |
| H5 — Reporte APA finalizado, máx 12 págs | semana 4 | PDF entregable (criterio 4) |
| H6 — Entrega | (fecha del profesor) | reporte + PDDL + portal |
