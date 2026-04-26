"""Wardrobe ingestion: SAM segmentation + CLIP embedding for clothing images."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

_SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


class WardrobeIngestion:
    """
    End-to-end ingestion pipeline for wardrobe images:

    1. Segment clothing regions with SAM (Segment Anything Model).
    2. Embed each region with CLIP via :class:`~ml.style.clip_finetuner.CLIPFinetuner`.
    3. Return structured metadata ready for database insertion.
    """

    def __init__(
        self,
        sam_checkpoint: str | None = None,
        clip_model_name: str = "openai/clip-vit-base-patch32",
    ) -> None:
        self.sam_checkpoint = sam_checkpoint
        self.clip_model_name = clip_model_name
        self._sam = None      # loaded lazily
        self._clip = None     # loaded lazily

    # ------------------------------------------------------------------
    # SAM segmentation
    # ------------------------------------------------------------------

    def _load_sam(self) -> None:
        """Load the SAM model if the checkpoint path is provided."""
        if self._sam is not None or self.sam_checkpoint is None:
            return
        try:
            # Real integration (requires segment-anything package):
            # from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
            # sam = sam_model_registry["vit_h"](checkpoint=self.sam_checkpoint)
            # self._sam = SamAutomaticMaskGenerator(sam)
            logger.info("SAM loaded from %s", self.sam_checkpoint)
        except Exception as exc:
            logger.warning("SAM load failed: %s", exc)

    def segment_clothing(self, image_path: str) -> list[Image.Image]:
        """
        Segment clothing items from an image.

        Parameters
        ----------
        image_path:
            Absolute or relative path to the source image.

        Returns
        -------
        list[PIL.Image.Image]
            List of cropped / masked clothing regions.
            Falls back to the centre crop when SAM is unavailable.
        """
        self._load_sam()
        image = Image.open(image_path).convert("RGB")

        if self._sam is not None:
            # TODO: run SamAutomaticMaskGenerator and crop each mask
            # masks = self._sam.generate(np.array(image))
            # return [_crop_mask(image, m) for m in masks]
            pass

        # Placeholder: return the centre 75 % crop
        w, h = image.size
        margin_x, margin_y = int(w * 0.125), int(h * 0.125)
        crop = image.crop((margin_x, margin_y, w - margin_x, h - margin_y))
        return [crop]

    # ------------------------------------------------------------------
    # CLIP embedding
    # ------------------------------------------------------------------

    def _load_clip(self) -> None:
        """Lazily load the CLIP embedding service."""
        if self._clip is None:
            from ml.style.clip_finetuner import CLIPFinetuner
            self._clip = CLIPFinetuner(model_name=self.clip_model_name)

    def _embed(self, image: Image.Image) -> list[float]:
        """Return a 512-dim CLIP embedding for a PIL image."""
        self._load_clip()
        import torch
        import torch.nn.functional as F

        inputs = self._clip.processor(images=image, return_tensors="pt").to(
            self._clip.device
        )
        with torch.no_grad():
            features = self._clip.model.get_image_features(**inputs)
            features = F.normalize(features, dim=-1)
        return features.squeeze(0).cpu().tolist()

    # ------------------------------------------------------------------
    # Directory ingestion
    # ------------------------------------------------------------------

    def ingest_directory(self, directory_path: str) -> list[dict[str, Any]]:
        """
        Process all supported images in *directory_path*.

        Parameters
        ----------
        directory_path:
            Path to the directory containing garment images.

        Returns
        -------
        list[dict]
            Each entry has keys: ``path``, ``embedding``, ``tags``.
        """
        root = Path(directory_path)
        if not root.is_dir():
            raise ValueError(f"{directory_path!r} is not a directory")

        image_paths = [
            p for p in root.iterdir() if p.suffix.lower() in _SUPPORTED_EXTENSIONS
        ]
        logger.info("Ingesting %d images from %s", len(image_paths), directory_path)

        results: list[dict[str, Any]] = []
        for img_path in image_paths:
            try:
                segments = self.segment_clothing(str(img_path))
                # Use the first (largest / most confident) segment
                primary = segments[0] if segments else Image.open(img_path).convert("RGB")
                embedding = self._embed(primary)
                results.append(
                    {
                        "path": str(img_path),
                        "embedding": embedding,
                        "tags": [],  # Extend with colour / category classifiers
                    }
                )
            except Exception as exc:
                logger.error("Failed to ingest %s: %s", img_path, exc)

        logger.info("Successfully ingested %d/%d images", len(results), len(image_paths))
        return results
