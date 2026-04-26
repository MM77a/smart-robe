import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.item import TryOnRequest, TryOnResponse
from app.tasks.celery_app import run_tryon_task

router = APIRouter()


@router.post("", response_model=TryOnResponse)
async def start_tryon(
    request: TryOnRequest,
    db: AsyncSession = Depends(get_db),
) -> TryOnResponse:
    """
    Enqueue a virtual try-on Celery task and return the job ID immediately.
    The client should poll GET /tryon/{job_id} to check job status.
    """
    job_id = str(uuid.uuid4())
    run_tryon_task.apply_async(
        args=[job_id, request.user_photo_url, str(request.outfit_id)],
        task_id=job_id,
    )
    return TryOnResponse(job_id=job_id, status="queued")


@router.get("/{job_id}", response_model=TryOnResponse)
async def get_tryon_status(
    job_id: str,
) -> TryOnResponse:
    """
    Poll the status of a try-on job by its job ID.
    Returns the result URL once the job has completed successfully.
    """
    from celery.result import AsyncResult
    from app.tasks.celery_app import celery_app

    result = AsyncResult(job_id, app=celery_app)

    status_map = {
        "PENDING": "queued",
        "STARTED": "processing",
        "SUCCESS": "done",
        "FAILURE": "failed",
    }
    status = status_map.get(result.state, "queued")
    result_url: str | None = None

    if result.state == "SUCCESS" and isinstance(result.result, dict):
        result_url = result.result.get("result_url")
    elif result.state == "FAILURE":
        raise HTTPException(status_code=500, detail="Try-on job failed")

    return TryOnResponse(job_id=job_id, status=status, result_url=result_url)
