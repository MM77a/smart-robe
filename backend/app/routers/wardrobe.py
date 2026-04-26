import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.models.item import WardrobeItem
from app.schemas.item import ItemUploadResponse, PhotoUploadResponse
from app.services.embedding import CLIPEmbeddingService
from app.services.segmentation import SAMSegmentationService

router = APIRouter()

_segmentation_service = SAMSegmentationService()
_embedding_service = CLIPEmbeddingService()


def _save_upload(file_content: bytes, original_filename: str, sub_dir: str = "") -> tuple[str, str]:
    """
    Persist *file_content* to UPLOAD_DIR and return ``(local_path, http_url)``.

    Parameters
    ----------
    file_content:      Raw bytes of the uploaded file.
    original_filename: Original file name (used only for the extension).
    sub_dir:           Optional sub-directory within UPLOAD_DIR (e.g. "wardrobe", "photos").
    """
    ext = Path(original_filename).suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_dir = Path(settings.UPLOAD_DIR) / sub_dir if sub_dir else Path(settings.UPLOAD_DIR)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / filename
    dest_path.write_bytes(file_content)

    relative = f"{sub_dir}/{filename}" if sub_dir else filename
    http_url = f"{settings.UPLOAD_BASE_URL}/uploads/{relative}"
    return str(dest_path), http_url


@router.post("/upload", response_model=ItemUploadResponse)
async def upload_wardrobe_item(
    user_id: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    db: AsyncSession = Depends(get_db),
) -> ItemUploadResponse:
    """
    Accept a multipart image upload, run SAM segmentation + CLIP embedding,
    persist the WardrobeItem to the database, and return the response schema.
    """
    content = await file.read()
    local_path, image_url = _save_upload(content, file.filename or "upload.jpg", "wardrobe")

    # Segment clothing from the image
    segmented_local = _segmentation_service.segment(local_path)

    # Build HTTP URL for the segmented image
    seg_filename = Path(segmented_local).name
    segmented_url = f"{settings.UPLOAD_BASE_URL}/uploads/wardrobe/{seg_filename}"

    # Generate CLIP embedding from segmented image
    embedding = _embedding_service.embed_image(segmented_local)

    item = WardrobeItem(
        user_id=uuid.UUID(user_id),
        image_url=image_url,
        segmented_url=segmented_url,
        embedding=embedding,
        tags=[],
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return ItemUploadResponse(
        item_id=item.id,
        image_url=item.image_url,
        segmented_url=item.segmented_url,
        tags=item.tags or [],
    )


@router.get("", response_model=list[ItemUploadResponse])
async def list_wardrobe_items(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[ItemUploadResponse]:
    """Return all wardrobe items belonging to *user_id*."""
    result = await db.execute(
        select(WardrobeItem).where(WardrobeItem.user_id == user_id)
    )
    items = list(result.scalars().all())
    return [
        ItemUploadResponse(
            item_id=item.id,
            image_url=item.image_url,
            segmented_url=item.segmented_url,
            tags=item.tags or [],
        )
        for item in items
    ]


@router.post("/upload-photo", response_model=PhotoUploadResponse)
async def upload_user_photo(
    file: Annotated[UploadFile, File()],
) -> PhotoUploadResponse:
    """
    Upload a full-body user photo for virtual try-on.

    The image is stored in the uploads directory and an HTTP-accessible URL
    is returned so the backend can pass it to the try-on provider.
    """
    content = await file.read()
    _local_path, photo_url = _save_upload(content, file.filename or "photo.jpg", "photos")
    return PhotoUploadResponse(photo_url=photo_url)
