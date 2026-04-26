"""Cold-start recommender using K-Means style clustering."""
from __future__ import annotations

import logging
from typing import Any

import numpy as np
from sklearn.cluster import KMeans

logger = logging.getLogger(__name__)


class ColdStartRecommender:
    """
    K-Means–based cold-start recommender used when a user has no interaction
    history.  Style vectors (from the onboarding quiz) are clustered offline;
    new users are assigned to the nearest cluster, which then surfaces the
    cluster's top-performing items.
    """

    def __init__(self) -> None:
        self.kmeans: KMeans | None = None
        self.n_clusters: int = 10

    def fit(
        self,
        style_vectors: np.ndarray,
        n_clusters: int = 10,
        random_state: int = 42,
    ) -> "ColdStartRecommender":
        """
        Fit K-Means on a matrix of style vectors.

        Parameters
        ----------
        style_vectors:
            2-D array of shape ``(N, D)`` where N is the number of users
            and D is the style-vector dimensionality.
        n_clusters:
            Number of clusters (style archetypes).
        random_state:
            Random seed for reproducibility.

        Returns
        -------
        ColdStartRecommender
            Self, for method chaining.
        """
        self.n_clusters = n_clusters
        self.kmeans = KMeans(
            n_clusters=n_clusters,
            random_state=random_state,
            n_init="auto",
        )
        self.kmeans.fit(style_vectors)
        logger.info("ColdStartRecommender fitted with %d clusters", n_clusters)
        return self

    def predict_cluster(self, style_vector: np.ndarray) -> int:
        """
        Assign a style vector to its nearest cluster.

        Parameters
        ----------
        style_vector:
            1-D array of shape ``(D,)``.

        Returns
        -------
        int
            Cluster ID in range ``[0, n_clusters)``.
        """
        if self.kmeans is None:
            raise RuntimeError("Call fit() before predict_cluster()")
        return int(self.kmeans.predict(style_vector.reshape(1, -1))[0])

    def get_cluster_top_items(
        self,
        cluster_id: int,
        items_df: Any,  # pandas DataFrame with columns: item_id, cluster_id, popularity_score
        top_k: int = 5,
    ) -> list[str]:
        """
        Return the *top_k* most popular item IDs for the given *cluster_id*.

        Parameters
        ----------
        cluster_id:
            Target cluster returned by :meth:`predict_cluster`.
        items_df:
            DataFrame with columns ``item_id``, ``cluster_id``,
            and ``popularity_score``.
        top_k:
            Number of items to return.

        Returns
        -------
        list[str]
            Item IDs sorted by descending popularity score.
        """
        cluster_items = items_df[items_df["cluster_id"] == cluster_id]
        top = cluster_items.nlargest(top_k, "popularity_score")
        return top["item_id"].tolist()
