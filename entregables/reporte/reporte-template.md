<!--
====================================================================
TEMPLATE DEL REPORTE APA — Actividad 3
====================================================================
Editar este archivo en Word o LibreOffice tras exportarlo a .docx,
o convertir a PDF con `pandoc reporte-template.md -o reporte.pdf`.

Cumple APA 7. Marcadores `[PENDIENTE: ...]` deben llenarse antes
del merge final.

Configuración recomendada para el .docx:
- Tipografía: Times New Roman 12 pt
- Interlineado: 2.0 (doble)
- Márgenes: 2.54 cm en los 4 lados
- Sangría primera línea: 1.27 cm
- Numeración de páginas: arriba a la derecha
====================================================================
-->

# Resolución de un problema de planificación clásica mediante PDDL y ejecución sobre el planner ganador del IPC2018

**[Nombres de los integrantes del equipo]**

Curso: Razonamiento y planificación automática
Maestría — Primer Semestre · 2026

[Institución]

---

## Resumen

En el presente trabajo se aborda la resolución de un problema de planificación clásica mediante el lenguaje PDDL (Planning Domain Definition Language). El equipo modela un escenario en el que un robot tipo *rover* debe trasladar dos minerales desde sus localidades de origen hasta un laboratorio para su análisis, respetando restricciones direccionales en las trayectorias del terreno. Se ejecuta el planner ganador del *optimal track* del IPC2018 sobre la tarea Snake como evidencia de competencia con la herramienta Singularity, y se generan tres variantes alternativas del problema base, una por integrante del equipo. El reporte documenta las decisiones de modelado (capacidad de carga, función de costo, representación de aristas) y verifica formalmente la corrección de los planes obtenidos.

**Palabras clave**: planificación automática, PDDL, IPC2018, Singularity, rover, planificación clásica.

---

## 1. Introducción

La planificación automática es una rama de la inteligencia artificial que estudia algoritmos capaces de encontrar secuencias de acciones que llevan a un agente desde un estado inicial hasta un conjunto de estados meta (Ghallab et al., 2016). Un problema de planificación clásica queda definido por la tupla $\langle S, A, \gamma, s_0, g \rangle$ donde $S$ es el espacio de estados, $A$ el conjunto de acciones, $\gamma$ la función de transición determinista, $s_0$ el estado inicial y $g$ el conjunto de literales que deben ser ciertos en cualquier estado meta (Russell & Norvig, 2020).

El presente trabajo aplica esta teoría al modelado de un escenario de logística autónoma en un terreno con restricciones de movilidad, y al uso de los planificadores estado-del-arte distribuidos por la *International Planning Competition* 2018 (IPC2018) a través de contenedores Singularity.

---

## 2. Marco teórico

### 2.1 PDDL

PDDL es un lenguaje declarativo introducido por McDermott et al. (1998) como estándar para describir dominios y problemas de planificación. Un dominio (`domain.pddl`) define los tipos, predicados y acciones disponibles, mientras que un problema (`problem.pddl`) instancia objetos concretos, el estado inicial y la meta.

### 2.2 La competencia IPC

La *International Planning Competition* es una serie de eventos organizados por la comunidad ICAPS desde 1998 que evalúa los planificadores más recientes sobre dominios y problemas estandarizados (ICAPS, s.f.). En la edición 2018 (IPC2018) los participantes del *Classical Track* fueron distribuidos como imágenes Singularity con el fin de garantizar reproducibilidad (IPC2018, 2018).

### 2.3 Optimal vs. satisficing

Los planners del *optimal track* deben retornar planes de costo mínimo bajo la métrica declarada en el problema; los del *satisficing track* sólo deben retornar planes válidos en el menor tiempo posible. El presente trabajo emplea un planner del *optimal track*.

### 2.4 Singularity (Apptainer)

Singularity es un runtime de contenedores diseñado para entornos de cómputo de alto desempeño (HPC) que permite ejecutar imágenes reproducibles sin necesidad de privilegios de *root* en tiempo de ejecución (Kurtzer et al., 2017).

---

## 3. Entorno de ejecución

