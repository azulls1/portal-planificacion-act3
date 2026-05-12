# Constitución del proyecto — Portal de Planificación PDDL (Actividad 3)

> Documento de invariantes globales del proyecto. Producido por el rol **Constitutionalist** (greenfield mode).
> Estos principios son no-negociables salvo modificación explícita registrada en `decisions/`.

**Proyecto**: `portal-actividad3-planificacion`
**Versión constitución**: 1.0.0
**Fecha**: 2026-05-11
**Curso**: Razonamiento y planificación automática — Primer semestre, Maestría

---

## I. Naturaleza del proyecto

Este proyecto es un **portal web académico** que sirve como contenedor digital de los entregables de la Actividad 3 del curso. El portal **no sustituye** el trabajo de modelado y ejecución PDDL; lo **demuestra, organiza y presenta** de forma navegable.

**Doble producto del proyecto**:

1. **Producto académico** (lo que califica el profesor): reporte APA + archivos PDDL + capturas de ejecución.
2. **Producto técnico** (lo que practica al equipo): portal web full-stack con cola asíncrona para ejecutar planificadores PDDL bajo demanda.

Ambos deben coexistir sin que uno comprometa al otro.

---

## II. Principios rectores (Articulos)

### Artículo 1 — Trazabilidad rúbrica → artefacto

Toda parte del portal o del entregable físico debe ser trazable a uno o más criterios de la rúbrica del profesor. No se construyen features que no aporten a un criterio o que sean lujos visuales.

**Aplicación**: cada commit/feature lleva en su mensaje la etiqueta `criterio: C1|C2|C3|C4|infra|docs`.

### Artículo 2 — Reproducibilidad PDDL

Todo plan presentado debe ser **regenerable desde cero**:
- Archivo `domain.pddl` versionado
- Archivo `problem-N.pddl` versionado
- Comando exacto usado para invocar el planner (en `README` del portal)
- Versión del planner y su SHA del contenedor Singularity

**Aplicación**: el portal expone un endpoint que permite re-ejecutar cualquier escenario y comparar el plan resultante con el plan guardado.

### Artículo 3 — Honestidad sobre el entorno

Si Singularity no puede instalarse nativamente, se documenta el fallback (editor online de PDDL) con honestidad técnica en el reporte. **No se simula la ejecución**; se reporta lo que efectivamente se ejecutó.

**Aplicación**: el reporte tiene una sección obligatoria "Entorno de ejecución utilizado" donde se documenta el camino real seguido.

### Artículo 4 — APA es obligatorio, no aspiracional

Todo texto académico (reporte, descripciones, glosario en el portal) cita en formato APA 7ª edición. Las referencias se gestionan centralmente (Zotero/Mendeley).

**Aplicación**: el portal tiene un endpoint `/referencias` que lista todas las fuentes citadas y permite descargar la lista en formato `.bib`.

### Artículo 5 — El portal es local-first

El portal debe arrancar completamente en local con un único comando (`docker compose up` o equivalente). Deploy a la nube es opcional y se trata como una etapa posterior, no como prerrequisito de entrega.

**Aplicación**: si el profesor evalúa el portal, lo hace desde un fork local. La URL de producción no es entregable.

### Artículo 6 — Stack pinneado

El stack tecnológico está fijo y se documenta en `steering/tech-stack.md`. Cambios al stack requieren un ADR en `.nxt-ai/decisions/`.

Stack actual:
- **Frontend**: Angular 19+ + Tailwind CSS v4 + **Forest Design System v1.0** (vendoreado)
- **Backend**: Python 3.11+ + FastAPI + Celery + Redis
- **DB / Auth / Storage**: Supabase (Postgres)
- **Planificador**: el ganador del IPC2018 optimal track, distribuido vía Singularity

### Artículo 6.1 — Sistema de diseño canónico

El Forest Design System v1.0 es la única fuente de verdad de UI. Sus reglas (light-mode ONLY, paleta forest, mínimo `text-xs`, SVG inline, fondo `bg-gray-50`) son heredadas como invariantes de este proyecto. Detalle en `steering/design-system.md`.

**Prohibido**: dark mode, otras librerías de UI (Material, PrimeNG, etc.), colores hex literales fuera del DS, fuentes menores a 12px, iconos como entidades HTML.

### Artículo 7 — Responsabilidad por integrante

Cada integrante del equipo es **dueño técnico** de su escenario PDDL alternativo y de la sub-ruta del portal que lo presenta (`/escenarios/<su-nombre>`). El integrante:
- Modela su `problem-N.pddl`
- Verifica que ejecuta
- Redacta su sección del reporte APA
- Aprueba el merge de su sub-ruta

