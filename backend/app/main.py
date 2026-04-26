from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import wardrobe, recommendation, tryon, user


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle."""
    # Startup: initialise DB connection pool, ML models, etc.
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


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
