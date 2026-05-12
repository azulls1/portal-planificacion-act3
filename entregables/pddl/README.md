# PDDL — Archivos entregables

Contiene el dominio común y los problemas (base + alternos) para la Actividad 3.

## Archivos

| Archivo | Descripción |
|---|---|
| `domain.pddl` | Dominio común `rover-mineral-transport`. Tipos, predicados, 3 acciones (`move`, `pickup`, `deliver`). Métrica: `minimize total-cost`. |
| `problem-1.pddl` | **Problema base del profesor** (rover + 5 localidades + 2 minerales + 1 laboratorio en L5). |
| `problem-2.pddl` | Escenario alternativo del integrante #2 — placeholder, completar. |
| `problem-3.pddl` | Escenario alternativo del integrante #3 — placeholder, completar. |

## Decisiones de modelado (ver `docs/01-pddl-modeling-decisions.md`)

- **ADR-001**: capacidad del rover = 1 mineral a la vez (predicado `free`).
- **ADR-002**: función de costo unitaria (`(increase (total-cost) 1)` por acción).
- **ADR-003**: aristas dirigidas con `(path ?from ?to)`; bidireccional = 2 átomos.
- **ADR-004**: "mal tiempo" no se modela (queda capturado por capacidad=1).

## Topología del problem-1 (Figura 1 del profesor)

```
        L1 <----> L3 -----> L2
                  ^          |
                  |          v   (L2 -> L4 unidireccional)
                  v          |
                  L4 <-------+
                  ^
                  v   (L4 <-> L5 bidireccional)
                  L5  (laboratorio)
```

| Arista | Dirección |
|---|---|
| L1 ↔ L3 | bidireccional |
| L3 → L2 | unidireccional |
| L2 → L4 | unidireccional |
| L3 ↔ L4 | bidireccional |
| L4 ↔ L5 | bidireccional |

- Rover R1: posición inicial L4
- Mineral M1: en L1
- Mineral M2: en L2
- Laboratorio: en L5

## Cómo ejecutar localmente

### Opción A — Editor en línea (rápido, sin Singularity)

1. Abrir https://editor.planning.domains/
2. Pegar `domain.pddl` en la pestaña Domain.
3. Pegar `problem-1.pddl` en la pestaña Problem.
4. Solve → seleccionar planner (idealmente uno del IPC2018; al menos algún satisficing).
5. Descargar el plan generado y guardar en `../planes/problem-1-plan.txt`.

### Opción B — Singularity (nativo, criterio 1 nivel 4)

```bash
# Desde la raíz del proyecto, con Singularity instalado en Linux/WSL
cd infra/singularity
./pull-planner.sh                # baja el .sif del planner ganador del IPC2018
singularity exec planner.sif planner \
    /entregables/pddl/domain.pddl \
    /entregables/pddl/problem-1.pddl \
    --plan-file /entregables/planes/problem-1-plan.txt
```

> Los comandos exactos dependen del planner elegido (Delfi, Complementary2, Scorpion, etc.). Ver `infra/singularity/README.md`.

## Plan esperado para `problem-1.pddl`

Con capacidad=1 mineral, el rover debe hacer **2 viajes al laboratorio**. Plan óptimo: **14 acciones** (coste 14).

Ejemplo de plan válido (uno de varios óptimos):

```
1.  (move R1 L4 L3)
2.  (move R1 L3 L1)
3.  (pickup R1 M1 L1)
4.  (move R1 L1 L3)
5.  (move R1 L3 L4)
6.  (move R1 L4 L5)
7.  (deliver R1 M1 L5)
8.  (move R1 L5 L4)
9.  (move R1 L4 L3)
10. (move R1 L3 L2)
11. (pickup R1 M2 L2)
12. (move R1 L2 L4)
13. (move R1 L4 L5)
14. (deliver R1 M2 L5)
```

Verificación manual: cada acción cumple sus precondiciones en el estado correspondiente; el estado final satisface `(analyzed M1) ∧ (analyzed M2)`. Coste = 14.