**Aplicación**: el sistema de CODEOWNERS o equivalente refleja esto.

### Artículo 8 — Documentación obligatoria del modelado

El archivo `domain.pddl` debe estar comentado **dentro del archivo** (comentarios `;`) y además documentado en el reporte. Las decisiones de modelado relevantes (capacidad del rover, semántica de aristas, función de costo) son ADRs registradas.

**Decisiones de modelado conocidas a registrar**:
- ADR-001: capacidad del rover (¿1 mineral a la vez o ilimitada?)
- ADR-002: función de costo (¿unitario por acción o ponderado por distancia?)
- ADR-003: representación de aristas dirigidas (¿predicado `connected ?a ?b` con dos átomos para bidireccionales, o predicado simétrico explícito?)
- ADR-004: ¿se modela el "mal tiempo" como literal en estado inicial o se ignora?

### Artículo 9 — Tests = validación de planes, no de UI

La inversión en tests automatizados se concentra en validar que los planes generados cumplen las precondiciones del dominio (regresión semántica). Tests de UI son opcionales y se limitan a smoke (que el portal arranque).

**Aplicación**: cada `problem-N.pddl` tiene un test asociado que ejecuta el planner y verifica que el plan resultante (a) no es vacío y (b) cada acción del plan tenía sus precondiciones satisfechas en el estado correspondiente.

### Artículo 10 — Cero contenido sintético

Los planes mostrados en el portal son planes **reales** generados por el planner, no escritos a mano para "verse bien". Si un plan no se genera, se muestra el mensaje de error del planner, no un plan ficticio.

**Aplicación**: el portal almacena el log de ejecución completo del planner junto al plan; ambos versionados juntos.

---

## III. Restricciones del profesor (heredadas, no negociables)

| ID | Restricción | Fuente |
|---|---|---|
| P1 | Singularity sobre Linux para Snake | docx ¶19 |
| P2 | Planner ganador del IPC2018 optimal track | docx ¶25 |
| P3 | Reporte máx 12 páginas | docx ¶46 |
| P4 | 1 `domain.pddl` + 3 `problem.pddl` | docx ¶46 |
| P5 | APA obligatorio | rúbrica criterio 4 |
| P6 | Cada integrante un escenario distinto | rúbrica criterio 3 |

---

## IV. Definiciones canónicas

- **Plan válido**: secuencia de acciones donde, para cada acción `a_i` y estado `s_i`, las precondiciones de `a_i` se satisfacen en `s_i`, y `s_{i+1} = apply(a_i, s_i)`. El estado final satisface el objetivo.
- **Plan óptimo**: plan válido de costo mínimo bajo la función de costo declarada en el dominio.
- **Escenario distinto**: instancia `problem-N.pddl` que difiere del problema base del rover en al menos uno de: (a) número de minerales, (b) número de localidades, (c) topología de aristas, (d) presencia de laboratorios adicionales, (e) restricciones temporales (si aplica).
- **Integrante del equipo**: persona física registrada en `steering/product.md` como contribuidor, con commits firmados y sección dedicada en el portal.

---

## V. Workflow de cambios a esta constitución

1. Identificar el artículo a modificar
2. Crear `decisions/ADR-NNN-modificacion-constitucion.md` con motivo y propuesta
3. Aprobación: ≥ 2 integrantes del equipo
4. Actualizar este archivo y bumpear versión semver
5. Registrar el ADR en `MEMORY.md` interna del equipo

---

## VI. Estado de cumplimiento — instantánea inicial

| Artículo | Estado | Observación |
|---|---|---|
| I.1 Naturaleza dual | ✅ | Captado en `steering/product.md` |
| II.1 Trazabilidad | 🟡 | Pendiente: convención de commit messages |
| II.2 Reproducibilidad | 🟡 | Pendiente: implementar endpoint de re-ejecución |
| II.3 Honestidad entorno | ✅ | Documentado |
| II.4 APA | 🟡 | Pendiente: elegir gestor de referencias |
| II.5 Local-first | ✅ | Compose / dev script |
| II.6 Stack pinneado | ✅ | `steering/tech-stack.md` |
| II.7 Responsabilidad | 🔴 | **BLOQUEADOR**: requiere lista de integrantes confirmada |
| II.8 Documentación PDDL | 🟡 | Pendiente: redactar ADR-001 a 004 |
| II.9 Tests de planes | 🟡 | Pendiente: framework de validación de planes |
| II.10 Cero sintético | ✅ | Documentado |
