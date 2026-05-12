;; ============================================================
;; PROBLEM 3: "Dos laboratorios con asignacion oportunista"
;; ------------------------------------------------------------
;; Autor: Adonai Samael Hernandez Mata
;; Programa: Maestria en Inteligencia Artificial - UNIR
;; Curso: Razonamiento y planificacion automatica
;; Fecha: 2026-05-12
;;
;; ============================================================
;; MOTIVACION DEL ESCENARIO (design rationale)
;; ------------------------------------------------------------
;; Este segundo escenario alternativo introduce tres cambios
;; significativos respecto al base, orientados a evaluar el
;; razonamiento OPORTUNISTA del planner optimal:
;;
;;   1. SE ANADE UN SEGUNDO LABORATORIO (L7).
;;      El dominio NO impone asignacion mineral->laboratorio; cualquier
;;      mineral puede entregarse en cualquier lab. Esto expande el
;;      espacio de soluciones: el planner debe ELEGIR el lab mas
;;      cercano para cada mineral con base en la topologia.
;;
;;   2. SE ANADE UN CUARTO MINERAL (M4) EN L7.
;;      M4 esta inicialmente en el mismo nodo del segundo laboratorio,
;;      lo que permite resolverlo en exactamente 2 acciones
;;      (pickup + deliver in situ) si el rover llega ahi. Esto pone
;;      a prueba si el planner aprovecha esta simplificacion natural.
;;
;;   3. SE ANADE UN MINERAL INTERMEDIO (M3) EN L6.
;;      L6 se sitúa estrategicamente entre los dos laboratorios
;;      (L5 <-> L6 <-> L7). Esto crea una decision real para el
;;      planner: entregar M3 en L5 o en L7. El optimo es entregar
;;      M3 en L7 para encadenar con M4 sin retroceso.
;;
;; HIPOTESIS QUE PRUEBA:
;;   El planner optimal track Delfi 1 debe descubrir la asignacion
;;   oportunista (M3 a L7 en lugar de L5) en lugar de tomar la
;;   ruta "obvia" de entregar todo en L5. Plan optimo: 20 acciones.
;;
;;   Si Delfi 1 entrega M3 en L5 (subóptimo), el plan tendria
;;   22 acciones — 2 mas. La diferencia es pequena pero significativa:
;;   demuestra capacidad de razonar sobre simetrias de assignamiento.
;;
;; QUE DEMUESTRA DEL MODELADO PDDL:
;;   - Multiplexacion de objetivos sobre recursos comunes: 4 minerales,
;;     2 laboratorios, sin asignacion fija → busqueda combinatoria.
;;   - El dominio sigue siendo el MISMO. Solo cambia la instancia.
;;   - El uso de `(:metric minimize (total-cost))` es crucial: sin
;;     metrica, cualquier plan valido seria aceptado y la riqueza
;;     del escenario se perderia.
;;
;; TOPOLOGIA:
;;
;;       L1 <----> L3 ----> L2
;;                 |         |
;;                 v         v
;;                L4 <-------+
;;                 |
;;                 v   (L4 <-> L5 bidir)
;;                L5 (lab #1)
;;                 |
;;                 v   (L5 <-> L6 bidir)
;;                L6 (M3 aqui)
;;                 |
;;                 v   (L6 <-> L7 bidir)
;;                L7 (lab #2 + M4 aqui)
;;
;; ARISTAS:
;;   L1 <-> L3       bidireccional (heredada del base)
;;   L3  -> L2       unidireccional (heredada del base)
;;   L2  -> L4       unidireccional (heredada del base)
;;   L3 <-> L4       bidireccional (heredada del base)
;;   L4 <-> L5       bidireccional (heredada del base)
;;   L5 <-> L6       bidireccional (nueva)
;;   L6 <-> L7       bidireccional (nueva)
;; ============================================================

(define (problem rover-problem-3)
  (:domain rover-mineral-transport)

  (:objects
    L1 L2 L3 L4 L5 L6 L7 - location
    M1 M2 M3 M4          - mineral
    R1                   - rover
  )

  (:init
    ;; Estado inicial: rover en L4, libre
    (at R1 L4)
    (free R1)

    ;; Distribucion de minerales
    (mineral-at M1 L1)
    (mineral-at M2 L2)
    (mineral-at M3 L6)
    (mineral-at M4 L7)

    ;; DOS laboratorios (ambos aceptan cualquier mineral)
    (lab-at L5)
    (lab-at L7)

    ;; Topologia
    ;; L1 <-> L3 (bidir)
    (path L1 L3)
    (path L3 L1)

    ;; L3 -> L2 (unidir)
    (path L3 L2)

    ;; L2 -> L4 (unidir)
    (path L2 L4)

    ;; L3 <-> L4 (bidir)
    (path L3 L4)
    (path L4 L3)

    ;; L4 <-> L5 (bidir)
    (path L4 L5)
    (path L5 L4)

    ;; L5 <-> L6 (bidir — nueva)
    (path L5 L6)
    (path L6 L5)

    ;; L6 <-> L7 (bidir — nueva)
    (path L6 L7)
    (path L7 L6)

    ;; Funcion de costo
    (= (total-cost) 0)
  )

  (:goal (and
    (analyzed M1)
    (analyzed M2)
    (analyzed M3)
    (analyzed M4)
  ))

  (:metric minimize (total-cost))
)
