"""
Virtual try-on service with pluggable providers.

Supported providers (controlled by TRYON_PROVIDER env var):
- "mock"      – instant placeholder, no API key required (default for development)
- "local"     – Stable Diffusion img2img running locally via diffusion_pipeline.py
- "replicate" – Cloud API via Replicate (requires REPLICATE_API_TOKEN)
"""
from __future__ import annotations

import logging
import urllib.request
from pathlib import Path
from typing import Any, Protocol

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Provider protocol
# ─────────────────────────────────────────────────────────────────────────────

class TryOnProvider(Protocol):
    """Interface that every try-on provider must implement."""

    def generate(
        self,
        user_photo_url: str,
        garment_image_url: str,
        garment_description: str = "",
    ) -> str:
        """
        Produce a virtual try-on image.

        Returns
        -------
        str
            HTTP-accessible URL (or local path) to the result image.
        """
        ...


# ─────────────────────────────────────────────────────────────────────────────
# Mock provider (development / no API key)
# ─────────────────────────────────────────────────────────────────────────────

class MockTryOnProvider:
    """
    Instant placeholder provider that returns a public sample image URL.
    Useful for UI development without any API key or GPU.
    """

    # A freely-available placeholder fashion image
    _PLACEHOLDER_URL = (
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64"
        "?w=512&auto=format&fit=crop"
    )

    def generate(
        self,
        user_photo_url: str,
        garment_image_url: str,
        garment_description: str = "",
    ) -> str:
        logger.info(
            "MockTryOnProvider: returning placeholder for user_photo=%s garment=%s",
            user_photo_url,
            garment_image_url,
        )
        return self._PLACEHOLDER_URL


# ─────────────────────────────────────────────────────────────────────────────
# Local Stable Diffusion provider
# ─────────────────────────────────────────────────────────────────────────────

class LocalTryOnProvider:
    """
    Virtual try-on via a locally-running Stable Diffusion img2img pipeline.

    Requires the ``diffusers`` package and a CUDA-capable GPU for reasonable
    performance.  Falls back gracefully to CPU if no GPU is available.
    """

    def generate(
        self,
        user_photo_url: str,
        garment_image_url: str,
        garment_description: str = "",
    ) -> str:
        from PIL import Image as PILImage

        from ml.tryon.diffusion_pipeline import TryOnDiffusionPipeline

        logger.info(
            "LocalTryOnProvider: running diffusion pipeline user_photo=%s garment=%s",
            user_photo_url,
            garment_image_url,
        )

        pipeline = TryOnDiffusionPipeline()

        user_img = _load_image(user_photo_url)
        garment_img = _load_image(garment_image_url)

        prompt = (
            garment_description
            or "A person wearing the outfit, high quality fashion photo"
        )
        result_img = pipeline.generate(user_img, garment_img, prompt=prompt)

        # Save result next to the user photo or in uploads/tryon/
        from app.config import settings

        out_dir = Path(settings.UPLOAD_DIR) / "tryon"
        out_dir.mkdir(parents=True, exist_ok=True)
        import uuid as _uuid
        out_path = out_dir / f"{_uuid.uuid4().hex}_tryon.png"
        pipeline.save_result(result_img, str(out_path))

        result_url = f"{settings.UPLOAD_BASE_URL}/uploads/tryon/{out_path.name}"
        return result_url


# ─────────────────────────────────────────────────────────────────────────────
# Replicate provider
# ─────────────────────────────────────────────────────────────────────────────