### 3.1 Configuración utilizada

| Componente | Versión |
|---|---|
| Sistema operativo | [PENDIENTE: e.g., Ubuntu 22.04 LTS sobre WSL2] |
| Singularity | [PENDIENTE: e.g., 3.11.5] |
| Planner ganador IPC2018 (optimal) | [PENDIENTE: identificar] |
| Hardware | [PENDIENTE: CPU/RAM] |

### 3.2 Pasos de instalación

[PENDIENTE: narrar la instalación con referencias a `infra/singularity/README.md` del repo]

---

## 4. Ejecución de la tarea Snake (IPC2018)

### 4.1 Descripción del problema

[PENDIENTE: descripción breve del dominio Snake del IPC2018]

### 4.2 Procedimiento de ejecución

[PENDIENTE: comando exacto del script, salidas relevantes, capturas]

> **Figura 1.** Captura de la terminal ejecutando el script de Singularity.

> **Figura 2.** Captura del archivo del plan generado.

### 4.3 Resultados

[PENDIENTE: plan obtenido o explicación de por qué se cicló]

---

## 5. Modelado del problema del rover

### 5.1 Enunciado

Un robot tipo rover previamente excavó dos rocas (M1 y M2) en las localidades L1 y L2 respectivamente. Debido a condiciones meteorológicas adversas no fue posible trasladarlos. Se solicita generar el plan que el rover debe seguir para llevar ambos minerales al laboratorio ubicado en L5. Las trayectorias presentan restricciones de dirección.

### 5.2 Topología

> **Figura 3.** Grafo de localidades del problema base.

| Arista | Dirección |
|---|---|
| L1 ↔ L3 | bidireccional |
| L3 → L2 | unidireccional |
| L2 → L4 | unidireccional |
| L3 ↔ L4 | bidireccional |
| L4 ↔ L5 | bidireccional |

### 5.3 Decisiones de modelado

El equipo tomó cuatro decisiones de diseño documentadas como ADR (*Architecture Decision Records*) en el repositorio del proyecto:

- **ADR-001 — Capacidad del rover = 1 mineral**. Se introduce el predicado `(free ?r)` para forzar al rover a entregar antes de recoger otro mineral, lo que enriquece el espacio de planes y captura la limitación narrada por el "mal tiempo".
- **ADR-002 — Costo unitario por acción**. Cada acción incrementa `total-cost` en 1; la métrica del problema minimiza este valor, manteniendo compatibilidad con planners del *optimal track*.
- **ADR-003 — Aristas dirigidas con `(path ?f ?t)`**. Las bidireccionales se declaran como dos átomos. Esta uniformidad simplifica la acción `move`.
- **ADR-004 — "Mal tiempo" no se modela**. La limitación operativa ya queda capturada por la capacidad unitaria; añadir un literal explícito sería sobreingeniería.

### 5.4 Estructura del dominio

El dominio `rover-mineral-transport` define tres tipos (`location`, `mineral`, `rover`), seis predicados (`at`, `path`, `mineral-at`, `carrying`, `analyzed`, `free`, `lab-at`) y tres acciones (`move`, `pickup`, `deliver`). El código completo se encuentra en `entregables/pddl/domain.pddl`.

### 5.5 Plan obtenido

El planner produjo un plan de **14 acciones** (costo 14) que satisface ambos sub-objetivos. El equipo verificó formalmente la corrección del plan mediante un simulador interno que ejecuta cada acción contra el estado correspondiente.

> **Figura 4.** Plan generado para el problema base.

| # | Acción | Estado relevante |
|---|---|---|
| 1 | `(move R1 L4 L3)` | rover sale de L4 |
| 2 | `(move R1 L3 L1)` | rover llega a L1 |
| 3 | `(pickup R1 M1 L1)` | rover toma M1 |
| ... | [completar las 14 entradas] | |
| 14 | `(deliver R1 M2 L5)` | M2 analizado |

---

## 6. Escenarios alternativos por integrante

### 6.1 Escenario del integrante 1

[PENDIENTE: nombre del integrante]

**Descripción**: [PENDIENTE]

