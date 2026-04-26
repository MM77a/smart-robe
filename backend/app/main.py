from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import wardrobe, recommendation, tryon, user


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle."""
    # Ensure the uploads directory exists
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    print("Starting Smart-Robe backend…")
    yield
    # Shutdown: clean up resources
    print("Shutting down Smart-Robe backend…")


app = FastAPI(
    title="Smart-Robe API",
    description="AI-powered personal stylist backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wardrobe.router, prefix="/wardrobe", tags=["wardrobe"])
app.include_router(recommendation.router, prefix="/recommendation", tags=["recommendation"])
app.include_router(tryon.router, prefix="/tryon", tags=["tryon"])
app.include_router(user.router, prefix="/user", tags=["user"])

# Serve uploaded images (user photos and wardrobe items) as static files
# accessible at /uploads/<filename>
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
