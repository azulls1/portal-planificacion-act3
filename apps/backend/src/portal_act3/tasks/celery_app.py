"""Configuración del worker Celery."""

from celery import Celery

from portal_act3.config import get_settings

settings = get_settings()

celery_app = Celery(
    "portal_act3",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["portal_act3.tasks.run_planner"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=2 * 60 * 60,
    task_soft_time_limit=30 * 60,
    worker_max_tasks_per_child=50,
)
