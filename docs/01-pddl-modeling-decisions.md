# Decisiones de modelado PDDL — problema del rover

Documento maestro de los ADRs del dominio `rover-mineral-transport`. Cada decisión se justifica con su contexto, alternativas y consecuencias.

---

## ADR-001 — Capacidad del rover = 1 mineral a la vez

**Estado**: ✅ Aceptado
**Fecha**: 2026-05-11

### Contexto

El enunciado del profesor menciona que el rover excavó dos minerales (M1 en L1, M2 en L2) y que el "mal tiempo" impidió trasladarlos. No especifica cuántos puede cargar simultáneamente.

### Decisión

**Capacidad = 1 mineral**, modelada con el predicado `(free ?r - rover)`.

- `(pickup)` requiere `(free ?r)` y la elimina.
- `(deliver)` la restablece.

### Alternativas consideradas

| Opción | Pros | Contras |
|---|---|---|
| A. Capacidad ilimitada | Plan más corto (10 acciones vs 14) | Trivial; no usa el grafo dirigido |
| **B. Capacidad = 1 ✅** | Plan rico, dos viajes al lab, usa toda la topología | Más acciones |
| C. Capacidad = N parametrizable | Más realista | Sobreingeniería para esta actividad |

### Consecuencias

- Plan óptimo de `problem-1` tiene **14 acciones (coste 14)**.
- "Mal tiempo" del enunciado queda capturado narrativamente por la capacidad (no se modela como literal).
- Los escenarios alternos (problem-2/3) pueden romper esta capacidad declarando más minerales, pero el dominio sigue siendo válido.

---

## ADR-002 — Función de costo unitaria

**Estado**: ✅ Aceptado
**Fecha**: 2026-05-11

### Contexto

El track "optimal" del IPC2018 requiere planes de costo mínimo, no solo válidos. Hay que declarar `:action-costs` y una métrica.

### Decisión

**Costo unitario por acción** (`(increase (total-cost) 1)` en cada efecto):

- `move`: 1
- `pickup`: 1
- `deliver`: 1

Métrica del problema: `(:metric minimize (total-cost))`.

### Alternativas consideradas

| Opción | Pros | Contras |
|---|---|---|
| **A. Unitario ✅** | Compatible con todos los planners óptimos; equivalente a minimizar longitud | No diferencia tipos de acción |
| B. Ponderado (move=1, pickup=5, deliver=10) | Más realista; favorece menos pickups | Justificación arbitraria; mismas soluciones óptimas si capacidad=1 |
| C. Sin costos (solo válido) | Más simple | Cambia track a "satisficing", no a "optimal" |

### Consecuencias

- `total-cost = número de acciones del plan`.
- Compatible con Delfi, Complementary2, Scorpion y otros del IPC2018 optimal track.

---

## ADR-003 — Aristas dirigidas con predicado `(path ?from ?to)`

**Estado**: ✅ Aceptado
**Fecha**: 2026-05-11

### Contexto

El grafo del problema tiene **aristas mixtas**: bidireccionales (L1↔L3, L3↔L4, L4↔L5) y unidireccionales (L3→L2, L2→L4). Hay varias formas de representarlas.

### Decisión

Un único predicado **`(path ?from - location ?to - location)` dirigido**. Para bidireccionales se declaran **dos átomos** (uno en cada sentido) en el `(:init)` del problem.

Ejemplo:

```pddl
;; L1 <-> L3 (bidireccional)
(path L1 L3)
(path L3 L1)

;; L3 -> L2 (unidireccional)
(path L3 L2)
;; (no se declara L2 -> L3)
```

### Alternativas consideradas

| Opción | Pros | Contras |
|---|---|---|
| **A. `(path ?f ?t)` dirigido ✅** | Una sola acción `move`; modelo uniforme | Duplica átomos para bidireccionales |
| B. `(connected ?a ?b)` simétrico + `(directed ?a ?b)` adicional | Menos átomos | Dos predicados + acción `move` más compleja |
| C. Dos acciones `move-bidir` y `move-dir` | Explícito | Dobla el espacio de acciones; planners más lentos |

### Consecuencias

- `move` tiene solo `(at ?r ?from)` y `(path ?from ?to)` como precondiciones.
- El parser del backend (`pddl_validator.py`) no necesita lógica especial para bidireccionalidad.

---

## ADR-004 — "Mal tiempo" no se modela como literal

**Estado**: ✅ Aceptado
**Fecha**: 2026-05-11

### Contexto

