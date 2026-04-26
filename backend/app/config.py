from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/smartrobe"
    REDIS_URL: str = "redis://localhost:6379/0"
    S3_BUCKET: str = "smart-robe-assets"
    OPENAI_API_KEY: str = ""
    PINECONE_API_KEY: str = ""
    PINECONE_ENV: str = "us-east1-gcp"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── Virtual Try-On ──────────────────────────────────────────────────────
    # TRYON_PROVIDER: "mock" | "local" | "replicate"
    # - mock: instant placeholder (no API key required, for development)
    # - local: Stable Diffusion img2img running locally (GPU recommended)
    # - replicate: cloud API via Replicate (requires REPLICATE_API_TOKEN)
    TRYON_PROVIDER: str = "mock"
    REPLICATE_API_TOKEN: str = ""
    # Replicate model ID for virtual try-on (IDM-VTON by default)
    REPLICATE_TRYON_MODEL: str = "cuuupid/idm-vton"

    # ── File uploads ────────────────────────────────────────────────────────
    # Directory where uploaded images are stored and served from
    UPLOAD_DIR: str = "uploads"
    # Base URL under which the uploads directory is served (no trailing slash)
    UPLOAD_BASE_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
