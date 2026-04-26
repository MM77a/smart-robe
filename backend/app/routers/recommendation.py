import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.item import OutfitRecommendation
from app.services.recommendation import RecommendationService

router = APIRouter()

_recommendation_service = RecommendationService()


@router.get("", response_model=list[OutfitRecommendation])
async def get_recommendations(
    user_id: uuid.UUID = Query(..., description="UUID of the requesting user"),
    occasion: str = Query(..., description="Target occasion, e.g. 'casual', 'formal'"),
    weather: str = Query(..., description="Current weather, e.g. 'sunny', 'rainy'"),
    top_k: int = Query(5, ge=1, le=20, description="Number of outfit recommendations to return"),
    db: AsyncSession = Depends(get_db),
) -> list[OutfitRecommendation]:
    """
    Return the top-k outfit recommendations for a user given occasion and weather context.
    """
    outfits = await _recommendation_service.get_recommendations(
        db=db,
        user_id=user_id,
        occasion=occasion,
        weather=weather,
        top_k=top_k,
    )
    return outfits
