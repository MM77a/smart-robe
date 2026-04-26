"""Social-media trend crawler (placeholder with mock data)."""
from __future__ import annotations

import logging
import random
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

_MOCK_CAPTIONS = [
    "Loving this summer vibe ✨ #ootd #fashion",
    "Minimalist outfit of the day 🤍 #minimal #style",
    "Street style inspo 🔥 #streetwear #urban",
    "Casual Friday done right 👌 #casual #workwear",
    "Vintage vibes only 📸 #vintage #retro",
]

_MOCK_IMAGE_URLS = [
    "https://example.com/images/trend1.jpg",
    "https://example.com/images/trend2.jpg",
    "https://example.com/images/trend3.jpg",
    "https://example.com/images/trend4.jpg",
    "https://example.com/images/trend5.jpg",
]


class TrendCrawler:
    """
    Crawl social media platforms for fashion trend data.

    Real implementation notes:
    - **Instagram**: Use the Instagram Graph API (requires a Business/Creator
      account and approved app).  Endpoint: ``GET /hashtag/{id}/top_media``.
    - **Pinterest**: Use the Pinterest API v5.  Endpoint:
      ``GET /search/pins?query={hashtag}``.
    - Credentials must be provided via environment variables:
      ``INSTAGRAM_ACCESS_TOKEN``, ``PINTEREST_ACCESS_TOKEN``.

    Current implementation returns mock data so the pipeline can run
    end-to-end without API credentials.

    Parameters
    ----------
    platforms:
        List of platform names to crawl.  Supported: ``"instagram"``,
        ``"pinterest"``.
    """

    def __init__(self, platforms: list[str] | None = None) -> None:
        self.platforms = platforms or ["instagram", "pinterest"]

    def crawl(
        self,
        hashtags: list[str],
        max_items: int = 100,
    ) -> list[dict[str, Any]]:
        """
        Crawl trend data for the given *hashtags* across configured platforms.

        Parameters
        ----------
        hashtags:
            List of hashtag strings (without the ``#`` prefix).
        max_items:
            Maximum number of items to return across all platforms.

        Returns
        -------
        list[dict]
            Each entry contains:
            - ``image_url`` (str)
            - ``caption`` (str)
            - ``hashtags`` (list[str])
            - ``platform`` (str)
            - ``timestamp`` (str, ISO-8601)
        """
        logger.info(
            "Crawling %s for hashtags=%s (max_items=%d) – returning mock data",
            self.platforms,
            hashtags,
            max_items,
        )

        results: list[dict[str, Any]] = []
        for i in range(min(max_items, 20)):
            platform = random.choice(self.platforms)
            caption = random.choice(_MOCK_CAPTIONS)
            results.append(
                {
                    "image_url": random.choice(_MOCK_IMAGE_URLS),
                    "caption": caption,
                    "hashtags": hashtags + [f"mock{i}"],
                    "platform": platform,
                    "timestamp": datetime.now(tz=timezone.utc).isoformat(),
                }
            )

        return results
