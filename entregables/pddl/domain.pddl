;; ============================================================
;; DOMAIN: rover-mineral-transport
;; ------------------------------------------------------------
;; Autor: Equipo Actividad 3 — Razonamiento y planificacion automatica
;; Curso: Maestria, Primer Semestre
;; Fecha: 2026-05-11
;;
;; Descripcion: Modelo de planificacion clasica para un robot tipo
;;   rover que debe trasladar minerales desde localidades de origen
;;   hasta uno o mas laboratorios para su analisis.
;;
;; Decisiones de modelado (ver docs/01-pddl-modeling-decisions.md):
;;   ADR-001: capacidad del rover = 1 mineral a la vez (forzamos
;;            replanificacion y planes mas ricos que carga ilimitada).
;;   ADR-002: funcion de costo = unitaria por accion (total-cost).
;;            Compatible con planners optimal track del IPC2018.
;;   ADR-003: aristas dirigidas representadas con predicado
;;            (path ?from ?to). Para bidireccionales se declaran
;;            dos atomos (uno por sentido) en el problem.pddl.
;;   ADR-004: "mal tiempo" no se modela como literal — el enunciado
;;            lo usa como motivo narrativo de por que el rover no
;;            puede trasladar todos los minerales de una vez; ya
;;            queda capturado por la capacidad = 1.
;; ============================================================

(define (domain rover-mineral-transport)

  (:requirements
    :typing
    :action-costs)

  ;; -------- Tipos --------
  (:types
    location  ;; nodos del grafo (L1, L2, ...)
    mineral   ;; rocas que el rover debe transportar
    rover     ;; el robot que se mueve
  )

  ;; -------- Predicados --------
  (:predicates
    ;; Posicion del rover
    (at ?r - rover ?l - location)

    ;; Conectividad del grafo (arista dirigida)
    (path ?from - location ?to - location)

    ;; Estado de los minerales
    (mineral-at ?m - mineral ?l - location)
    (carrying  ?r - rover    ?m - mineral)
    (analyzed  ?m - mineral)

    ;; Capacidad del rover (ADR-001): exclusion mutua "free / carrying"
    (free ?r - rover)

    ;; Marca de laboratorio (puede haber 1 o N en distintos problems)
    (lab-at ?l - location)
  )

  ;; -------- Funciones --------
  (:functions
    (total-cost) - number
  )

  ;; ============================================================
  ;; Acciones
  ;; ============================================================

  ;; Mover el rover por una arista existente del grafo.
  (:action move
    :parameters (?r - rover ?from - location ?to - location)
    :precondition (and
      (at ?r ?from)
      (path ?from ?to)
    )
    :effect (and
      (not (at ?r ?from))
      (at ?r ?to)
      (increase (total-cost) 1)
    )
  )

  ;; Recoger un mineral en la localidad actual.
  ;; Solo posible si el rover esta libre (capacidad = 1).
  (:action pickup
    :parameters (?r - rover ?m - mineral ?l - location)
    :precondition (and
      (at ?r ?l)
      (mineral-at ?m ?l)
      (free ?r)
    )
    :effect (and
      (carrying ?r ?m)
      (not (mineral-at ?m ?l))
      (not (free ?r))
      (increase (total-cost) 1)
    )
  )

  ;; Entregar el mineral en un laboratorio.
  ;; Tras la entrega, el mineral queda analizado y el rover libre.
  (:action deliver
    :parameters (?r - rover ?m - mineral ?l - location)
    :precondition (and
      (at ?r ?l)
      (lab-at ?l)
      (carrying ?r ?m)
    )
    :effect (and
      (analyzed ?m)
      (not (carrying ?r ?m))
      (free ?r)
      (increase (total-cost) 1)
    )
  )

)
