# Descomposición de requerimientos — `mexmiart03_act3_individual.docx`

Parsing detallado del documento del profesor, separado por categoría. Cada ítem trazable de vuelta a un párrafo del .docx.

---

## A. Objetivo de la actividad

> "Conocer las herramientas que dan solución a un problema de planificación. Para ello es importante tener presente la definición del problema de planificación, conocimiento de herramientas de desarrollo en contenedores, ejecución de software alojado en contenedores, abstracción de problemas y descripción de problemas en lenguaje PDDL." (¶5)

**Competencias evaluadas**:
1. Definición de problemas de planificación
2. Uso de contenedores (**Singularity**)
3. Ejecución de software contenedorizado
4. Abstracción / modelado de problemas
5. Descripción formal en **PDDL** (Planning Domain Definition Language)

---

## B. Proceso paso a paso (lo que debemos hacer)

### B.1 — Investigación y preparación

| # | Paso | Fuente |
|---|---|---|
| B.1.1 | Revisar la página de ICAPS Competitions | https://www.icaps-conference.org/competitions/ |
| B.1.2 | Acceder a IPC2018 → Classical Tracks | https://ipc2018-classical.bitbucket.io/ |
| B.1.3 | Revisar secciones de la página, en especial: `DETAILS ON SINGULARITY`, `PDDL Fragment`, `Domains`, `Planners (optimal track)`, `Results (presentation slides)` | (en IPC2018 site) |
| B.1.4 | Identificar al **equipo ganador del optimal track** leyendo los slides de Results | (slides IPC2018) |

### B.2 — Instalación de Singularity

| # | Paso | Restricción |
|---|---|---|
| B.2.1 | Instalar Singularity en algún Linux | https://docs.sylabs.io/guides/3.5/admin-guide/installation.html |
| B.2.2 | Opciones de entorno permitidas | Linux nativo · VM con Ubuntu (recomendado) · WSL Ubuntu en Windows |
| B.2.3 | Preferencia explícita | "Si el alumno tiene una máquina con Linux de forma nativa, debe instalar Singularity y, con ello, aprovechar los máximos recursos posibles." |

### B.3 — Ejecución de la tarea Snake (problema 1)

| # | Paso | Detalle |
|---|---|---|
| B.3.1 | Acceder a los archivos PDDL de la **tarea Snake** del IPC2018 | (en la sección Domains) |
| B.3.2 | Ejecutar el **problema 1** siguiendo el script de la sección `DETAILS ON SINGULARITY → How can I test my containers?` | Realizar cambios necesarios para que ejecute |
| B.3.3 | Usar el **planner ganador** del optimal track | (a identificar en B.1.4) |
| B.3.4 | Documentar con capturas de pantalla | terminal ejecutando el script + archivo del plan resultante |

### B.4 — Transcripción del problema del rover a PDDL

**Enunciado textual** (¶31, ¶33):

> Se tiene un robot tipo rover que previamente realizó la excavación de dos rocas localizadas en la localidad 1 y localidad 2. Debido al mal tiempo, no fue posible trasladar las rocas para su análisis. Es por ello por lo que se solicita generar el plan que debe seguir el robot para llevar los minerales al laboratorio de análisis.
>
> Debido al terreno, hay restricciones en la trayectoria: de la localidad 3 a la 1, el camino está libre y existe bidireccionalidad; de la localidad 3 a la 2, el camino solo es de una dirección; de la localidad 2 a la 4 es solo una dirección; de la localidad 3 a 4 y de 4 a 5, el camino es bidireccional.

**Topología extraída (Figura 1)**:

| Nodo | Contenido | Rol |
|---|---|---|
| L1 | roca dorada (mineral_1) | origen |
| L2 | roca verde (mineral_2) | origen |
| L3 | — | nodo de paso |
| L4 | (posición inicial del rover) | tránsito |
| L5 | laboratorio | destino (goal) |

**Aristas del grafo**:

| Arista | Dirección | Costo |
|---|---|---|
| L1 ↔ L3 | bidireccional | 1 |
| L3 → L2 | unidireccional | 1 |
| L2 → L4 | unidireccional | 1 |
| L3 ↔ L4 | bidireccional | 1 |
| L4 ↔ L5 | bidireccional | 1 |

**Tareas concretas**:

| # | Paso |
|---|---|
| B.4.1 | Examinar `domain.pddl` y `problem-1.pddl` de la tarea Snake (referencia de estructura) |
| B.4.2 | Modelar `domain.pddl` propio (rover): tipos, predicados, acciones |
| B.4.3 | Modelar `problem-1.pddl` para el escenario base del rover (2 minerales en L1 y L2 → laboratorio en L5) |
| B.4.4 | Ejecutar `domain.pddl + problem-1.pddl` con el planner ganador → guardar plan |
| B.4.5 | Documentar con capturas (código + ejecución + plan) |

### B.5 — Escenarios alternativos por integrante

| # | Paso | Detalle |
|---|---|---|
| B.5.1 | **Cada integrante** del equipo propone un escenario distinto al original | Variantes posibles: más minerales · más localidades · más restricciones de camino · laboratorio extra |
| B.5.2 | Cada integrante transcribe su escenario en `problem-N.pddl` reutilizando el mismo `domain.pddl` | A menos que la variante requiera nuevas acciones / predicados |
| B.5.3 | Ejecutar cada `problem-N.pddl` con el planner ganador | Capturar plan generado |
| B.5.4 | Documentar | Cada integrante describe su escenario en el reporte |

