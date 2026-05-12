# Personas — FEAT-001 Portal Actividad 3

## P1 — El profesor evaluador

| Atributo | Detalle |
|---|---|
| Rol | Profesor del curso "Razonamiento y planificación automática" |
| Objetivo | Evaluar la actividad según los 4 criterios de la rúbrica |
| Contexto técnico | Sabe PDDL, conoce IPC, sabe usar Linux y Singularity |
| Cómo accede al portal | Recibe URL local o ZIP del repo del equipo |
| Tiempo disponible para evaluar | ~30 minutos por equipo |
| Lo que prioriza | (a) que el plan exista y sea válido · (b) que la documentación APA esté correcta · (c) que cada integrante haya aportado un escenario |
| Lo que penaliza | (a) PDDL sin ejecutar · (b) APA mal hecho · (c) escenarios faltantes · (d) coloquialidad |
| Frase clave | "Quiero ver el plan, no las promesas." |

**Implicación para el portal**: vista `/` (home) debe permitir al profesor llegar a las **4 piezas de evidencia clave** (plan Snake, plan rover base, planes por integrante, reporte PDF) en ≤ 2 clics cada una.

---

## P2 — El integrante del equipo (autor)

| Atributo | Detalle |
|---|---|
| Rol | Estudiante de la maestría |
| Objetivo | Aportar su escenario PDDL + sección del reporte + código del portal |
| Contexto técnico | Variable: algunos saben Angular, otros saben más backend, todos pueden modelar PDDL |
| Cómo accede al portal | Localmente para desarrollar; con login para subir artefactos |
| Tiempo invertido | ~10-20 horas durante el ciclo de la actividad |
| Lo que prioriza | (a) que su escenario quede bien presentado · (b) entregar a tiempo · (c) que su trabajo individual sea visible |
| Lo que penaliza | (a) bloqueos por trabajo de otros · (b) onboarding difícil · (c) ambigüedad de responsabilidades |
| Frase clave | "Dime exactamente qué archivo me toca y con qué contrato." |

**Implicación para el portal**: cada integrante tiene **una ruta** `/escenarios/<su-nombre>` que es **suya** y un único `problem-N.pddl` que es **suyo**. No hay zonas ambiguas.

---

## P3 — El revisor externo (otros estudiantes, futuros lectores)

| Atributo | Detalle |
|---|---|
| Rol | Estudiante de otro equipo o lector posterior del repo |
| Objetivo | Entender la solución y eventualmente referenciarla |
| Contexto técnico | Aprendiendo PDDL; puede no conocer Singularity |
| Cómo accede al portal | URL pública (si se publica) o repo público |
| Tiempo invertido | 10-15 min de lectura inicial |
| Lo que prioriza | Claridad pedagógica del modelo PDDL y la justificación de decisiones |
| Lo que penaliza | Reporte sin contexto, código PDDL sin comentarios |

**Implicación para el portal**: el `/rover` debe tener una sub-sección "Decisiones de modelado" que cite los ADRs.

---

## P4 — El integrante operador (quien arranca el portal)

| Atributo | Detalle |
|---|---|
| Rol | El integrante que ejecuta el portal localmente para demos / entregas |
| Objetivo | Arrancar todo el stack en local sin fricción |
| Contexto técnico | Debe tener Docker, Python, Node, y opcionalmente Singularity en WSL |
| Tiempo invertido | 5 minutos de arranque |
| Lo que prioriza | `docker compose up` y todo arriba |
| Lo que penaliza | Dependencias faltantes, errores cripticos, configuración manual |

**Implicación para el portal**: README de raíz con sección "Quickstart" de 5 pasos máximo + `.env.example` completo.

---

## Anti-personas (deliberadamente excluidas)

- ❌ Usuario público anónimo sin contexto académico (el portal no es un producto SaaS).
- ❌ Otros profesores fuera del curso (no diseñamos para multi-curso).
- ❌ Bots / scrapers (no necesitamos SEO).
