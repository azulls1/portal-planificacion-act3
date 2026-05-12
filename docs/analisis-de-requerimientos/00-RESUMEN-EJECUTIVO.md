# Resumen ejecutivo — Actividad 3: Portal de planificación PDDL

> Documento maestro de lectura rápida. Versiones de detalle viven en los `.md` numerados de esta misma carpeta y en `.nxt-ai/`.

## 1. Qué pide el profesor (en una línea)

Resolver un problema de planificación clásico transcribiéndolo a PDDL, ejecutándolo con el planner ganador del IPC2018 Classical Track (optimal) sobre Singularity en Linux, y entregar reporte APA + archivos PDDL + evidencia de ejecución.

## 2. Qué construiremos nosotros (la decisión del usuario)

Un **portal web** que sirva como contenedor digital del entregable, con stack:

- **Frontend**: Angular (última versión estable) + Tailwind CSS
- **Backend**: Python + Celery + Redis (cola de tareas asincrónicas para ejecución del planner)
- **Base de datos**: Supabase (Postgres + Auth + Storage)
- **Desarrollo**: local primero, luego deploy

> Decisión clave: el portal NO sustituye el trabajo de PDDL. Es la pieza de **entrega y demostración** del trabajo (reporte, archivos PDDL, capturas, planes generados, escenarios por integrante). Opcionalmente, el backend Python+Celery puede ejecutar el planner sobre Singularity en demanda.

## 3. Las tres entregas obligatorias del profesor

| # | Entregable | Cantidad | Origen |
|---|---|---|---|
| E1 | Reporte APA | 1 archivo, máx. 12 páginas | Redacción del equipo |
| E2 | `domain.pddl` | 1 archivo | Dominio común para el problema del rover |
| E3 | `problem.pddl` | **3 archivos** | Variantes del problema del rover (ver §5) |

## 4. Mapeo rúbrica → puntos posibles

| Criterio | Peso máximo | Qué medirá el profesor |
|---|---|---|
| 1. Ejecución del planner ganador IPC2018 sobre tarea Snake problema 1 | 3 pts | Singularity + Linux + plan obtenido |
| 2. Transcripción del problema del rover a PDDL y ejecución | 3 pts | Plan generado con lógica correcta |
| 3. Escenario diferente por **cada** integrante del equipo | 2 pts | N escenarios = N integrantes |
| 4. Redacción, formato y citación APA | 2 pts | Documento académico |
| **TOTAL** | **10 pts** | |

## 5. Ambigüedades detectadas — requieren clarificación

| ID | Pregunta | Por qué importa |
|---|---|---|
| Q1 | El título dice "Actividad **individual**" pero la rúbrica habla de "integrantes del equipo". ¿Es individual o de equipo? | Determina el número de escenarios alternativos a desarrollar |
| Q2 | "3 archivos `problem.pddl`" + "escenario diferente por integrante" → ¿el problema base del rover cuenta como uno de los 3, o son 3 escenarios alternativos adicionales? | Define el alcance real (1+3=4 archivos vs. 1+2=3 archivos) |
| Q3 | ¿Cuántos integrantes tiene el equipo? | Trazabilidad por integrante en criterio 3 |
| Q4 | ¿El rover tiene capacidad de carga limitada (1 mineral a la vez) o puede transportar ambos? | Modelado en PDDL del predicado `(holding)` o `(carrying ?r ?m)` |

> Mientras no se resuelvan, asumo: **trabajo en equipo de 3 integrantes**, 1 `problem-1.pddl` para el rover base + 2 `problem-{2,3}.pddl` para escenarios alternos (uno por integrante restante), capacidad = 1 mineral a la vez. Esto se ajusta a la cuenta de 3 problem.pddl. **Por favor confirmar.**

## 6. Topología del problema del rover (del Figura 1 del .docx)

```
        L1 ──┬── L3 ──→── L2
             │    │       │
             │    │       │ (unidir)
             │    ▼       ▼
             │   L4 ←─────┘
             │    │
             │    ▼ (bidir)
             │   L5 (Laboratorio)
```

- L1: tiene roca dorada (mineral_1)
- L2: tiene roca verde (mineral_2)
- L3: nodo de paso (sin contenido)
- L4: **posición inicial del rover** (según figura)
- L5: laboratorio (destino)

Aristas:
- L1 ↔ L3 (bidireccional)
- L3 → L2 (unidireccional)
- L2 → L4 (unidireccional)
- L3 ↔ L4 (bidireccional)
- L4 ↔ L5 (bidireccional)

## 7. Estructura de artefactos generados en esta carpeta

```
analisis de requerimientos/
├── mexmiart03_act3_individual.docx       ← original profesor
├── _extracted_media/image1.png           ← Figura 1 extraída
├── 00-RESUMEN-EJECUTIVO.md               ← este archivo
├── 01-descomposicion-requerimientos.md   ← parsing detallado del .docx
├── 02-matriz-rubrica-entregables.md      ← trazabilidad criterio → artefacto
├── 03-roadmap-proyecto-web.md            ← plan de implementación del portal
└── .nxt-ai/                              ← framework NXT-AI
    ├── constitution.md                    ← invariantes globales
    ├── steering/
    │   ├── product.md                     ← qué construimos y para quién
    │   ├── tech-stack.md                  ← stack pinneado
    │   └── structure.md                   ← cómo se organiza el código
    └── features/FEAT-001-portal-actividad3/
        ├── feature-spec.md                ← spec EARS de la feature principal
        └── personas.md                    ← usuarios del portal
```

## 8. Siguientes pasos sugeridos

1. **Confirma las 4 preguntas de §5** para cerrar `[NEEDS CLARIFICATION]` en specs.
2. Lee `01-descomposicion-requerimientos.md` para validar que entendí todo bien.
3. Lee `.nxt-ai/features/FEAT-001-portal-actividad3/feature-spec.md` y revisa los criterios EARS.
4. Al confirmar, generamos `plan.md` (arquitectura técnica) y empezamos a sharding por módulos.
