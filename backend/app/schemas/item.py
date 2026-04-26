import uuid
from typing import Optional

from pydantic import BaseModel


class ItemUploadResponse(BaseModel):
    """Schema returned after a wardrobe item is successfully uploaded and processed."""

    item_id: uuid.UUID
    image_url: str
    segmented_url: Optional[str] = None
    tags: list[str] = []

    model_config = {"from_attributes": True}


class RecommendationRequest(BaseModel):
    """Schema for requesting outfit recommendations."""

    user_id: uuid.UUID
    occasion: str
    weather: str
    top_k: int = 5


class OutfitRecommendation(BaseModel):
    """Schema representing a single ranked outfit recommendation."""

    outfit_id: str
    items: list[ItemUploadResponse]
    score: float


class TryOnRequest(BaseModel):
    """Schema for initiating a virtual try-on job."""

    user_id: uuid.UUID
    outfit_id: str
    user_photo_url: str


class TryOnResponse(BaseModel):
    """Schema representing the status and result of a try-on job."""

    job_id: str
    status: str  # queued | processing | done | failed
    result_url: Optional[str] = None
