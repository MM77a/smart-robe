"""Shared image and text preprocessing utilities."""
from __future__ import annotations

import re
import unicodedata
from typing import Dict

import torch
import torchvision.transforms as T
import torchvision.transforms.functional as TF
from PIL import Image, ImageFilter

# Style name → integer label mapping
_STYLE_LABELS: Dict[str, int] = {
    "casual": 0,
    "formal": 1,
    "streetwear": 2,
    "bohemian": 3,
    "minimalist": 4,
    "sportswear": 5,
    "vintage": 6,
    "preppy": 7,
    "gothic": 8,
    "business_casual": 9,
}


def resize_and_pad(
    image: Image.Image,
    size: tuple[int, int] = (224, 224),
    fill_color: tuple[int, int, int] = (255, 255, 255),
) -> Image.Image:
    """
    Resize *image* to fit within *size* while preserving aspect ratio,
    then pad with *fill_color* to reach exactly *size*.

    Parameters
    ----------
    image:      Source RGB PIL image.
    size:       Target ``(width, height)`` in pixels.
    fill_color: RGB fill colour for the padding area.

    Returns
    -------
    PIL.Image.Image
        Padded image of shape ``size``.
    """
    target_w, target_h = size
    original_w, original_h = image.size

    scale = min(target_w / original_w, target_h / original_h)
    new_w = int(original_w * scale)
    new_h = int(original_h * scale)

    resized = image.resize((new_w, new_h), Image.LANCZOS)
    padded = Image.new("RGB", size, fill_color)
    paste_x = (target_w - new_w) // 2
    paste_y = (target_h - new_h) // 2
    padded.paste(resized, (paste_x, paste_y))
    return padded


def normalize_image(
    image: Image.Image,
    mean: tuple[float, float, float] = (0.485, 0.456, 0.406),
    std: tuple[float, float, float] = (0.229, 0.224, 0.225),
) -> torch.Tensor:
    """
    Convert a PIL image to a normalised ``(3, H, W)`` float tensor using
    ImageNet statistics by default.

    Parameters
    ----------
    image:  Source RGB PIL image.
    mean:   Per-channel mean.
    std:    Per-channel standard deviation.

    Returns
    -------
    torch.Tensor
        Float tensor of shape ``(3, H, W)`` in ``[-1, ~3]`` range.
    """
    transform = T.Compose([
        T.ToTensor(),
        T.Normalize(mean=mean, std=std),
    ])
    return transform(image)


def augment_image(image: Image.Image) -> Image.Image:
    """
    Apply random data-augmentation transforms suitable for fashion images.

    Transforms applied:
    - Random horizontal flip (p=0.5)
    - Random colour jitter (brightness, contrast, saturation, hue)
    - Random slight rotation (±10 °)

    Parameters
    ----------
    image: Source RGB PIL image.

    Returns
    -------
    PIL.Image.Image
        Augmented image.
    """
    transform = T.Compose([
        T.RandomHorizontalFlip(p=0.5),
        T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05),
        T.RandomRotation(degrees=10),
    ])
    return transform(image)


def clean_text(text: str) -> str:
    """
    Normalise a raw text description for use as a CLIP text input.

    Steps:
    1. Unicode NFKC normalisation.
    2. Strip HTML tags.
    3. Collapse multiple whitespace characters.
    4. Lowercase and strip.

    Parameters
    ----------
    text: Raw description string.

    Returns
    -------
    str
        Cleaned text string.
    """
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"<[^>]+>", " ", text)      # strip HTML
    text = re.sub(r"\s+", " ", text)           # collapse whitespace
    return text.lower().strip()


def build_style_label_map() -> Dict[str, int]:
    """
    Return the mapping from style names to integer class indices.

    Returns
    -------
    dict[str, int]
        E.g. ``{"casual": 0, "formal": 1, …}``.
    """
    return dict(_STYLE_LABELS)
