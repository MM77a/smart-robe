from __future__ import annotations

import logging
import shutil
from pathlib import Path

logger = logging.getLogger(__name__)


class SAMSegmentationService:
    """
    Service that segments clothing from a garment image using SAM
    (Segment Anything Model).

    Real implementation:
        - Load the SAM ViT-H checkpoint from ``sam_vit_h_4b8939.pth``
        - Run ``SamPredictor`` on the image
        - Use an automatic mask generator or prompt-based segmentation
          to isolate the clothing item
        - Apply the binary mask to produce a transparent PNG

    Current placeholder:
        Copies the source image to a ``_segmented`` variant so that the
        rest of the pipeline can run end-to-end without the checkpoint.
    """

    def __init__(self, checkpoint_path: str | None = None) -> None:
        self.checkpoint_path = checkpoint_path
        self._model = None  # populated lazily when checkpoint is present

    def _load_model(self) -> None:
        """Attempt to load the SAM model if the checkpoint is available."""
        if self._model is not None or self.checkpoint_path is None:
            return
        try:
            # Real integration (requires segment-anything package):
            # from segment_anything import sam_model_registry, SamPredictor
            # sam = sam_model_registry["vit_h"](checkpoint=self.checkpoint_path)
            # self._model = SamPredictor(sam)
            logger.info("SAM checkpoint found at %s (integration pending)", self.checkpoint_path)
        except Exception as exc:
            logger.warning("Could not load SAM model: %s", exc)

    def segment(self, image_path: str) -> str:
        """
        Segment clothing from the image at *image_path*.

        Parameters
        ----------
        image_path:
            Path to the source image file.

        Returns
        -------
        str
            Path to the segmented output image.
        """
        self._load_model()

        src = Path(image_path)
        dst = src.with_stem(src.stem + "_segmented")

        if self._model is not None:
            # TODO: run SAM inference and save masked result to `dst`
            pass
        else:
            # Placeholder: copy original image unchanged
            shutil.copy2(src, dst)
            logger.debug("SAM placeholder: copied %s -> %s", src, dst)

        return str(dst)
