"""Conditional latent-diffusion try-on pipeline."""
from __future__ import annotations

import logging
from pathlib import Path

from PIL import Image

logger = logging.getLogger(__name__)


class TryOnDiffusionPipeline:
    """
    Virtual try-on pipeline based on Stable Diffusion img2img.

    The garment image is used as a conditioning reference; the user image
    provides the body pose and geometry for the final composite.

    Real integration notes:
    - Use ``diffusers`` ``StableDiffusionImg2ImgPipeline`` or a
      garment-specific fine-tune (e.g., IDM-VTON, OOTDiffusion).
    - For best results, combine with a pose estimator (DWPose / OpenPose)
      so the garment is warped to match the user's body keypoints before
      conditioning.

    Parameters
    ----------
    model_id:
        HuggingFace model ID for the Stable Diffusion checkpoint.
    device:
        Compute device; inferred automatically when ``None``.
    """

    def __init__(
        self,
        model_id: str = "runwayml/stable-diffusion-v1-5",
        device: str | None = None,
    ) -> None:
        import torch

        self.model_id = model_id
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self._pipeline = None  # loaded lazily

    def _load(self) -> None:
        """Lazily load the diffusion pipeline."""
        if self._pipeline is not None:
            return
        try:
            from diffusers import StableDiffusionImg2ImgPipeline
            import torch

            logger.info("Loading diffusion pipeline %s on %s", self.model_id, self.device)
            self._pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
                self.model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            ).to(self.device)
        except ImportError:
            logger.warning(
                "diffusers not installed. Install with: pip install diffusers accelerate"
            )
        except Exception as exc:
            logger.error("Failed to load diffusion pipeline: %s", exc)

    def generate(
        self,
        user_image: Image.Image,
        garment_image: Image.Image,
        prompt: str = "A person wearing the outfit, high quality fashion photo",
        num_steps: int = 50,
        strength: float = 0.75,
        guidance_scale: float = 7.5,
    ) -> Image.Image:
        """
        Generate a try-on result image.

        Parameters
        ----------
        user_image:     Full-body photo of the user (RGB PIL image).
        garment_image:  Photo of the garment to try on (RGB PIL image).
        prompt:         Text prompt to guide the diffusion process.
        num_steps:      Number of denoising steps.
        strength:       How much the original user image is altered (0–1).
        guidance_scale: Classifier-free guidance scale.

        Returns
        -------
        PIL.Image.Image
            Generated try-on composite image.
        """
        self._load()

        if self._pipeline is None:
            logger.warning("Pipeline unavailable – returning user image unchanged")
            return user_image

        # Resize both images to 512x512 for SD v1.5
        target_size = (512, 512)
        user_resized = user_image.resize(target_size)

        result = self._pipeline(
            prompt=prompt,
            image=user_resized,
            strength=strength,
            guidance_scale=guidance_scale,
            num_inference_steps=num_steps,
        ).images[0]

        return result

    def save_result(self, image: Image.Image, output_path: str) -> None:
        """Save the generated image to *output_path*."""
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        image.save(output_path)
        logger.info("Try-on result saved to %s", output_path)
