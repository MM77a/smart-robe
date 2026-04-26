from __future__ import annotations

import logging
import uuid
from typing import Any

import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.item import WardrobeItem
from app.models.user import User
from app.schemas.item import ItemUploadResponse, OutfitRecommendation

logger = logging.getLogger(__name__)


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Return the cosine similarity between two embedding vectors."""
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    denom = (np.linalg.norm(va) * np.linalg.norm(vb))
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


class RecommendationService:
    """
    Service that recommends outfits for a user based on cosine similarity
    between the user's style embedding and wardrobe item embeddings.
    """

    async def get_recommendations(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        occasion: str,
        weather: str,
        top_k: int = 5,
    ) -> list[OutfitRecommendation]:
        """
        Retrieve wardrobe items for *user_id* from the database, score each
        item against the user's style embedding (stored in style_profile),
        and return the *top_k* highest-scoring outfits.

        Parameters
        ----------
        db:       Async SQLAlchemy session.
        user_id:  UUID of the requesting user.
        occasion: Occasion string (e.g. 'casual', 'formal').
        weather:  Weather string (e.g. 'sunny', 'rainy').
        top_k:    Number of outfit recommendations to return.
        """
        # Load user
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        user_embedding: list[float] | None = None
        if user and user.style_profile:
            user_embedding = user.style_profile.get("embedding")

        # Load items
        items_result = await db.execute(
            select(WardrobeItem).where(WardrobeItem.user_id == user_id)
        )
        items: list[WardrobeItem] = list(items_result.scalars().all())

        if not items:
            return []

        # Score items
        scored: list[tuple[WardrobeItem, float]] = []
        for item in items:
            if item.embedding and user_embedding:
                score = _cosine_similarity(user_embedding, item.embedding)
            else:
                score = 0.5  # neutral score when embedding is unavailable
            scored.append((item, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        top_items = scored[:top_k]

        # Build outfit recommendations (each item becomes its own "outfit" here;
        # a production system would cluster items into coherent outfits)
        outfits: list[OutfitRecommendation] = []
        for i, (item, score) in enumerate(top_items):
            outfit_item = ItemUploadResponse(
                item_id=item.id,
                image_url=item.image_url,
                segmented_url=item.segmented_url,
                tags=item.tags or [],
            )
            outfits.append(
                OutfitRecommendation(
                    outfit_id=f"outfit-{i}-{item.id}",
                    items=[outfit_item],
                    score=round(score, 4),
                )
            )

        return outfits