> **AMBIGÜEDAD**: ¿Cada integrante genera **un** problem.pddl adicional, o el problema rover base **cuenta** como problem-1.pddl y los demás integrantes generan problem-2, problem-3...?
>
> El enunciado total dice "3 archivos problem.pddl". Esto sugiere equipo de 3 con 1 escenario cada uno (incluyendo posiblemente el rover base como uno de ellos), o equipo de 2-4 según interpretación.

---

## C. Entregables

### C.1 Reporte (¶46)

| Aspecto | Restricción |
|---|---|
| Formato | APA (criterio 4 de la rúbrica) |
| Extensión | Máximo 12 páginas |
| Idioma | Español académico (inferido del contexto del curso) |
| Contenido mínimo (inferido de la rúbrica) | (a) instalación Singularity · (b) ejecución Snake con capturas · (c) PDDL del rover comentado · (d) plan generado del rover · (e) escenario por integrante + plan · (f) referencias APA |

### C.2 Archivos PDDL

| Tipo | Cantidad | Notas |
|---|---|---|
| `domain.pddl` | 1 | Dominio común reutilizable para todos los problemas |
| `problem.pddl` | 3 | Variantes del problema (rover base + escenarios alternos) |

### C.3 Capturas de pantalla (implícito en rúbrica)

| Tipo de captura | Para qué criterio |
|---|---|
| Terminal ejecutando el script de Singularity para Snake | Criterio 1 |
| Archivo del plan generado por Snake | Criterio 1 nivel 4 |
| Terminal con la ejecución del planner para el rover | Criterio 2 |
| Plan generado para el rover | Criterio 2 nivel 4 |
| Plan generado para cada escenario alternativo | Criterio 3 |

---

## D. Restricciones técnicas y operativas

| ID | Restricción | Origen |
|---|---|---|
| R1 | Stack obligatorio del entregable computacional: Singularity sobre Linux | ¶19, ¶23 |
| R2 | Planner: **el ganador del IPC2018 optimal track** (no cualquier planner) | ¶25 |
| R3 | Lenguaje: PDDL (no PDDL+, no RDDL, no HTN salvo que se justifique) | ¶29 |
| R4 | Reporte: máximo 12 páginas | ¶46 |
| R5 | Citación: normativa **APA** | Criterio 4 |
| R6 | Si no se logra Singularity nativo: aceptable usar editor en línea / herramientas para desarrollar y ejecutar PDDL (nivel 2 suficiente) | Criterio 1 nivel 2 |
| R7 | Si Singularity cicla por recursos: presentar capturas demostrando comprensión técnica (nivel 3 adecuado) | Criterio 1 nivel 3 |

---

## E. Definiciones operativas

- **Planificación clásica**: problema con estado inicial, conjunto de acciones, función de transición determinista y conjunto de metas, donde se busca una secuencia de acciones (plan) que lleve del estado inicial a un estado-meta.
- **PDDL**: lenguaje declarativo estándar de la comunidad ICAPS para describir dominios (`domain.pddl`) y problemas (`problem.pddl`).
- **Singularity** (hoy Apptainer): runtime de contenedores HPC, usado por IPC2018 para distribuir planners reproducibles.
- **Optimal track**: en IPC, los planners obligados a devolver el plan de costo mínimo (vs. satisficing, que devuelve cualquier plan válido lo más rápido posible).

---

## F. Mapa de riesgos detectados

| ID | Riesgo | Mitigación propuesta |
|---|---|---|
| RSK-1 | Instalar Singularity en WSL falla por kernel features | Fallback a VM Ubuntu en VirtualBox / Hyper-V |
| RSK-2 | El planner ganador del optimal track de IPC2018 no logra resolver Snake-problem-1 por timeout / memoria | Documentar el ciclado con capturas (nivel 3 = 2 pts es aceptable) |
| RSK-3 | El reporte excede 12 páginas | Mover apéndices (códigos PDDL completos) al portal web; en el PDF solo extractos clave |
| RSK-4 | Ambigüedad de "individual" vs "equipo" | Resolver con el profesor antes de empezar (Q1 en `00-RESUMEN-EJECUTIVO.md` §5) |
| RSK-5 | El dominio modelado no captura "rover lleva 1 mineral a la vez" → plan trivial sin replanificar | Decidir explícitamente capacity model y documentarlo en el reporte |

---

## G. Estado de cobertura del documento del profesor

| Sección original (.docx) | Mapeada a |
|---|---|
| Título | (informativo) |
| Objetivos (¶5) | §A |
| Descripción de la actividad pasos 1-9 | §B.1 a §B.5 |
| Enunciado del rover (¶31, ¶33) + Figura 1 | §B.4 + topología en §B.4 |
| Bullets de ejecución y escenario (¶38-¶42) | §B.4.4 + §B.5 |
| Extensión y formato (¶44-¶46) | §C |
| Rúbrica (4 criterios) | §C + matriz en `02-matriz-rubrica-entregables.md` |

**Cobertura**: 100% del documento del profesor está mapeado.
