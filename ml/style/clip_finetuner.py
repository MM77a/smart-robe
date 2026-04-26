"""CLIP fine-tuning with InfoNCE contrastive loss."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import torch
import torch.nn.functional as F
from torch import Tensor
from torch.utils.data import DataLoader
from transformers import CLIPModel, CLIPProcessor

logger = logging.getLogger(__name__)


class CLIPFinetuner:
    """
    Fine-tune a CLIP model on fashion image-text pairs using the InfoNCE
    (Noise-Contrastive Estimation) loss.

    Parameters
    ----------
    model_name:
        HuggingFace model identifier, default ``openai/clip-vit-base-patch32``.
    device:
        ``"cuda"`` if a GPU is available, otherwise ``"cpu"``.
    """

    def __init__(
        self,
        model_name: str = "openai/clip-vit-base-patch32",
        device: str | None = None,
    ) -> None:
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        logger.info("CLIPFinetuner using device=%s", self.device)

        self.processor: CLIPProcessor = CLIPProcessor.from_pretrained(model_name)
        self.model: CLIPModel = CLIPModel.from_pretrained(model_name).to(self.device)

    # ------------------------------------------------------------------
    # Loss
    # ------------------------------------------------------------------

    def info_nce_loss(
        self,
        embeddings_a: Tensor,
        embeddings_b: Tensor,
        temperature: float = 0.07,
    ) -> Tensor:
        """
        Compute symmetric InfoNCE (contrastive) loss between two embedding sets.

        Both ``embeddings_a`` and ``embeddings_b`` must already be L2-normalised
        and have shape ``(batch_size, embedding_dim)``.

        Parameters
        ----------
        embeddings_a:  Image (or text) embeddings – shape ``(N, D)``.
        embeddings_b:  Paired text (or image) embeddings – shape ``(N, D)``.
        temperature:   Softmax temperature τ.

        Returns
        -------
        Tensor
            Scalar loss value.
        """
        # Normalise (guard against un-normalised inputs)
        a = F.normalize(embeddings_a, dim=-1)
        b = F.normalize(embeddings_b, dim=-1)

        # Similarity matrix: (N, N)
        logits = torch.matmul(a, b.T) / temperature

        # Targets: diagonal (positive pairs)
        labels = torch.arange(logits.size(0), device=self.device)

        # Symmetric cross-entropy
        loss_a = F.cross_entropy(logits, labels)
        loss_b = F.cross_entropy(logits.T, labels)
        return (loss_a + loss_b) / 2.0

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train_step(
        self,
        batch_images: list[Any],
        batch_texts: list[str],
    ) -> Tensor:
        """
        Execute a single gradient-update step.

        Parameters
        ----------
        batch_images: List of PIL images (or file paths).
        batch_texts:  Corresponding text descriptions.

        Returns
        -------
        Tensor
            Scalar loss for this batch.
        """
        inputs = self.processor(
            text=batch_texts,
            images=batch_images,
            return_tensors="pt",
            padding=True,
            truncation=True,
        ).to(self.device)

        outputs = self.model(**inputs)
        image_embeds = outputs.image_embeds   # (N, D)
        text_embeds = outputs.text_embeds     # (N, D)

        loss = self.info_nce_loss(image_embeds, text_embeds)
        return loss

    def train(
        self,
        dataloader: DataLoader,
        epochs: int = 10,
        lr: float = 1e-5,
    ) -> list[float]:
        """
        Full training loop over the provided dataloader.

        Parameters
        ----------
        dataloader: PyTorch DataLoader yielding ``(images, texts)`` batches.
        epochs:     Number of training epochs.
        lr:         AdamW learning rate.

        Returns
        -------
        list[float]
            Per-epoch average loss values.
        """
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=lr)
        self.model.train()
        epoch_losses: list[float] = []

        for epoch in range(epochs):
            running_loss = 0.0
            num_batches = 0
            for images, texts in dataloader:
                optimizer.zero_grad()
                loss = self.train_step(images, texts)
                loss.backward()
                optimizer.step()
                running_loss += loss.item()
                num_batches += 1

            avg = running_loss / max(num_batches, 1)
            epoch_losses.append(avg)
            logger.info("Epoch %d/%d  loss=%.4f", epoch + 1, epochs, avg)

        self.model.eval()
        return epoch_losses

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str) -> None:
        """Save model and processor to *path*."""
        Path(path).mkdir(parents=True, exist_ok=True)
        self.model.save_pretrained(path)
        self.processor.save_pretrained(path)
        logger.info("CLIPFinetuner saved to %s", path)

    def load(self, path: str) -> None:
        """Load model and processor from *path*."""
        self.processor = CLIPProcessor.from_pretrained(path)
        self.model = CLIPModel.from_pretrained(path).to(self.device)
        self.model.eval()
        logger.info("CLIPFinetuner loaded from %s", path)
