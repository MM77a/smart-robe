"""ViT feature extraction utilities."""
from __future__ import annotations

import logging
from typing import List

import numpy as np
import torch
from PIL import Image
from transformers import ViTFeatureExtractor, ViTModel

logger = logging.getLogger(__name__)

_MODEL_NAME = "google/vit-base-patch16-224"


class ViTExtractor:
    """
    Extract 768-dimensional CLS token features from images using a
    pretrained Vision Transformer (ViT-Base/16).

    Parameters
    ----------
    model_name:
        HuggingFace model identifier for the ViT checkpoint.
    device:
        Compute device, inferred automatically when ``None``.
    """

    def __init__(
        self,
        model_name: str = _MODEL_NAME,
        device: str | None = None,
    ) -> None:
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        logger.info("ViTExtractor loading %s on %s", model_name, self.device)

        self._feature_extractor = ViTFeatureExtractor.from_pretrained(model_name)
        self._model = ViTModel.from_pretrained(model_name).to(self.device)
        self._model.eval()

    def extract(self, image: Image.Image) -> np.ndarray:
        """
        Extract a (768,) feature vector from a single PIL image.

        Parameters
        ----------
        image:
            RGB PIL image.

        Returns
        -------
        np.ndarray
            Shape ``(768,)`` CLS token embedding.
        """
        inputs = self._feature_extractor(images=image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self._model(**inputs)
        # CLS token is the first token of the last hidden state
        cls_embedding = outputs.last_hidden_state[:, 0, :].squeeze(0)
        return cls_embedding.cpu().numpy()

    def extract_batch(self, images: List[Image.Image]) -> np.ndarray:
        """
        Extract feature vectors for a batch of PIL images.

        Parameters
        ----------
        images:
            List of RGB PIL images.

        Returns
        -------
        np.ndarray
            Shape ``(N, 768)`` array of CLS token embeddings.
        """
        inputs = self._feature_extractor(images=images, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self._model(**inputs)
        cls_embeddings = outputs.last_hidden_state[:, 0, :]
        return cls_embeddings.cpu().numpy()
