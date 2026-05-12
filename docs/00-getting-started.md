# Getting started — guía de onboarding del equipo

Lectura obligatoria para cualquier integrante antes de tocar el código.

## Antes de empezar — leer

1. `.nxt-ai/constitution.md` — invariantes del proyecto (10 artículos)
2. `.nxt-ai/steering/product.md` — qué construimos y por qué
3. `.nxt-ai/steering/tech-stack.md` — stack pinneado
4. `.nxt-ai/steering/design-system.md` — Forest DS y reglas heredadas
5. `.nxt-ai/features/FEAT-001-portal-actividad3/feature-spec.md` — spec EARS

## Tu primer día

### 1. Setup del entorno

```bash
# Clonar
git clone <repo> portal-planificacion-act3
cd portal-planificacion-act3

# Python (backend)
cd apps/backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/macOS
pip install -e ".[dev]"
pytest                          # debe pasar todos los tests
cd ../..

# Node (frontend)
cd apps/frontend
npm install
npm run build                   # build de validación
cd ../..

# Docker (Redis + backend + worker)
cp .env.example .env
docker compose up redis backend worker
```

### 2. Verificar que todo arrancó

| URL | Esperado |
|---|---|
| http://localhost:8000/health | `{"status":"ok"}` |
| http://localhost:8000/docs | OpenAPI Swagger |
| http://localhost:4200 | Portal Angular |
| http://localhost:4200/rover | Página del rover con domain.pddl visible |

### 3. Decide tu rol

| Rol | Responsable de | Archivos clave |
|---|---|---|
| Líder infra | Singularity + Snake (C1) | `infra/singularity/`, capturas |
| Líder modelado | `domain.pddl` + decisiones ADR | `entregables/pddl/domain.pddl`, `docs/01-*` |
| Líder redacción | Reporte APA (C4) | `entregables/reporte/` |
| Líder integrante N | Su escenario alternativo (C3) | `entregables/pddl/problem-N.pddl` + `/escenarios/<su-slug>` |

## Reglas no-negociables

- **No tocar `.nxt-ai/constitution.md`** sin ADR.
- **No agregar librerías de UI** (Material, PrimeNG…) — solo Forest DS.
- **No usar `dark:` ni `prefers-color-scheme: dark`**.
- **No subir capturas pesadas** (> 1 MB) — comprimir antes con pngquant o similar.
- **No commitear `.env`** (está en `.gitignore`).
- **No mergear sin revisión** de al menos otro integrante.
- **Conventional Commits**: `feat(rover): ...`, `fix(backend): ...`, `docs(pddl): ...`.

## Flujo típico de trabajo

```bash
# 1. Crear rama
git checkout -b feat/<area>-<descripcion>

# 2. Trabajar
# ...editar archivos...

# 3. Validar localmente
cd apps/backend && pytest && ruff check src tests
cd ../frontend && npm run build

# 4. Commit con conventional commit
git add <archivos-específicos>
git commit -m "feat(rover): añadir visualización del grafo SVG"

# 5. Push y PR
git push -u origin feat/<area>-<descripcion>
```

## Si te bloqueas

| Síntoma | Mira |
|---|---|
| Backend no arranca | `apps/backend/README.md` |
| Frontend no compila | `apps/frontend/README.md` |
| Singularity falla | `infra/singularity/README.md` |
| PDDL no parsea | `docs/01-pddl-modeling-decisions.md` |
| Plan generado raro | Re-leer `entregables/pddl/README.md` y verificar precondiciones |
| No sabes qué hacer | Lee `.nxt-ai/features/FEAT-001-portal-actividad3/feature-spec.md` §AC |

## Hitos del proyecto

Ver `.nxt-ai/steering/product.md` § Hitos.
