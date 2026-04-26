import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.item import WardrobeItem
from app.schemas.item import ItemUploadResponse
from app.services.embedding import CLIPEmbeddingService
from app.services.segmentation import SAMSegmentationService

router = APIRouter()

_segmentation_service = SAMSegmentationService()
_embedding_service = CLIPEmbeddingService()


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
    # Persist the raw upload to a temporary local path
    import os, tempfile
    suffix = os.path.splitext(file.filename or "upload.jpg")[1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # Segment clothing from the image
    segmented_path = _segmentation_service.segment(tmp_path)

    # Generate CLIP embedding from segmented image
    embedding = _embedding_service.embed_image(segmented_path)

    # In production, upload both images to S3 and store the URLs.
    # For now we use local file paths as placeholder URLs.
    image_url = f"file://{tmp_path}"
    segmented_url = f"file://{segmented_path}"

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