**Diferencias respecto al base**: [PENDIENTE]

**Plan obtenido**: [PENDIENTE: número de acciones y referencia al archivo `entregables/planes/<su-archivo>.txt`]

### 6.2 Escenario del integrante 2

**Descripción**: tres minerales y una arista unidireccional adicional L5 → L6 que fuerza al rover a visitar el laboratorio antes de poder recoger el tercer mineral M3.

**Diferencias respecto al base**: +1 localidad (L6), +1 mineral (M3), +3 aristas (L4↔L6 bidir y L5→L6 unidir).

**Plan obtenido**: 19 acciones (costo 19), verificado formalmente.

### 6.3 Escenario del integrante 3

**Descripción**: dos laboratorios (L5 y L7) y cuatro minerales (M1, M2, M3, M4). El mineral M4 se encuentra inicialmente en el mismo nodo del segundo laboratorio, lo que permite resolver M4 en dos acciones sin desplazamiento.

**Diferencias respecto al base**: +2 localidades (L6 y L7), +2 minerales (M3 y M4), +1 laboratorio (L7), +4 aristas (L5↔L6 y L6↔L7 bidir).

**Plan obtenido**: 20 acciones (costo 20), verificado formalmente. El planner elige entregar M3 en L7 (no en L5) para encadenar la captura y entrega de M4.

---

## 7. Conclusiones

[PENDIENTE: redacción final del equipo]

Los aprendizajes principales del trabajo son:

1. La **abstracción** del problema mediante PDDL exige decisiones explícitas (capacidad, costo, semántica de aristas) que cambian el espacio de soluciones.
2. La ejecución reproducible mediante **Singularity** facilita compartir y evaluar planificadores entre equipos, aunque tiene fricciones en sistemas no Linux nativos.
3. Los **planners del *optimal track*** del IPC2018 resuelven sin dificultad instancias con menos de 10 localidades y menos de 5 minerales; escalar requiere heurísticas específicas.
4. La **verificación formal** del plan obtenido es un paso necesario, no opcional: el planner puede devolver un plan inválido si el dominio está mal modelado (por ejemplo, si se olvida declarar el sentido de una arista).

---

## Referencias

Fox, M., & Long, D. (2003). PDDL2.1: An extension to PDDL for expressing temporal planning domains. *Journal of Artificial Intelligence Research*, *20*, 61–124. https://doi.org/10.1613/jair.1129

Ghallab, M., Nau, D., & Traverso, P. (2016). *Automated planning and acting*. Cambridge University Press.

Helmert, M. (2006). The Fast Downward planning system. *Journal of Artificial Intelligence Research*, *26*, 191–246. https://doi.org/10.1613/jair.1705

International Conference on Automated Planning and Scheduling. (s.f.). *Competitions*. https://www.icaps-conference.org/competitions/

IPC2018. (2018). *International Planning Competition 2018 — Classical Tracks*. https://ipc2018-classical.bitbucket.io/

Katz, M., Sohrabi, S., Samulowitz, H., & Sievers, S. (2018). Delfi: Online planner selection for cost-optimal planning. En *IPC-9 Planner Abstracts* (pp. 57–64).

Kurtzer, G. M., Sochat, V., & Bauer, M. W. (2017). Singularity: Scientific containers for mobility of compute. *PLOS ONE*, *12*(5). https://doi.org/10.1371/journal.pone.0177459

McDermott, D., Ghallab, M., Howe, A., Knoblock, C., Ram, A., Veloso, M., Weld, D., & Wilkins, D. (1998). *PDDL — The Planning Domain Definition Language* (Technical Report CVC TR-98-003/DCS TR-1165). Yale Center for Computational Vision and Control.

Russell, S., & Norvig, P. (2020). *Artificial intelligence: A modern approach* (4ª ed.). Pearson.

Sylabs. (s.f.). *Singularity admin guide — Installing Singularity*. https://docs.sylabs.io/guides/3.5/admin-guide/installation.html

---

<!-- Fin del template. Reemplaza todos los [PENDIENTE: ...] antes del merge. -->