El enunciado dice "Debido al mal tiempo, no fue posible trasladar las rocas". Esto puede modelarse como:

1. Un literal temporal `(bad-weather)` que bloquea ciertas acciones.
2. Una restricción narrativa, ya capturada por la capacidad = 1.

### Decisión

**No se modela el mal tiempo**. La capacidad = 1 (ADR-001) ya captura la limitación: el rover no puede transportar todos los minerales de una sola vez.

### Alternativas consideradas

| Opción | Pros | Contras |
|---|---|---|
| **A. No modelarlo ✅** | Modelo más limpio; dominio reusable | Pierde fidelidad narrativa estricta |
| B. Literal `(bad-weather)` que bloquea pickup | Captura la causa | Sobreingeniería; el clima no es decisión del rover |
| C. Acción `wait-weather` con costo | Realista | Cambia el horizonte del problema; planners temporales |

### Consecuencias

- El reporte APA debe **mencionar explícitamente esta decisión** y por qué se justifica.
- Si el profesor cuestiona, se puede extender el dominio en ADR-004-bis.

---

## ADR-006 — Acciones del dominio: `move`, `pickup`, `deliver`

**Estado**: ✅ Aceptado
**Fecha**: 2026-05-11

### Contexto

¿Qué acciones mínimas necesita el dominio para resolver el problema base y los escenarios alternativos?

### Decisión

Tres acciones:

| Acción | Parámetros | Precondición | Efecto |
|---|---|---|---|
| `move` | `?r ?from ?to` | `(at ?r ?from)`, `(path ?from ?to)` | `(not (at ?r ?from))`, `(at ?r ?to)`, `total-cost +1` |
| `pickup` | `?r ?m ?l` | `(at ?r ?l)`, `(mineral-at ?m ?l)`, `(free ?r)` | `(carrying ?r ?m)`, `(not (mineral-at ?m ?l))`, `(not (free ?r))`, `total-cost +1` |
| `deliver` | `?r ?m ?l` | `(at ?r ?l)`, `(lab-at ?l)`, `(carrying ?r ?m)` | `(analyzed ?m)`, `(not (carrying ?r ?m))`, `(free ?r)`, `total-cost +1` |

### Alternativas consideradas

| Opción | Pros | Contras |
|---|---|---|
| **A. 3 acciones ✅** | Mínimo necesario; legible | — |
| B. Combinar `move + pickup` | Plan más corto | Pierde granularidad; precondiciones complejas |
| C. Acción `drop` separada de `deliver` | Permite soltar sin entregar | No hay caso de uso en este problema |

### Consecuencias

- Los 3 problemas (problem-1, problem-2, problem-3) usan el **mismo** `domain.pddl`.
- Si un escenario alternativo necesita una acción nueva (p.ej. un segundo rover con `transfer`), se documenta extensión en ADR-007+.

---

## Plan óptimo de `problem-1.pddl` — validación manual

| # | Acción | Estado antes (resumen) | Estado después |
|---|---|---|---|
| 1 | `(move R1 L4 L3)` | rover en L4, free | rover en L3 |
| 2 | `(move R1 L3 L1)` | rover en L3 | rover en L1 |
| 3 | `(pickup R1 M1 L1)` | M1 en L1, rover free | M1 en rover, rover ocupado |
| 4 | `(move R1 L1 L3)` | | rover en L3 |
| 5 | `(move R1 L3 L4)` | | rover en L4 |
| 6 | `(move R1 L4 L5)` | | rover en L5 (lab) |
| 7 | `(deliver R1 M1 L5)` | rover lleva M1 en lab | M1 analizado, rover free |
| 8 | `(move R1 L5 L4)` | | rover en L4 |
| 9 | `(move R1 L4 L3)` | | rover en L3 |
| 10 | `(move R1 L3 L2)` | path L3→L2 unidir, OK | rover en L2 |
| 11 | `(pickup R1 M2 L2)` | M2 en L2, rover free | M2 en rover |
| 12 | `(move R1 L2 L4)` | path L2→L4 unidir, OK | rover en L4 |
| 13 | `(move R1 L4 L5)` | | rover en L5 |
| 14 | `(deliver R1 M2 L5)` | | M2 analizado |

**Estado final**: `(analyzed M1) ∧ (analyzed M2)` ✅
**Coste total**: 14 ✅

Plan alternativo igualmente óptimo: comenzar por M2 (L4→L3→L2→pickup→L4→L5→deliver→L4→L3→L1→pickup→L3→L4→L5→deliver). Mismo coste 14.
