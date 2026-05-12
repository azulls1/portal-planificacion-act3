# Steering — Producto

## Naturaleza del trabajo: INDIVIDUAL ✓ (confirmado 2026-05-11)

Esta actividad es **trabajo individual** de un único autor (Adonai Samael Hernández Mata — estudiante de la maestría). La rúbrica original menciona "integrantes del equipo" porque es una plantilla genérica; aplicada al caso individual:

- "Cada integrante" → "el autor único"
- "3 archivos `problem.pddl`" → 1 base del rover + **2 escenarios alternativos diseñados por el autor**
- Criterio 3 Nivel 4 se alcanza con 2 escenarios alternativos sustantivos, distintos al base y entre sí, cada uno con descripción académica y plan ejecutado.

## Qué construimos

Un **portal web académico** que sirve como entregable digital de la Actividad 3 del curso "Razonamiento y planificación automática" de la maestría. El portal:

1. **Presenta** el reporte APA en formato navegable.
2. **Expone** los archivos PDDL (dominio + 3 problemas) con visualización syntax-highlighted.
3. **Visualiza** la topología del problema base del rover (grafo SVG L1-L5) y de los dos escenarios alternativos.
4. **Ejecuta** el planificador Delfi 1 (ganador del optimal track IPC2018) bajo demanda usando un backend Python + Celery + Redis y contenedores Singularity.
5. **Documenta** la ejecución de la tarea Snake del IPC2018 (criterio 1) con script exacto del profesor y capturas reales.
6. **Justifica** los escenarios alternativos del autor con design rationale académico (no genérico).

## Para quién

- **Audiencia primaria**: el profesor del curso, que evaluará la actividad según la rúbrica.
- **Audiencia secundaria**: el propio autor, como hub de coordinación de su trabajo.
- **Audiencia terciaria** (opcional): otros estudiantes del curso, como referencia académica.

## Por qué hacer un portal en lugar de solo un PDF

| Si solo entrego PDF + zip | Si hago el portal |
|---|---|
| Profesor abre 5+ archivos | Una URL single-entry |
| PDDL en bloque de código del PDF, poco legible | Editor Monaco con syntax highlight |
| Topología solo como imagen estática | Grafo SVG interactivo navegable |
| Plan en texto plano | Plan paso-a-paso con verificación contra estado |
| Demuestra **modelado** | Demuestra **modelado + ingeniería + verificación formal** |

El portal eleva el techo del entregable sin sacrificar el techo del reporte APA — refuerza la calidad de criterio 2 (capacidad de abstracción) y criterio 4 (estilo académico).

## Lo que el portal NO es

- ❌ No es un editor PDDL online (existen — planning.domains)
- ❌ No es un planner desde cero (usamos Delfi 1 del IPC2018 vía Singularity)
- ❌ No es un sustituto del reporte APA — el PDF sigue siendo entregable
- ❌ No es un portal multi-curso — es para esta actividad

## Autor

```yaml
autor:
  nombre: Adonai Samael Hernández Mata
  email: claude2@gruponxt.com
  rol: estudiante de maestría
  curso: Razonamiento y planificación automática
  semestre: Primer Semestre
  fecha_inicio: 2026-05-11
```

## Estado actual y métricas de éxito

| Métrica | Objetivo realista | Cómo se mide |
|---|---|---|
| Cobertura rúbrica | 9-10 / 10 con ejecución real de Singularity | Auditoría en `analisis de requerimientos/AUDITORIA-RUBRICA.md` |
| Reporte APA | ≤ 12 págs, ≥ 8 referencias APA verificadas | Manual + revisión cruzada propia |
| Planes ejecutables | 4 (1 Snake + 3 rover: base + 2 alternativos) | `pytest tests/test_real_pddl_files.py` |
| Escenarios diseñados por el autor | 2 distintos al base + base = 3 problem.pddl | conteo en `entregables/pddl/` |
| Portal arranca en local | < 5 min desde clone | `npm install && npm start` |

## Hitos del proyecto

| Hito | Fecha objetivo | Entregable |
|---|---|---|
| H0 — Modelado PDDL completo | 2026-05-11 | `domain.pddl` + `problem-{1,2,3}.pddl` con planes simulados ✅ |
| H1 — VPS Linux con Singularity instalado | semana 1 | `singularity --version` ejecutable |
| H2 — Delfi 1 construido (`planner.img`) | semana 1 | imagen .img lista (15-30 min build) |
| H3 — Snake p01 ejecutado con plan obtenido | semana 1 | captura del plan + log |
| H4 — Los 3 rover problems ejecutados con Delfi 1 | semana 2 | 3 archivos `sas_plan` reales |
| H5 — Capturas de pantalla por criterio | semana 2 | `entregables/capturas/c*.png` |
| H6 — Reporte APA completo (12 págs PDF) | semana 3 | `entregables/reporte/reporte.pdf` |
| H7 — Revisión final cruzada del reporte | semana 3 | checklist firmado |
| H8 — Entrega al profesor | semana 4 | reporte + PDDL + portal (link/zip) |
