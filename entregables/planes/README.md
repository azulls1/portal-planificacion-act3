# Planes generados

Outputs del planner para cada problema.

## Archivos esperados

| Archivo | Origen | Estado |
|---|---|---|
| `snake-problem-1-plan.txt` | planner IPC2018 sobre tarea Snake | ⬜ pendiente |
| `rover-problem-1-plan.txt` | planner sobre `domain.pddl + problem-1.pddl` | ⬜ pendiente |
| `rover-problem-2-plan.txt` | planner sobre `problem-2.pddl` | ⬜ pendiente |
| `rover-problem-3-plan.txt` | planner sobre `problem-3.pddl` | ⬜ pendiente |

## Formato esperado del plan

Una acción por línea, encerrada en paréntesis:

```
(move R1 L4 L3)
(move R1 L3 L1)
(pickup R1 M1 L1)
...
; cost = 14
```

El parser del backend (`pddl_validator.py`) acepta también el formato con números de paso:

```
1: (move R1 L4 L3)
2: (move R1 L3 L1)
3: (pickup R1 M1 L1)
```

## Validación manual

Antes de commitear un plan, verificar:

1. **Sintaxis**: paréntesis balanceados, nombres en mayúsculas consistentes con el problem.pddl.
2. **Validez**: cada acción cumple sus precondiciones en el estado correspondiente.
3. **Meta**: el estado final satisface el `(:goal)` del problem.pddl.
4. **Optimalidad** (si el planner es del optimal track): el coste reportado es mínimo conocido.

## Re-ejecución desde el portal

Una vez configurado Singularity y el planner, el portal puede regenerar cualquier
plan vía botón "Re-ejecutar" en las páginas `/rover` y `/escenarios/<integrante>`.
La nueva ejecución se compara con el plan persistido (SHA-256 LF-normalizado).
