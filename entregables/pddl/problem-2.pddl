;; ============================================================
;; PROBLEM 2: "Tres minerales con acceso condicionado por el laboratorio"
;; ------------------------------------------------------------
;; Autor: Adonai Samael Hernandez Mata
;; Programa: Maestria en Inteligencia Artificial - UNIR
;; Curso: Razonamiento y planificacion automatica
;; Fecha: 2026-05-12
;;
;; ============================================================
;; MOTIVACION DEL ESCENARIO (design rationale)
;; ------------------------------------------------------------
;; Tomando el escenario base como punto de partida, este problema
;; introduce dos cambios que aumentan la complejidad del modelado:
;;
;;   1. SE ANADE UN TERCER MINERAL (M3) en una localidad nueva (L6).
;;      Esto fuerza al rover a realizar tres viajes al laboratorio
;;      (en vez de dos), demostrando que el modelado escala a un
;;      numero arbitrario de minerales sin redefinir el dominio.
;;
;;   2. SE ANADE UNA ARISTA UNIDIRECCIONAL (L5 -> L6) que obliga a
;;      pasar por el laboratorio antes de poder recoger M3. Esta
;;      restriccion examina si el planner puede razonar sobre
;;      precondiciones de localizacion no-triviales: el rover NO
;;      puede acceder a L6 directamente; debe haber visitado L5 al
;;      menos una vez para llegar.
;;
;;      Adicionalmente se anade una arista bidireccional L4 <-> L6
;;      como camino de regreso, evitando deadlock.
;;
;; HIPOTESIS QUE PRUEBA:
;;   El planner optimal track del IPC2018 (Delfi 1) debe encontrar
;;   un plan que aproveche el viaje natural del rover al laboratorio
;;   (entrega del primer mineral) para encadenar la recoleccion de M3
;;   sin retrocesos innecesarios. Plan optimo: 19 acciones (vs 14 del base).
;;
;; QUE DEMUESTRA DEL MODELADO PDDL:
;;   - Reusabilidad del dominio: el mismo `domain.pddl` sirve para
;;     instancias con N minerales sin modificacion alguna.
;;   - Expresividad de aristas dirigidas: el predicado `(path ?f ?t)`
;;     captura naturalmente restricciones topologicas complejas.
;;   - Importancia de la capacidad = 1 (ADR-001): obliga al planner
;;     a planificar visitas multiples al laboratorio, lo cual es
;;     mas rico que un escenario con capacidad ilimitada.
;;
;; TOPOLOGIA:
;;
;;          L1 <----> L3 ----> L2
;;                    |         |
;;                    v         v
;;                   L4 <-------+
;;                   /| \
;;                  / |  \   (L4 <-> L5 y L4 <-> L6 bidir)
;;                 /  |   \
;;                v   v    \
;;               L5 ----> L6   (L5 -> L6 unidir)
;;               (lab)
;;
;; ARISTAS:
;;   L1 <-> L3       bidireccional
;;   L3  -> L2       unidireccional
;;   L2  -> L4       unidireccional
;;   L3 <-> L4       bidireccional
;;   L4 <-> L5       bidireccional
;;   L4 <-> L6       bidireccional (camino de regreso desde L6)
;;   L5  -> L6       unidireccional (restriccion del escenario)
;; ============================================================

(define (problem rover-problem-2)
  (:domain rover-mineral-transport)

  (:objects
    L1 L2 L3 L4 L5 L6 - location
    M1 M2 M3          - mineral
    R1                - rover
  )

  (:init
    ;; Estado inicial: rover en L4, libre
    (at R1 L4)
    (free R1)

    ;; Distribucion de minerales
    (mineral-at M1 L1)
    (mineral-at M2 L2)
    (mineral-at M3 L6)

    ;; Laboratorio unico
    (lab-at L5)

    ;; Topologia del grafo
    ;; L1 <-> L3 (bidir)
    (path L1 L3)
    (path L3 L1)

    ;; L3 -> L2 (unidir — heredada del base)
    (path L3 L2)

    ;; L2 -> L4 (unidir — heredada del base)
    (path L2 L4)

    ;; L3 <-> L4 (bidir — heredada del base)
    (path L3 L4)
    (path L4 L3)

    ;; L4 <-> L5 (bidir — heredada del base)
    (path L4 L5)
    (path L5 L4)

    ;; L4 <-> L6 (bidir — camino de retorno desde L6)
    (path L4 L6)
    (path L6 L4)

    ;; L5 -> L6 (unidir — restriccion del escenario)
    (path L5 L6)

    ;; Funcion de costo
    (= (total-cost) 0)
  )

  (:goal (and
    (analyzed M1)
    (analyzed M2)
    (analyzed M3)
  ))

  (:metric minimize (total-cost))
)
