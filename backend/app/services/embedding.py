from __future__ import annotations

import logging
from pathlib import Path
from typing import List

import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

logger = logging.getLogger(__name__)

_MODEL_NAME = "openai/clip-vit-base-patch32"


class CLIPEmbeddingService:
    """
    Service that wraps a CLIP model to generate image and text embeddings.

    The model is loaded lazily on first use to avoid slowing down startup.
    """

    def __init__(self, model_name: str = _MODEL_NAME) -> None:
        self.model_name = model_name
        self._model: CLIPModel | None = None
        self._processor: CLIPProcessor | None = None
        self._device = "cuda" if torch.cuda.is_available() else "cpu"

    def _load(self) -> None:
        """Load the CLIP model and processor from HuggingFace Hub."""
        if self._model is None:
            logger.info("Loading CLIP model %s on %s", self.model_name, self._device)
            self._processor = CLIPProcessor.from_pretrained(self.model_name)
            self._model = CLIPModel.from_pretrained(self.model_name).to(self._device)
            self._model.eval()

    def embed_image(self, image_path: str) -> List[float]:
        """
        Generate a normalised CLIP image embedding for the image at *image_path*.

        Returns
        -------
        list[float]
            512-dimensional feature vector.
        """
        self._load()
        image = Image.open(image_path).convert("RGB")
        inputs = self._processor(images=image, return_tensors="pt").to(self._device)
        with torch.no_grad():
            features = self._model.get_image_features(**inputs)
            features = features / features.norm(dim=-1, keepdim=True)
        return features.squeeze(0).cpu().tolist()

    def embed_text(self, text: str) -> List[float]:
        """
        Generate a normalised CLIP text embedding for the given *text*.

        Returns
        -------
        list[float]
            512-dimensional feature vector.
        """
        self._load()
        inputs = self._processor(text=[text], return_tensors="pt", padding=True).to(
            self._device
        )
        with torch.no_grad():
            features = self._model.get_text_features(**inputs)
            features = features / features.norm(dim=-1, keepdim=True)
        return features.squeeze(0).cpu().tolist()
