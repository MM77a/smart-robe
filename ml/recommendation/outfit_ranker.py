"""Outfit ranking with cosine similarity and constraint-based filtering."""
from __future__ import annotations

import logging
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

# Rough color harmony groups (simplified)
_WARM_TONES = {"red", "orange", "yellow", "pink", "coral", "terracotta"}
_COOL_TONES = {"blue", "green", "purple", "teal", "navy", "mint"}
_NEUTRAL = {"white", "black", "grey", "gray", "beige", "brown", "cream"}


class OutfitRanker:
    """
    Rank and filter a set of candidate outfits based on:

    1. Cosine similarity between the user embedding and each outfit's aggregate embedding.
    2. Hard constraints (occasion, weather suitability).
    3. Soft colour-harmony scoring.
    """

    def rank_outfits(
        self,
        user_embedding: np.ndarray,
        outfit_embeddings: dict[str, np.ndarray],
        constraints: dict[str, Any],
    ) -> list[tuple[str, float]]:
        """
        Score and sort outfits by relevance to the user.

        Parameters
        ----------
        user_embedding:
            1-D array ``(D,)`` representing the user's style preference.
        outfit_embeddings:
            Mapping of ``outfit_id -> aggregate_embedding (D,)``.
        constraints:
            Dict with optional keys ``occasion``, ``weather``, ``color_harmony``.

        Returns
        -------
        list[tuple[str, float]]
            List of ``(outfit_id, score)`` sorted by descending score.
        """
        scored: list[tuple[str, float]] = []
        user_norm = user_embedding / (np.linalg.norm(user_embedding) + 1e-9)

        for outfit_id, outfit_emb in outfit_embeddings.items():
            outfit_norm = outfit_emb / (np.linalg.norm(outfit_emb) + 1e-9)
            cosine_score = float(np.dot(user_norm, outfit_norm))
            scored.append((outfit_id, cosine_score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored

    def apply_constraints(
        self,
        outfits: list[dict[str, Any]],
        occasion: str,
        weather: str,
        color_harmony: bool = True,
    ) -> list[dict[str, Any]]:
        """
        Filter and re-score outfits based on occasion, weather, and colour harmony.

        Parameters
        ----------
        outfits:
            List of outfit dicts, each with keys ``outfit_id``, ``items``, ``score``.
            Each item has optional ``tags`` list.
        occasion:
            Target occasion string (e.g. ``"formal"``, ``"casual"``).
        weather:
            Weather string (e.g. ``"rainy"``, ``"sunny"``, ``"cold"``).
        color_harmony:
            Whether to include the colour harmony bonus in the final score.

        Returns
        -------
        list[dict]
            Filtered and re-scored outfits, sorted by descending final score.
        """
        results: list[dict[str, Any]] = []

        for outfit in outfits:
            tags: list[str] = []
            for item in outfit.get("items", []):
                tags.extend(item.get("tags", []))
            tags_lower = [t.lower() for t in tags]

            # Hard filter: weather
            if weather == "rainy" and "waterproof" not in tags_lower and "raincoat" not in tags_lower:
                # Soft penalty rather than hard removal
                outfit = {**outfit, "score": outfit["score"] * 0.8}

            if weather == "cold" and "warm" not in tags_lower and "coat" not in tags_lower:
                outfit = {**outfit, "score": outfit["score"] * 0.85}

            # Colour harmony bonus
            if color_harmony:
                ch_score = self._color_harmony_score(outfit.get("items", []))
                outfit = {**outfit, "score": outfit["score"] * (1.0 + 0.1 * ch_score)}

            results.append(outfit)

        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def _color_harmony_score(self, items: list[dict[str, Any]]) -> float:
        """
        Compute a simple colour harmony score ``[0.0, 1.0]`` for a set of items.

        Rules:
        - All neutrals → 0.9 (safe, classic)
        - All warm tones → 0.8
        - All cool tones → 0.8
        - Mixed warm + cool → 0.4 (clash)
        - Anything with some neutrals → mild bonus
        """
        color_tags: list[str] = []
        for item in items:
            color_tags.extend(
                t.lower() for t in item.get("tags", [])
                if t.lower() in _WARM_TONES | _COOL_TONES | _NEUTRAL
            )

        if not color_tags:
            return 0.5  # unknown → neutral score

        warm = sum(1 for c in color_tags if c in _WARM_TONES)
        cool = sum(1 for c in color_tags if c in _COOL_TONES)
        neutral = sum(1 for c in color_tags if c in _NEUTRAL)
        total = warm + cool + neutral

        # Mostly neutrals
        if neutral / total >= 0.7:
            return 0.9
        # Mono-tone
        if warm > 0 and cool == 0:
            return 0.8
        if cool > 0 and warm == 0:
            return 0.8
        # Clash
        return 0.4
