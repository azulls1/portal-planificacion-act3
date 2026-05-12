# Feature Spec — FEAT-001 Portal de entrega de la Actividad 3

**Tipo**: greenfield · L2 (ceremonia completa)
**Estado**: DRAFT — pendiente de aprobación del equipo
**Autor**: Strategist (delegado)
**Fecha**: 2026-05-11
**Trazabilidad**: rúbrica criterios C1-C4 del documento `mexmiart03_act3_individual.docx`

---

## 1. Resumen ejecutivo

El portal web académico es el entregable digital integrado de la Actividad 3 del curso. Aglutina los archivos PDDL del equipo, la ejecución del planner ganador del IPC2018 sobre la tarea Snake, el modelado del problema del rover, los escenarios alternativos por integrante y el reporte APA — todo navegable desde una sola URL local.

## 2. Problema que resuelve

Sin el portal, el entregable es un ZIP con un PDF + 4 archivos PDDL + carpeta de capturas. El profesor:
- Abre 5+ archivos para evaluar
- No puede re-ejecutar planes desde lo entregado
- No puede comparar escenarios fácilmente
- Pierde la oportunidad de ver código + visualización lado a lado

Con el portal:
- Una URL = un punto de entrada
- Los planes son **re-ejecutables** desde el portal (Celery+Singularity en el backend)
- Los escenarios se comparan con diffs
- El profesor puede saltar de la topología visual al código PDDL al plan generado en clicks

## 3. User stories

### US-1 — Profesor evalúa criterio 1 (Snake)

**Como** profesor evaluador,
**quiero** ver la evidencia de la ejecución de la tarea Snake problema 1 con el planner ganador del IPC2018,
**para** asignar puntos del criterio 1 de la rúbrica.

### US-2 — Profesor evalúa criterio 2 (rover base)

**Como** profesor evaluador,
**quiero** ver el modelado PDDL del problema del rover y el plan generado,
**para** asignar puntos del criterio 2.

### US-3 — Profesor evalúa criterio 3 (escenarios por integrante)

**Como** profesor evaluador,
**quiero** ver, para **cada integrante** del equipo, su escenario alternativo + descripción + plan,
**para** asignar puntos del criterio 3.

### US-4 — Profesor evalúa criterio 4 (reporte APA)

**Como** profesor evaluador,
**quiero** acceder al reporte APA en formato navegable y descargable,
**para** asignar puntos del criterio 4.

### US-5 — Integrante presenta su escenario

**Como** integrante del equipo,
**quiero** subir mi `problem-N.pddl` y descripción al portal,
**para** que aparezca en mi sección dedicada `/escenarios/<mi-nombre>`.

### US-6 — Integrante re-ejecuta un plan

**Como** integrante o profesor,
**quiero** poder re-ejecutar un escenario PDDL desde el portal,
**para** verificar que el plan es reproducible.

### US-7 — Integrante operador arranca el portal en local

**Como** integrante operador,
**quiero** arrancar todo el stack con un comando,
**para** demostrar el portal localmente al profesor sin depender de un deploy remoto.

---

## 4. Criterios de aceptación EARS

> Notación EARS: While `<estado>`, when `<evento/condición>`, the system SHALL `<comportamiento observable>`.

### AC-1 — Criterio 1 (Snake) [trazabilidad: C1 rúbrica]

**AC-1.1** — When el profesor navega a `/snake`, the system SHALL mostrar (a) instrucciones de instalación de Singularity ejecutadas, (b) capturas de pantalla de la ejecución del script, (c) el archivo del plan generado por la tarea Snake problema 1 con el planner ganador del IPC2018.

**AC-1.2** — While la captura del archivo del plan está disponible, the system SHALL exponerla como descargable directo en `/snake/plan`.

**AC-1.3** — [EARS-EXEMPT: criterio de calidad humano] El plan mostrado en `/snake/plan` corresponde a una ejecución real (no sintética). Validación alternativa: hash SHA-256 del archivo del plan referenciado en el reporte APA y verificable contra el almacenamiento de Supabase.

### AC-2 — Criterio 2 (rover base) [trazabilidad: C2 rúbrica]

**AC-2.1** — When el profesor navega a `/rover`, the system SHALL mostrar (a) el enunciado del problema, (b) la topología visual del grafo de localidades (5 nodos, 5 aristas: 3 bidireccionales y 2 unidireccionales), (c) el archivo `domain.pddl` con syntax highlight, (d) el archivo `problem-1.pddl`, (e) el plan generado, (f) un visualizador paso-a-paso del plan.

**AC-2.2** — When el plan está siendo visualizado paso a paso, the system SHALL para cada acción del plan mostrar el estado antes, la acción aplicada, y el estado después.

