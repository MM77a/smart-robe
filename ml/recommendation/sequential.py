"""SASRec: Self-Attentive Sequential Recommendation model."""
from __future__ import annotations

import math

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor


class SASRecModel(nn.Module):
    """
    Simplified SASRec (Self-Attentive Sequential Recommendation) model.

    Architecture:
    - Item embedding layer
    - Positional encoding
    - N stacked self-attention transformer blocks
    - Linear output layer projecting to item logits

    Parameters
    ----------
    item_num:    Total number of items in the catalogue (vocabulary size).
    hidden_size: Dimensionality of item embeddings and hidden states.
    num_heads:   Number of multi-head attention heads.
    num_layers:  Number of transformer encoder layers.
    max_seq_len: Maximum interaction sequence length.
    dropout:     Dropout probability applied throughout.
    """

    def __init__(
        self,
        item_num: int,
        hidden_size: int = 64,
        num_heads: int = 2,
        num_layers: int = 2,
        max_seq_len: int = 50,
        dropout: float = 0.1,
    ) -> None:
        super().__init__()
        self.item_num = item_num
        self.hidden_size = hidden_size
        self.max_seq_len = max_seq_len

        # Embedding: index 0 reserved for padding
        self.item_embedding = nn.Embedding(item_num + 1, hidden_size, padding_idx=0)
        self.pos_embedding = nn.Embedding(max_seq_len, hidden_size)
        self.dropout = nn.Dropout(dropout)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_size,
            nhead=num_heads,
            dim_feedforward=hidden_size * 4,
            dropout=dropout,
            batch_first=True,
            norm_first=True,  # pre-norm for stability
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.layer_norm = nn.LayerNorm(hidden_size)
        self.output = nn.Linear(hidden_size, item_num + 1)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _make_causal_mask(self, seq_len: int, device: torch.device) -> Tensor:
        """Upper-triangular causal mask to prevent attending to future tokens."""
        mask = torch.triu(torch.ones(seq_len, seq_len, device=device), diagonal=1).bool()
        return mask  # True = masked (ignored)

    # ------------------------------------------------------------------
    # Forward
    # ------------------------------------------------------------------

    def forward(self, item_seq: Tensor) -> Tensor:
        """
        Parameters
        ----------
        item_seq:
            Long tensor of shape ``(batch, seq_len)`` with item IDs.
            Padding positions should be 0.

        Returns
        -------
        Tensor
            Logits over the item vocabulary, shape ``(batch, seq_len, item_num+1)``.
        """
        batch_size, seq_len = item_seq.shape
        positions = torch.arange(seq_len, device=item_seq.device).unsqueeze(0)  # (1, L)

        x = self.item_embedding(item_seq) + self.pos_embedding(positions)
        x = self.dropout(x)

        causal_mask = self._make_causal_mask(seq_len, item_seq.device)
        x = self.transformer(x, mask=causal_mask)
        x = self.layer_norm(x)
        return self.output(x)

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict_next(self, item_seq: list[int], top_k: int = 5) -> list[int]:
        """
        Predict the *top_k* most likely next items given an interaction history.

        Parameters
        ----------
        item_seq:
            Ordered list of item IDs representing the user's interaction history.
        top_k:
            Number of items to recommend.

        Returns
        -------
        list[int]
            Top-k predicted item IDs (1-indexed, 0 excluded as padding).
        """
        self.eval()
        # Truncate to max_seq_len and pad from the left
        seq = item_seq[-self.max_seq_len:]
        padded = [0] * (self.max_seq_len - len(seq)) + seq
        input_tensor = torch.tensor([padded], dtype=torch.long)

        with torch.no_grad():
            logits = self.forward(input_tensor)  # (1, L, item_num+1)
        # Logits for the last position predict the next item
        last_logits = logits[0, -1, :]  # (item_num+1,)
        # Exclude padding index 0
        last_logits[0] = float("-inf")
        top_ids = torch.topk(last_logits, k=top_k).indices.tolist()
        return top_ids
