# Personas — FEAT-001 Portal Actividad 3 (trabajo individual)

## P1 — El profesor evaluador

| Atributo | Detalle |
|---|---|
| Rol | Profesor del curso "Razonamiento y planificación automática" |
| Objetivo | Evaluar la actividad según los 4 criterios de la rúbrica |
| Contexto técnico | Sabe PDDL, conoce IPC, sabe usar Linux y Singularity |
| Cómo accede al portal | Recibe URL local o ZIP del repo |
| Tiempo disponible para evaluar | ~30 minutos máximo |
| Lo que prioriza | (a) que el plan exista y sea válido · (b) que la documentación APA esté correcta · (c) que el autor haya generado al menos un escenario alternativo coherente |
| Lo que penaliza | (a) PDDL sin ejecutar · (b) APA mal hecho · (c) escenarios triviales · (d) coloquialidad |
| Frase clave | "Quiero ver el plan, no las promesas." |

**Implicación para el portal**: vista `/` (home) debe permitir al profesor llegar a las **4 piezas de evidencia clave** (plan Snake, plan rover base, planes alternativos, reporte PDF) en ≤ 2 clicks cada una.

---

## P2 — El autor (único)

| Atributo | Detalle |
|---|---|
| Rol | Estudiante de la maestría — autor único de la actividad |
| Objetivo | Demostrar competencia en PDDL, Singularity y modelado de problemas; obtener Nivel 4 en los 4 criterios |
| Contexto técnico | Conoce Python, familiarizado con Linux; PDDL es área a aprender |
| Cómo accede al portal | Localmente para desarrollar; producción opcional |
| Tiempo invertido total | ~25 horas a lo largo de 3-4 semanas |
| Lo que prioriza | (a) tener un workflow reproducible · (b) capturar evidencia mientras trabaja · (c) sustento académico para defenderse |
| Lo que penaliza | (a) ambigüedad sobre qué entregar · (b) bloqueos por dependencias externas · (c) overengineering |
| Frase clave | "Quiero pasar de 1.7 pts a 9+ pts ejecutando lo automatizable y dejando solo lo humano." |

**Implicación para el portal**: cada sección expone exactamente UNA acción concreta pendiente al autor; el resto está pre-cocinado.

---

## P3 — El revisor externo (otros estudiantes, futuros lectores)

| Atributo | Detalle |
|---|---|
| Rol | Estudiante de otra cohorte o lector posterior del repo |
| Objetivo | Entender la solución y eventualmente referenciarla |
| Contexto técnico | Aprendiendo PDDL; puede no conocer Singularity |
| Cómo accede al portal | URL pública (si se publica) o repo público |
| Tiempo invertido | 10-15 min de lectura inicial |
| Lo que prioriza | Claridad pedagógica del modelo PDDL y la justificación de decisiones |
| Lo que penaliza | Reporte sin contexto, código PDDL sin comentarios |

**Implicación para el portal**: `/rover` tiene sub-sección "Decisiones de modelado" que cita los ADRs explícitamente.

---

## P4 — El autor en modo operador

| Atributo | Detalle |
|---|---|
| Rol | El autor levantando el portal localmente |
| Objetivo | Arrancar todo el stack en local sin fricción |
| Contexto técnico | Debe tener Docker, Python, Node, y opcionalmente Singularity en VPS |
| Tiempo invertido | 5 minutos de arranque |
| Lo que prioriza | `docker compose up` + `npm start` y todo arriba |
| Lo que penaliza | Dependencias faltantes, errores crípticos, configuración manual |

**Implicación**: README de raíz con sección "Quickstart" de 5 pasos máximo + `.env.example` completo.

---

## Anti-personas (deliberadamente excluidas)

- ❌ "Integrantes del equipo" — eliminados; el trabajo es **individual**.
- ❌ Otros profesores fuera del curso (no diseñamos para multi-curso).
- ❌ Bots / scrapers (no necesitamos SEO).
- ❌ Usuario público anónimo sin contexto académico (el portal no es un producto SaaS).