**AC-2.3** — While el sistema tiene acceso al backend, when el profesor presiona "Re-ejecutar", the system SHALL encolar una tarea Celery que invoque el planner sobre `domain.pddl + problem-1.pddl` y mostrar el progreso.

**AC-2.4** — When la re-ejecución termina exitosamente, the system SHALL comparar el plan recién generado con el plan persistido y mostrar si son equivalentes (mismo costo y mismas acciones, o equivalencia bajo simetrías declaradas).

**AC-2.5** — While el `domain.pddl` está cargado, the system SHALL validar que parsea correctamente y mostrar errores en línea si hay problemas de sintaxis.

### AC-3 — Criterio 3 (escenarios por integrante) [trazabilidad: C3 rúbrica]

**AC-3.1** — When el profesor navega a `/escenarios`, the system SHALL mostrar una lista con todos los integrantes del equipo, cada uno con un indicador visual de si su escenario está completo (PDDL + descripción + plan).

**AC-3.2** — When el profesor navega a `/escenarios/<integrante>`, the system SHALL mostrar (a) el nombre del integrante, (b) la descripción del escenario alternativo (cómo difiere del rover base), (c) su `problem-N.pddl`, (d) un diff visual respecto al `problem-1.pddl`, (e) el plan generado.

**AC-3.3** — While un integrante no ha subido aún su escenario, the system SHALL mostrar un placeholder explícito "Escenario pendiente" en su sub-ruta, en lugar de ocultarla.

**AC-3.4** — When un integrante autenticado sube un archivo a su sub-ruta, the system SHALL almacenarlo en Supabase Storage en el bucket `pddl-files/` con prefijo `<integrante>/` y actualizar el indicador de completitud.

**AC-3.5** — When un integrante intenta editar la sub-ruta de otro integrante, the system SHALL rechazar la operación con error 403 (RLS de Supabase).

### AC-4 — Criterio 4 (reporte APA) [trazabilidad: C4 rúbrica]

**AC-4.1** — When el profesor navega a `/reporte`, the system SHALL mostrar el reporte en PDF embebido con paginación, búsqueda y descarga.

**AC-4.2** — While el PDF está cargado, the system SHALL mostrar en paralelo la tabla de referencias APA con enlaces externos a cada fuente y exportable como `.bib`.

**AC-4.3** — When el reporte PDF supera 12 páginas, the system SHALL mostrar una advertencia visible en `/reporte` indicando incumplimiento del requisito del profesor.

**AC-4.4** — [EARS-EXEMPT: requiere validación humana de estilo] La redacción del reporte cumple normativa APA 7ª edición. Validación alternativa: checklist manual antes del merge a `main` firmada por ≥ 2 integrantes; uso de Zotero/Mendeley para referencias.

### AC-5 — Reproducibilidad y backend

**AC-5.1** — When un integrante operador ejecuta `docker compose up` en la raíz del repo, the system SHALL arrancar `frontend`, `backend`, `redis`, y `celery worker`, y exponer el portal en `http://localhost:4200`.

**AC-5.2** — When el backend recibe `POST /api/plan-runs` con `{domain_id, problem_id, planner_id}`, the system SHALL crear un registro en la tabla `plan_runs` con estado `queued`, encolar la tarea en Celery y devolver el `run_id`.

**AC-5.3** — When un worker Celery procesa una tarea de plan, the system SHALL invocar el binario Singularity con el contenedor del planner, capturar stdout/stderr y el plan resultante, y actualizar el registro en `plan_runs` con `completed` o `failed`.

**AC-5.4** — While la tarea está en ejecución, when el frontend consulta `GET /api/plan-runs/{run_id}`, the system SHALL devolver el estado actual (queued, running, completed, failed) y el progreso si disponible.

**AC-5.5** — When un plan se completa, the system SHALL almacenar (a) archivo del plan en Storage, (b) log completo de stdout/stderr en Storage, (c) hash SHA-256 del plan en la tabla `plan_runs`.

### AC-6 — Acceso y auth

**AC-6.1** — When un usuario navega al portal sin autenticarse, the system SHALL permitirle ver todo el contenido en modo lectura.

**AC-6.2** — When un integrante quiere subir o modificar contenido, the system SHALL requerir login vía Supabase Auth (email + password).

**AC-6.3** — When un usuario autenticado intenta modificar contenido fuera de su scope (otro integrante, configuración global), the system SHALL rechazar la operación vía Row Level Security.

---

## 5. Out of scope (explícitamente excluido)

