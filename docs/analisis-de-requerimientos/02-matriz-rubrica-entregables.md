# Matriz de trazabilidad: rúbrica → entregables → artefactos del portal

Cada fila une un criterio de evaluación con (a) el deliverable académico físico que lo cumple, (b) el artefacto del portal web que lo expone, (c) la evidencia capturable, (d) el responsable.

---

## Tabla maestra

| ID | Criterio rúbrica | Nivel destacado = | Entregable físico | Artefacto del portal web | Evidencia | Responsable |
|---|---|---|---|---|---|---|
| **C1** | Ejecución del planner ganador IPC2018 en Snake problema 1 | Plan generado + captura del archivo del plan | (a) script ejecutado con Singularity · (b) plan obtenido | Sección `/snake` con: terminal embebida (asciinema o screenshots) + visor del plan + log de Singularity | Capturas terminal · `snake-plan.txt` · video opcional de ejecución | Líder de infraestructura |
| **C2** | Transcripción del rover a PDDL + ejecución | Plan con lógica correcta | `domain.pddl` + `problem-1.pddl` + plan generado | Sección `/rover` con: viewer PDDL syntax-highlighted (Monaco) + visualización del grafo de localidades + tabla de aristas + plan paso a paso | Archivos PDDL · `rover-plan.txt` · screenshot ejecución | Líder de modelado |
| **C3** | Escenario diferente por cada integrante del equipo | Todos los integrantes presentan su escenario | N archivos `problem-N.pddl` (uno por integrante) + N planes generados | Sección `/escenarios/<integrante>` con: descripción · diff respecto al problema base · PDDL del escenario · plan resultante | Por integrante: PDDL + plan + descripción narrativa | Cada integrante |
| **C4** | Redacción, formato APA | Formato + estilo elegante + sin errores APA | Reporte PDF máx 12 páginas | Sección `/reporte` con: visor PDF embebido + tabla de referencias APA + glosario | PDF entregable · `.bib` o lista de referencias | Líder de redacción |

---

## Desglose por nivel y umbral mínimo

### Criterio 1 — Snake (máx 3 pts)

| Nivel | Puntos | Qué se necesita |
|---|---|---|
| 1 | 0 | (descartado — no contemplamos este escenario) |
| 2 | 1 | Si Singularity falla, usar **editor online de PDDL** (planning.domains, editor.planning.domains) y dejar evidencia de la ejecución vía herramienta web |
| 3 | 2 | Singularity instalado + script lanzado + capturas. Aceptable que ciclase por recursos |
| 4 | 3 | Plan generado con éxito + captura del archivo del plan |

**Estrategia**: apuntar a nivel 4. Plan B = nivel 3 (documentar limitación de recursos). Plan C = nivel 2 (editor online).

### Criterio 2 — Rover PDDL (máx 3 pts)

| Nivel | Puntos | Qué se necesita |
|---|---|---|
| 1 | 0 | (descartado) |
| 2 | 1 | PDDL escrito pero sin ejecutarlo |
| 3 | 2 | PDDL ejecuta pero plan sin lógica (ej: rover entra a L2 sin haber estado en L3 → falla de modelado de la arista unidireccional) |
| 4 | 3 | Plan válido y óptimo |

**Estrategia**: validar manualmente el plan generado (recorrer la secuencia y verificar precondiciones); si el plan respeta las restricciones de dirección de aristas y la capacidad del rover, es correcto.

### Criterio 3 — Escenarios por integrante (máx 2 pts)

| Nivel | Puntos | Qué se necesita |
|---|---|---|
| 1 | 0 | Solo 1 integrante |
| 2 | 0.7 | 2 integrantes |
| 3 | 1.4 | 3 integrantes |
| 4 | 2.0 | **Todos** los integrantes |

**Estrategia**: cada miembro del equipo es dueño de su rama del portal. La sección `/escenarios/<integrante>` queda vacía si no hay aporte → presión social + visibilidad en el portal.

### Criterio 4 — APA y redacción (máx 2 pts)

| Nivel | Puntos | Qué se necesita |
|---|---|---|
| 1 | 0 | Sin APA, coloquial |
| 2 | 0.7 | APA parcial, alguna coloquialidad |
| 3 | 1.4 | APA cumplida, redacción mejorable |
| 4 | 2.0 | APA + redacción académica elegante |

**Estrategia**: usar Zotero/Mendeley para gestionar referencias APA; revisión cruzada del documento entre integrantes; estilo académico (sin "vamos a", "como pueden ver", etc.).

---

## Puntaje proyectado

| Estrategia | C1 | C2 | C3 | C4 | Total |
|---|---|---|---|---|---|
| Pesimista (plan B) | 2 | 2 | 1.4 | 1.4 | **6.8 / 10** |
| Realista (objetivo) | 3 | 3 | 2.0 | 1.4 | **9.4 / 10** |
| Optimista (todo destacado) | 3 | 3 | 2.0 | 2.0 | **10 / 10** |

---

## Mapeo entregables → ubicación en el portal

```
Portal (Angular)
├── / (home)
│   └── Hero + resumen + miembros del equipo + links a secciones
├── /snake                        ← Criterio 1
│   ├── /instalacion-singularity
│   ├── /ejecucion (con capturas + log)
│   └── /plan-generado
├── /rover                        ← Criterio 2
│   ├── /enunciado
│   ├── /grafo (visualización D3 o similar)
│   ├── /domain-pddl (Monaco editor read-only)
│   ├── /problem-pddl
│   ├── /ejecucion
│   └── /plan-paso-a-paso
├── /escenarios                   ← Criterio 3
│   ├── /<integrante-1>/  (su escenario + diff + plan)
│   ├── /<integrante-2>/
│   └── /<integrante-3>/
├── /reporte                      ← Criterio 4
│   ├── /pdf (viewer embebido)
│   └── /referencias (lista APA)
└── /api (Python+Celery+Redis)
    ├── POST /plan-runs           ← lanza un planner async
    ├── GET  /plan-runs/{id}      ← consulta estado/result
    └── GET  /pddl-files/{slug}   ← descarga archivos
```

---

## Definition of Done (DoD) por entregable

| Entregable | DoD |
|---|---|
| `domain.pddl` | Pasa parser PDDL · cubre tipos, predicados y acciones suficientes para los 3 problemas · comentado |
| `problem-N.pddl` | Pasa parser · genera plan ejecutable · plan ha sido validado manualmente contra las precondiciones |
| Reporte APA | Máx 12 págs · ≥ 5 referencias APA verificadas · ToC · figuras numeradas · revisado por ≥ 2 integrantes |
| Portal web | Todas las secciones accesibles · responsive · deploy en local funcional · README con instrucciones de arranque |
| Capturas | Resolución mínima legible · timestamps visibles · contexto (terminal, archivo, etc.) claro |
