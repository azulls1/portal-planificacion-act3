# Glosario

Términos técnicos usados en el proyecto. Pensado como referencia rápida tanto para integrantes nuevos como para el profesor que revisa el portal.

## Planificación clásica

| Término | Definición |
|---|---|
| **Planificación automática** | Subcampo de la IA que estudia algoritmos que generan secuencias de acciones (planes) para llevar a un agente desde un estado inicial hasta un estado-meta. |
| **Planificación clásica** | Variante con estado totalmente observable, determinista, estática, discreta, finita y con un único agente. |
| **Dominio** | Estructura abstracta del problema: tipos, predicados disponibles, esquema de acciones. Independiente de la instancia. |
| **Problema (instancia)** | Concreción del dominio: objetos específicos, estado inicial, meta. |
| **Estado** | Conjunto de literales (átomos sin variables libres) ciertos en un instante. |
| **Acción** | Operador con precondiciones (lo que debe ser cierto antes) y efectos (lo que cambia). |
| **Precondición** | Conjunto de literales que deben ser ciertos para que una acción pueda aplicarse. |
| **Efecto** | Conjunto de literales que pasan a ser ciertos (efectos positivos) o falsos (efectos negativos) tras aplicar una acción. |
| **Plan** | Secuencia ordenada de acciones que lleva del estado inicial a un estado que satisface la meta. |
| **Plan válido** | Plan donde cada acción cumple sus precondiciones en el estado correspondiente. |
| **Plan óptimo** | Plan válido de costo mínimo bajo la métrica declarada. |

## PDDL

| Término | Definición |
|---|---|
| **PDDL** | *Planning Domain Definition Language*. Estándar declarativo introducido por McDermott et al. (1998) para describir dominios y problemas. |
| **`(:types)`** | Sección del dominio que declara la jerarquía de tipos (objetos del mundo). |
| **`(:predicates)`** | Sección que declara las relaciones (predicados) que pueden ser ciertas o falsas. |
| **`(:action)`** | Esquema de acción parametrizado con `:precondition` y `:effect`. |
| **`(:objects)`** | En el problema, lista de objetos concretos tipados. |
| **`(:init)`** | En el problema, conjunto inicial de literales ciertos. |
| **`(:goal)`** | En el problema, fórmula que debe satisfacerse al final. |
| **`(:metric)`** | Función a optimizar (típicamente `minimize total-cost`). |
| **`:typing`** | Requisito que habilita el uso de tipos. |
| **`:action-costs`** | Requisito que habilita costos numéricos por acción mediante la función `total-cost`. |
| **PDDL2.1+** | Extensiones temporales y numéricas (Fox & Long, 2003). No usadas en este trabajo. |

## Competencia y planificadores

| Término | Definición |
|---|---|
| **IPC** | *International Planning Competition*. Evento bianual donde se evalúan planners sobre dominios y problemas estandarizados. |
| **Classical Track** | Sub-competencia centrada en planificación clásica (sin tiempo, sin números). |
| **Optimal track** | Variante que exige planes de costo mínimo. Los planners se desempatan por costo y tiempo. |
| **Satisficing track** | Variante que premia velocidad de obtener cualquier plan válido. |
| **Delfi** | Portafolio de planners ganador del optimal track del IPC2018 (Katz et al., 2018). |
| **Fast Downward** | Sistema de planificación clásica de referencia (Helmert, 2006). |

## Contenedores

| Término | Definición |
|---|---|
| **Singularity / Apptainer** | Runtime de contenedores diseñado para HPC. Permite ejecutar imágenes `.sif` sin privilegios root en runtime. |
| **`.sif`** | *Singularity Image Format*. Archivo único e inmutable que empaqueta un planner con sus dependencias. |
| **WSL2** | Subsistema de Linux en Windows. Permite correr Ubuntu con kernel real, suficiente para Singularity en la mayoría de casos. |

## Stack del portal

| Término | Definición |
|---|---|
| **Angular standalone** | API moderna de Angular 14+ donde los componentes no necesitan declararse en `NgModule`. |
| **Signals** | Primitiva reactiva de Angular 16+. Reemplaza progresivamente a RxJS para estado local de componentes. |
| **Tailwind CSS v4** | Versión mayor de Tailwind con `@theme` overrides en lugar de `tailwind.config.js`. |
| **Forest Design System** | Sistema de diseño interno (light-mode only, paleta verdes bosque) usado en el portal. |
| **FastAPI** | Framework Python async con OpenAPI automático y validación Pydantic. |
| **Celery** | Sistema de cola de tareas distribuido para Python. Usado para ejecuciones largas del planner. |
| **Redis** | Almacén clave-valor en memoria. Aquí actúa como broker y backend de resultados de Celery. |
| **Supabase** | Backend-as-a-service basado en Postgres. Incluye Auth y Storage. Opcional. |

## Framework NXT-AI

| Término | Definición |
|---|---|
| **EARS** | *Easy Approach to Requirements Syntax*. Notación "While X, when Y, the system SHALL Z". |
| **EARS-EXEMPT** | Etiqueta para criterios que no pueden expresarse mecánicamente; requieren método de validación alternativo. |
| **ADR** | *Architecture Decision Record*. Decisión arquitectónica documentada con contexto y consecuencias. |
| **Handoff** | JSON estructurado que pasa contexto determinista entre comandos del framework. |
| **Drift detection** | Comparación SHA-256 entre código actual y unit-spec previa. Bloquea merge si divergen. |
| **Single-writer** | Patrón donde cada carpeta tiene un único rol/agente responsable de su escritura. |

## Rúbrica del profesor

| Término | Definición |
|---|---|
| **Criterio 1** | Ejecución del planner ganador del IPC2018 (optimal track) sobre tarea Snake problema 1. Máx 3 pts. |
| **Criterio 2** | Transcripción del problema del rover a PDDL y ejecución exitosa. Máx 3 pts. |
| **Criterio 3** | Escenario diferente al base por cada integrante del equipo. Máx 2 pts. |
| **Criterio 4** | Redacción, formato y citación APA. Máx 2 pts. |

## APA 7

| Término | Definición |
|---|---|
| **APA 7** | 7ª edición del estilo APA, publicado en 2019. Estándar académico en ciencias sociales y educación. |
| **Sangría francesa** | Primera línea sin sangría, líneas siguientes con sangría. Estilo usado en la lista de referencias. |
| **Cita en texto** | `(Autor, Año, p. X)` para citas directas; `(Autor, Año)` para paráfrasis. |