class ReplicateTryOnProvider:
    """
    Virtual try-on via the Replicate cloud API.

    Uses the IDM-VTON model (``cuuupid/idm-vton``) by default.
    Any Replicate model that accepts ``human_img`` / ``garm_img`` inputs and
    returns an image URL can be used by changing ``REPLICATE_TRYON_MODEL``.

    Requirements:
        pip install replicate
        Set REPLICATE_API_TOKEN in the environment.
    """

    def __init__(self, api_token: str, model_id: str) -> None:
        self.api_token = api_token
        self.model_id = model_id

    def generate(
        self,
        user_photo_url: str,
        garment_image_url: str,
        garment_description: str = "",
    ) -> str:
        try:
            import replicate
        except ImportError as exc:
            raise RuntimeError(
                "replicate package is required for the Replicate provider. "
                "Install it with: pip install replicate"
            ) from exc

        client = replicate.Client(api_token=self.api_token)

        logger.info(
            "ReplicateTryOnProvider: calling %s user_photo=%s garment=%s",
            self.model_id,
            user_photo_url,
            garment_image_url,
        )

        # Open the images as file-like objects so Replicate can upload them.
        # Both local paths and http(s) URLs are supported.
        user_img = _open_image_for_replicate(user_photo_url)
        garment_img = _open_image_for_replicate(garment_image_url)

        input_payload: dict[str, Any] = {
            "human_img": user_img,
            "garm_img": garment_img,
            "garment_des": garment_description or "fashion outfit",
            "is_checked": True,
            "is_checked_crop": False,
            "denoise_steps": 30,
            "seed": 42,
        }

        output = client.run(self.model_id, input=input_payload)

        # IDM-VTON returns a list; other models may return a string URL directly
        if isinstance(output, list):
            result_url = str(output[0])
        else:
            result_url = str(output)

        logger.info("ReplicateTryOnProvider: result_url=%s", result_url)
        return result_url


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _load_image(url_or_path: str):  # -> PIL.Image.Image
    """Open an image from a local path or HTTP(S) URL as a PIL Image."""
    from PIL import Image

    if url_or_path.startswith("http://") or url_or_path.startswith("https://"):
        import io
        with urllib.request.urlopen(url_or_path) as resp:  # noqa: S310
            return Image.open(io.BytesIO(resp.read())).convert("RGB")
    return Image.open(url_or_path).convert("RGB")


def _open_image_for_replicate(url_or_path: str):
    """Return an open file handle suitable for the Replicate SDK."""
    if url_or_path.startswith("http://") or url_or_path.startswith("https://"):
        # Replicate SDK accepts HTTP URLs directly
        return url_or_path
    # Local path: open as binary file
    return open(url_or_path, "rb")  # noqa: WPS515


# ─────────────────────────────────────────────────────────────────────────────
# Service facade
# ─────────────────────────────────────────────────────────────────────────────

class TryOnService:
    """
    Application-layer wrapper that selects the configured try-on provider
    and delegates image generation to it.

    Provider selection is driven by the ``TRYON_PROVIDER`` environment variable:
    - ``"mock"``      → :class:`MockTryOnProvider`
    - ``"local"``     → :class:`LocalTryOnProvider`
    - ``"replicate"`` → :class:`ReplicateTryOnProvider`
    """

    def __init__(self) -> None:
        from app.config import settings

        provider_name = settings.TRYON_PROVIDER.lower()
        if provider_name == "replicate":
            if not settings.REPLICATE_API_TOKEN:
                raise RuntimeError(
                    "REPLICATE_API_TOKEN must be set when using TRYON_PROVIDER=replicate"
                )
            self._provider: TryOnProvider = ReplicateTryOnProvider(
                api_token=settings.REPLICATE_API_TOKEN,
                model_id=settings.REPLICATE_TRYON_MODEL,
            )
        elif provider_name == "local":
            self._provider = LocalTryOnProvider()
        else:
            if provider_name != "mock":
                logger.warning(
                    "Unknown TRYON_PROVIDER=%r; falling back to mock provider",
                    provider_name,
                )
            self._provider = MockTryOnProvider()

        logger.info("TryOnService using provider: %s", type(self._provider).__name__)

    def run_tryon(
        self,
        user_photo_url: str,
        outfit_items: list[dict[str, Any]],
        garment_description: str = "",
    ) -> str:
        """
        Compose the user photo with the provided outfit items.

        Parameters
        ----------
        user_photo_url:
            HTTP URL of the user's full-body photo (uploaded via /wardrobe/upload-photo).
        outfit_items:
            List of item dicts, each containing at least ``image_url``.
        garment_description:
            Optional text description passed to the provider as a generation hint.

        Returns
        -------
        str
            URL of the generated try-on result image.
        """
        if not outfit_items:
            raise ValueError("At least one outfit item is required for try-on")

        garment_url = outfit_items[0]["image_url"]
        return self._provider.generate(
            user_photo_url=user_photo_url,
            garment_image_url=garment_url,
            garment_description=garment_description,
        )