- ❌ Editor PDDL online dentro del portal (los archivos se editan localmente y se suben).
- ❌ Soporte multi-tenant / multi-curso.
- ❌ Internacionalización (todo en español).
- ❌ Tests E2E exhaustivos (smoke tests sí, full E2E no).
- ❌ Deploy a producción (local-first; cloud es opcional fuera del scope inicial).
- ❌ Funcionalidad social (comentarios, likes, etc.).
- ❌ Importación de PDDL desde URL externa.
- ❌ Soporte de PDDL+, RDDL, HTN.

---

## 6. Closing checklist (12 ítems verificables)

| # | Ítem | Estado |
|---|---|---|
| 1 | Cero menciones de tecnología en US y AC excepto donde sea inherente al criterio (Singularity en C1, PDDL en C2/C3) | ✅ |
| 2 | ≥ 1 AC EARS por US | ✅ |
| 3 | Trazabilidad explícita a cada criterio de la rúbrica | ✅ |
| 4 | Personas referenciadas en `personas.md` | ✅ |
| 5 | Out of scope explícito | ✅ |
| 6 | EARS-EXEMPT solo donde hay justificación + método alternativo | ✅ (AC-1.3, AC-4.4) |
| 7 | Modos de fallo cubiertos (sin auth, intento de acceso cruzado, ejecución fallida) | ✅ (AC-3.5, AC-5.3 failed, AC-6.3) |
| 8 | Definiciones canónicas en constitución | ✅ |
| 9 | No referencia a stack en US (sí en AC técnicos donde es inherente) | ✅ |
| 10 | Hitos en `steering/product.md` consistentes | ✅ |
| 11 | Pendientes marcados como `[NEEDS CLARIFICATION]` | ✅ (ver §7) |
| 12 | Spec versionable, persistente, derivable de chat | ✅ |

---

## 7. `[NEEDS CLARIFICATION]` — RESUELTAS (2026-05-11)

| ID | Pregunta | Resolución |
|---|---|---|
| NC-1 | ¿Cuántos integrantes tiene el equipo? | ✅ **1 autor único** (trabajo individual confirmado por el usuario) |
| NC-2 | ¿"Actividad individual" aplica o es trabajo de equipo según rúbrica? | ✅ **Individual** — la rúbrica es plantilla genérica; "cada integrante" = "el autor único" |
| NC-3 | ¿El problema base del rover cuenta como uno de los "3 problem.pddl"? | ✅ **Sí**. Estructura: `problem-1.pddl` = rover base (transcripción del enunciado), `problem-2.pddl` y `problem-3.pddl` = 2 escenarios alternativos del autor |
| NC-4 | ¿Capacidad de carga del rover? | ✅ **1 mineral a la vez** (ADR-001 — más rico que ilimitada) |
| NC-5 | ¿Función de costo? | ✅ **Unitario por acción** (ADR-002 — compatible con optimal track) |
| NC-6 | ¿Fecha de entrega? | ⚠️ pendiente confirmación del autor — asumir ~3 semanas desde 2026-05-11 |
| NC-7 | ¿Restricción de formato adicional? | ✅ Solo lo que dice el .docx: reporte ≤ 12 págs APA + 1 domain.pddl + 3 problem.pddl |

### Cómo el "individual" cambia la interpretación del criterio 3

| Texto rúbrica original | Aplicado a individual |
|---|---|
| Nivel 1: solo un integrante desarrolla 1 escenario | Autor presenta 1 escenario alternativo trivial |
| Nivel 2: ≥ 2 integrantes (0.7 pts) | Autor presenta 1 escenario coherente + base |
| Nivel 3: ≥ 3 integrantes (1.4 pts) | Autor presenta 2 escenarios alternativos coherentes |
| Nivel 4: cada integrante (2 pts) | Autor presenta **2 escenarios alternativos sustantivos** con descripción y plan ejecutado, distinguibles entre sí y del base |

El autor genera 2 escenarios alternativos académicamente justificados, distintos al base y entre sí — alineado con el formato "3 archivos problem.pddl" exigido.

---

## 8. Próximos pasos en el pipeline NXT-AI

1. **`/nxt-ai.clarify`** — resolver `[NEEDS CLARIFICATION]` NC-1 a NC-7.
2. **`/nxt-ai.plan`** — Architect genera `plan.md` con stack ya pinneado, contratos OpenAPI de los endpoints del backend (`POST /api/plan-runs`, etc.), modelo Supabase, decisiones de UX.
3. **`/nxt-ai.analyze`** — gate cross-artefacto spec↔plan↔contracts.
4. **`/nxt-ai.shard`** — Sharder descompone el plan en unit-specs 1:1 con módulos. Especialmente: `pddl_validator.py`, `singularity_runner.py`, componentes Angular por feature.
5. **`/nxt-ai.impl --all`** — Builder implementa.
6. **`/nxt-ai.verify`** — Verifier blind valida invariantes.
