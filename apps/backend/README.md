# Backend — Portal Actividad 3

FastAPI + Celery + Redis + Supabase. Encola ejecuciones de planners PDDL sobre Singularity.

## Arranque local

```bash
cd apps/backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/macOS
pip install -e ".[dev]"
cp ../../.env.example ../../.env
uvicorn portal_act3.main:app --reload
```

API en `http://localhost:8000`. OpenAPI en `/docs`.

## Worker Celery

En otra terminal:

```bash
celery -A portal_act3.tasks.celery_app.celery_app worker --loglevel=info -P solo
# (-P solo en Windows; en Linux usar prefork)
```

## Tests

```bash
pytest
ruff check src tests
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Liveness |
| POST | `/api/plan-runs` | Encolar ejecución del planner |
| GET | `/api/plan-runs/{run_id}` | Consultar estado/resultado |
| GET | `/api/plan-runs` | Listar runs |
| GET | `/api/pddl-files` | Listar archivos PDDL del repo |
| GET | `/api/pddl-files/{slug}` | Descargar contenido PDDL |
| GET | `/api/scenarios/team` | Integrantes del equipo |
| GET | `/api/scenarios` | Escenarios alternativos |
| GET | `/api/scenarios/{member_slug}` | Escenario de un integrante |
