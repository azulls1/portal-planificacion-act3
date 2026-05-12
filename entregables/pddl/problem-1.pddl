;; ============================================================
;; PROBLEM 1: Rover base — escenario propuesto por el profesor
;; ------------------------------------------------------------
;; Enunciado: un rover excavo dos rocas (en L1 y L2). Debe llevar
;;   ambos minerales al laboratorio (L5) para su analisis.
;;
;; Topologia (Figura 1 del documento del profesor):
;;
;;       L1 <-> L3 -----> L2
;;              |          |
;;              v          v   (L2 -> L4 unidireccional)
;;             L4 <--------+
;;              |
;;              v   (L4 <-> L5 bidireccional)
;;             L5  (laboratorio)
;;
;; Aristas:
;;   L1 <-> L3   bidireccional
;;   L3  -> L2   unidireccional
;;   L2  -> L4   unidireccional
;;   L3 <-> L4   bidireccional
;;   L4 <-> L5   bidireccional
;;
;; Estado inicial: rover en L4 (posicion central en la Figura 1).
;; Goal: ambos minerales analizados en el laboratorio.
;; ============================================================

(define (problem rover-problem-1)
  (:domain rover-mineral-transport)

  (:objects
    L1 L2 L3 L4 L5 - location
    M1 M2          - mineral
    R1             - rover
  )

  (:init
    ;; Posicion inicial del rover
    (at R1 L4)
    (free R1)

    ;; Minerales en sus localidades de origen
    (mineral-at M1 L1)
    (mineral-at M2 L2)

    ;; Laboratorio
    (lab-at L5)

    ;; Topologia del grafo (aristas dirigidas; bidir = dos atomos)
    ;; L1 <-> L3
    (path L1 L3)
    (path L3 L1)

    ;; L3 -> L2 (unidireccional)
    (path L3 L2)

    ;; L2 -> L4 (unidireccional)
    (path L2 L4)

    ;; L3 <-> L4
    (path L3 L4)
    (path L4 L3)

    ;; L4 <-> L5
    (path L4 L5)
    (path L5 L4)

    ;; Coste acumulado inicia en 0
    (= (total-cost) 0)
  )

  (:goal (and
    (analyzed M1)
    (analyzed M2)
  ))

  (:metric minimize (total-cost))
)
