# ADR-005 — Adopción de Forest Design System como UI canónico

**Fecha**: 2026-05-11
**Estado**: ✅ Aceptado
**Autores**: Architect (delegado)
**Versión DS**: Forest Design System v1.0
**Repo origen**: https://github.com/azulls1/desing-system.git
**Commit clonado**: (registrar SHA al ejecutar `git -C desing-system rev-parse HEAD`)

## Contexto

El portal de la Actividad 3 necesita una capa de UI consistente y rápida de construir, alineada con Angular 19+ y Tailwind v4 ya pinneados en `steering/tech-stack.md`. El equipo dispone de un sistema de diseño propio (Forest DS) construido por otro equipo interno (1073F) y públicamente disponible.

## Opciones evaluadas

| Opción | Pros | Contras |
|---|---|---|
| A. Tailwind v4 sin DS | Máxima libertad | Inconsistencia, tiempo perdido, decisión de cada componente repetida |
| B. Angular Material | Madurez, accesibilidad cubierta | Estética genérica, alto override para alinear con nuestra paleta |
| C. PrimeNG / Ng-Zorro | Catálogo amplio | Pesado, prescriptivo, estética enterprise no académica |
| **D. Forest DS ✅** | Tailwind v4 nativo · clases componentes listas · light-mode estricto · diferenciación visual · equipo interno tiene experiencia | Light-mode only (no soportamos dark) · vendoreado (no en npm registry) |

## Decisión

**Adoptar Forest Design System v1.0 vendoreado en el portal.**

- Los archivos CSS del DS se **copian** al portal en `apps/frontend/src/forest/` (no instalados desde npm/GitHub directo).
- Sin fork: si el DS evoluciona, se hace `git pull` en `desing-system/` y se actualiza el portal en un commit explícito.
- Las reglas del DS (light-mode, fuente ≥12px, iconos SVG, fondo `bg-gray-50`, easing Apple) se promueven a invariantes del proyecto vía Artículo 6.1 de la constitución.

## Consecuencias

### Positivas

- Onboarding visual rápido: cada integrante usa `.btn`, `.card`, `.glass` sin debate.
- Estética cohesiva: el entregable se ve trabajado, no "Bootstrap default".
- Light-mode estricto reduce decisiones (no hay branching `dark:`).
- El equipo recupera el conocimiento del DS si lo usa en futuros proyectos.

### Negativas / aceptadas

- Sin dark mode → si el profesor lo evaluara en proyector con sala oscura, glare. Mitigación: `forest-print.css` para impresión y `.dark-surface` para zonas hero contrastadas.
- Vendoring → no recibimos hotfixes automáticos del DS. Aceptado: el DS es estable v1.0 y la actividad tiene horizonte corto.
- Lock-in con Tailwind v4 → si quisiéramos cambiar a otro stack CSS, perdemos el DS. Aceptado: no hay razón para cambiar.

## Reglas heredadas (no negociables)

1. Light mode ONLY. Nunca `dark:` ni `prefers-color-scheme: dark`.
2. Forest `#04202C` es el color primario.
3. Fondo de página: `bg-gray-50` (`#F7F8F7`).
4. Fuente mínima: 12px (`text-xs`).
5. Iconos: SVG inline siempre.
6. Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)`.

## Mapeo a la rúbrica del profesor

- **C4 (redacción/formato)**: el portal con DS coherente refuerza la percepción de trabajo académico cuidado.
- **C2 / C3 (visualización del rover y escenarios)**: glassmorphism + animaciones `stagger-children` dan claridad a las topologías y a la presentación paso-a-paso del plan.
- **C1 (Snake)**: `.tabs` + `.card-section` permiten organizar "instalación / ejecución / plan" sin que el profesor se pierda.

## Revisión

Si en sprint 1 detectamos fricción inesperada con Angular 19 standalone + DS, se abre ADR-006 y se evalúa alternativa. Decisión activa por defecto.
