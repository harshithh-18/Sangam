"""Celery application (async jobs — PROJECT_CONTEXT.md §7)."""
from __future__ import annotations

from celery import Celery

from .config import settings

celery_app = Celery(
    "jaldrishti",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks"],
)

celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,
)
