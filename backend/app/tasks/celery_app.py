from __future__ import annotations

import logging
from typing import Any

from celery import Celery

from app.config import settings

logger = logging.getLogger(__name__)

celery_app = Celery(
    "smart_robe",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)


@celery_app.task(bind=True, name="tasks.run_tryon_task")
def run_tryon_task(
    self,
    job_id: str,
    user_photo_url: str,
    outfit_id: str,
) -> dict[str, Any]:
    """
    Celery task that executes the virtual try-on pipeline.

    Parameters
    ----------
    job_id:         Unique identifier for this try-on job (used as Celery task ID).
    user_photo_url: URL of the user's full-body photo.
    outfit_id:      Identifier of the outfit to try on.

    Returns
    -------
    dict
        ``{"result_url": str}`` on success.
    """
    logger.info("Starting try-on task job_id=%s outfit_id=%s", job_id, outfit_id)
    self.update_state(state="STARTED", meta={"job_id": job_id})

    try:
        from app.services.tryon import TryOnService

        service = TryOnService()
        result_path = service.run_tryon(
            user_photo_url=user_photo_url,
            outfit_items=[{"image_url": outfit_id}],
        )
        logger.info("Try-on task %s completed: %s", job_id, result_path)
        return {"result_url": result_path}
    except Exception as exc:
        logger.error("Try-on task %s failed: %s", job_id, exc)
        raise
