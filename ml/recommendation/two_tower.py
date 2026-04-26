"""Two-Tower neural recommendation model with BPR training loss."""
from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor


class UserTower(nn.Module):
    """
    Encode heterogeneous user features (user ID embedding + style vector +
    occasion + weather context) into a 128-dimensional user embedding.
    """

    def __init__(
        self,
        num_users: int,
        style_dim: int = 512,
        num_occasions: int = 10,
        num_weather: int = 8,
        embed_dim: int = 64,
        output_dim: int = 128,
    ) -> None:
        super().__init__()
        self.user_embed = nn.Embedding(num_users + 1, embed_dim, padding_idx=0)
        self.occasion_embed = nn.Embedding(num_occasions + 1, embed_dim, padding_idx=0)
        self.weather_embed = nn.Embedding(num_weather + 1, embed_dim, padding_idx=0)

        input_dim = embed_dim * 3 + style_dim
        self.mlp = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, output_dim),
        )

    def forward(
        self,
        user_ids: Tensor,        # (B,)
        style_vectors: Tensor,   # (B, style_dim)
        occasion_ids: Tensor,    # (B,)
        weather_ids: Tensor,     # (B,)
    ) -> Tensor:
        u = self.user_embed(user_ids)
        o = self.occasion_embed(occasion_ids)
        w = self.weather_embed(weather_ids)
        x = torch.cat([u, o, w, style_vectors], dim=-1)
        return self.mlp(x)


class ItemTower(nn.Module):
    """
    Project a 512-dimensional CLIP item embedding to 128 dimensions via an MLP.
    """

    def __init__(self, clip_dim: int = 512, output_dim: int = 128) -> None:
        super().__init__()
        self.mlp = nn.Sequential(
            nn.Linear(clip_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, output_dim),
        )

    def forward(self, item_embeddings: Tensor) -> Tensor:  # (B, clip_dim)
        return self.mlp(item_embeddings)


class TwoTowerModel(nn.Module):
    """
    Two-Tower retrieval model for fashion recommendation.

    The user tower encodes user context; the item tower encodes CLIP embeddings.
    Similarity is measured with cosine distance; training uses BPR loss.
    """

    def __init__(
        self,
        num_users: int = 10_000,
        style_dim: int = 512,
        clip_dim: int = 512,
        num_occasions: int = 10,
        num_weather: int = 8,
        embed_dim: int = 64,
        output_dim: int = 128,
    ) -> None:
        super().__init__()
        self.user_tower = UserTower(
            num_users=num_users,
            style_dim=style_dim,
            num_occasions=num_occasions,
            num_weather=num_weather,
            embed_dim=embed_dim,
            output_dim=output_dim,
        )
        self.item_tower = ItemTower(clip_dim=clip_dim, output_dim=output_dim)

    def forward(
        self,
        user_features: dict,
        item_features: Tensor,
    ) -> tuple[Tensor, Tensor]:
        """
        Parameters
        ----------
        user_features:
            Dict with keys ``user_ids``, ``style_vectors``,
            ``occasion_ids``, ``weather_ids``.
        item_features:
            CLIP item embeddings of shape ``(B, clip_dim)``.

        Returns
        -------
        tuple[Tensor, Tensor]
            ``(user_emb, item_emb)`` both of shape ``(B, output_dim)``.
        """
        user_emb = self.user_tower(
            user_ids=user_features["user_ids"],
            style_vectors=user_features["style_vectors"],
            occasion_ids=user_features["occasion_ids"],
            weather_ids=user_features["weather_ids"],
        )
        item_emb = self.item_tower(item_features)
        return user_emb, item_emb

    @staticmethod
    def cosine_similarity(user_emb: Tensor, item_emb: Tensor) -> Tensor:
        """Return element-wise cosine similarity; shape ``(B,)``."""
        return F.cosine_similarity(user_emb, item_emb, dim=-1)

    def training_step(self, batch: dict) -> Tensor:
        """
        Compute BPR (Bayesian Personalised Ranking) loss for a batch.

        The batch must contain:
        - ``user_features``: dict of user context tensors
        - ``pos_items``: positive item embeddings ``(B, clip_dim)``
        - ``neg_items``: negative item embeddings ``(B, clip_dim)``

        Returns
        -------
        Tensor
            Scalar BPR loss.
        """
        user_emb, pos_emb = self.forward(batch["user_features"], batch["pos_items"])
        _, neg_emb = self.forward(batch["user_features"], batch["neg_items"])

        pos_scores = self.cosine_similarity(user_emb, pos_emb)
        neg_scores = self.cosine_similarity(user_emb, neg_emb)

        # BPR loss: -log(σ(pos_score - neg_score))
        loss = -F.logsigmoid(pos_scores - neg_scores).mean()
        return loss
