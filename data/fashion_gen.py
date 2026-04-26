"""Fashion-Gen dataset loader for PyTorch."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Callable, Optional

import torch
from PIL import Image
from torch.utils.data import Dataset

logger = logging.getLogger(__name__)


class FashionGenDataset(Dataset):
    """
    PyTorch Dataset for the Fashion-Gen dataset.

    Fashion-Gen contains ~293k high-resolution fashion images paired with
    rich textual descriptions.  This loader expects the dataset to be
    organised as::

        root_dir/
          images/
            train/
              <image_id>.jpg
              …
            val/
              …
          annotations/
            train.json   # list of {image_id, description, category, …}
            val.json

    Parameters
    ----------
    root_dir:
        Root directory of the downloaded dataset.
    split:
        Dataset split – ``"train"`` or ``"val"``.
    transform:
        Optional torchvision transform applied to each image tensor.
    """

    def __init__(
        self,
        root_dir: str,
        split: str = "train",
        transform: Optional[Callable] = None,
    ) -> None:
        self.root = Path(root_dir)
        self.split = split
        self.transform = transform

        annotations_path = self.root / "annotations" / f"{split}.json"
        if not annotations_path.exists():
            raise FileNotFoundError(
                f"Annotations file not found: {annotations_path}\n"
                f"Run FashionGenDataset.download_instructions() for setup steps."
            )

        with open(annotations_path) as fh:
            self.annotations: list[dict[str, Any]] = json.load(fh)

        self.image_dir = self.root / "images" / split
        logger.info(
            "FashionGenDataset[%s] loaded %d samples from %s",
            split,
            len(self.annotations),
            root_dir,
        )

    def __len__(self) -> int:
        return len(self.annotations)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, str]:
        """
        Return the image tensor and text description at index *idx*.

        Returns
        -------
        tuple[torch.Tensor, str]
            ``(image_tensor, text_description)``
        """
        ann = self.annotations[idx]
        image_path = self.image_dir / f"{ann['image_id']}.jpg"
        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image_tensor: torch.Tensor = self.transform(image)
        else:
            # Default: convert to float tensor in [0, 1]
            import torchvision.transforms.functional as TF
            image_tensor = TF.to_tensor(image)

        description: str = ann.get("description", "")
        return image_tensor, description

    @classmethod
    def download_instructions(cls) -> str:
        """Return a human-readable string with dataset download instructions."""
        return (
            "Fashion-Gen Dataset Download Instructions\n"
            "=========================================\n"
            "1. Register at https://fashion-gen.com/ and accept the terms of use.\n"
            "2. Download the HDF5 archives:\n"
            "   - fashiongen_256_256_train.h5\n"
            "   - fashiongen_256_256_val.h5\n"
            "3. Convert to the expected directory structure using the provided\n"
            "   extraction script (scripts/extract_fashiongen.py):\n"
            "     python scripts/extract_fashiongen.py \\\n"
            "       --h5_path fashiongen_256_256_train.h5 \\\n"
            "       --output_dir data/fashiongen\n"
            "4. Point FashionGenDataset(root_dir='data/fashiongen') at the result.\n"
        )
