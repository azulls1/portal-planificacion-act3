# Celery — cola de tareas asíncronas

El worker Celery procesa ejecuciones del planner PDDL (que pueden tardar minutos).

## Arranque local (sin Docker)

```bash
# Terminal 1: Redis
redis-server --port 6379

# Terminal 2: backend FastAPI
cd apps/backend
uvicorn portal_act3.main:app --reload

# Terminal 3: worker Celery
cd apps/backend
celery -A portal_act3.tasks.celery_app.celery_app worker --loglevel=info -P solo
# (En Windows usar -P solo. En Linux por defecto usa prefork.)
```

## Arranque con Docker Compose

```bash
docker compose up redis backend worker
```

## Monitor (opcional)

Flower expone una UI web para inspeccionar el estado de tareas:

```bash
celery -A portal_act3.tasks.celery_app.celery_app flower --port=5555
# luego abrir http://localhost:5555
```

## Configuración

| Setting | Valor por defecto | Notas |
|---|---|---|
| broker | `redis://localhost:6379/0` | configurable vía `CELERY_BROKER_URL` |
| result_backend | `redis://localhost:6379/1` | DB separada |
| task_time_limit | 7200 s | hard kill |
| task_soft_time_limit | 1800 s | SIGTERM a la tarea |
| worker_max_tasks_per_child | 50 | recicla procesos |

## Debugging

Si el worker no toma tareas:

1. Verificar Redis: `redis-cli ping` → `PONG`
2. Verificar visibilidad de la tarea: `celery -A portal_act3.tasks.celery_app.celery_app inspect registered`
3. Revisar `task_serializer` (json) y `accept_content` (json) — incompatibles con pickle del default.
