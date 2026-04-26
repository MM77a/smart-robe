# Smart-Robe 👗✨

> **An AI-powered personal stylist** – upload your wardrobe, discover your style, and virtually try on outfits using state-of-the-art machine learning.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser (Next.js 14)                    │
│  Landing · Style Quiz · Wardrobe · Outfit Recommendations · Try-On│
└──────────────────┬───────────────────────────────────────────────┘
                   │ REST (axios)
┌──────────────────▼───────────────────────────────────────────────┐
│                    FastAPI Backend  :8000                         │
│  /wardrobe/upload  /recommendation  /tryon  /user/profile         │
│        │                  │               │                       │
│   SAM Segment.      Cosine Sim.     Celery Task                   │
│   CLIP Embed.       Two-Tower       (Redis queue)                 │
└──────┬───────────────────┬───────────────────┬────────────────────┘
       │                   │                   │
┌──────▼──────┐  ┌─────────▼───────┐  ┌───────▼───────────────────┐
│  PostgreSQL  │  │  ML Layer       │  │  Celery Worker             │
│  (items,    │  │  ┌─ CLIP        │  │  run_tryon_task →           │
│   users)    │  │  ├─ ViT         │  │  Stable Diffusion           │
└─────────────┘  │  ├─ Two-Tower   │  │  img2img pipeline           │
                 │  ├─ SASRec      │  └───────────────────────────┘
                 │  └─ Outfit Rank │
                 └─────────────────┘
```

## ML Layers

| Layer | Components | Purpose |
|---|---|---|
| **Style Understanding** | CLIP fine-tuner (InfoNCE), ViT extractor, SAM segmentation | Embed & segment garment images |
| **Recommendation** | Two-Tower (BPR), SASRec (self-attention), K-Means cold-start, Outfit Ranker | Personalised outfit ranking |
| **Virtual Try-On** | Stable Diffusion img2img, Pose Estimator | Generate try-on composites |

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** and npm
- **Docker** and **Docker Compose** (for the full stack)
- GPU recommended for ML inference (CPU fallback available)

---

## Quick Start (Docker Compose)

```bash
# 1. Clone the repository
git clone https://github.com/MM77a/smart-robe.git
cd smart-robe

# 2. Create your environment file
cp infra/.env.example infra/.env
# Edit infra/.env and fill in your API keys

# 3. Start all services
cd infra
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Manual Setup

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Copy and configure environment
cp ../infra/.env.example .env

# Run database migrations (Alembic)
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### Celery Worker

```bash
# In a separate terminal (same venv)
celery -A app.tasks.celery_app.celery_app worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
cp ../infra/.env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

### ML Modules (standalone training)

```bash
cd ml

# Fine-tune CLIP on your fashion dataset
python -c "
from style.clip_finetuner import CLIPFinetuner
ft = CLIPFinetuner()
# ft.train(your_dataloader, epochs=10)
"

# Ingest a wardrobe directory
python -c "
from style.wardrobe_ingestion import WardrobeIngestion
wi = WardrobeIngestion()
items = wi.ingest_directory('path/to/images')
print(f'Ingested {len(items)} items')
"
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user/register` | Register a new user |
| `POST` | `/user/profile` | Update style profile after quiz |
| `POST` | `/wardrobe/upload` | Upload & process a clothing image |
| `GET` | `/recommendation` | Get top-k outfit recommendations |
| `POST` | `/tryon` | Start a virtual try-on job |
| `GET` | `/tryon/{job_id}` | Poll try-on job status & result |
| `GET` | `/health` | Health check |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string (Celery broker) | ✅ |
| `S3_BUCKET` | AWS S3 bucket for image storage | ✅ |
| `OPENAI_API_KEY` | OpenAI API key (future use) | ⚠️ |
| `PINECONE_API_KEY` | Pinecone vector DB API key | ⚠️ |
| `PINECONE_ENV` | Pinecone environment name | ⚠️ |
| `SECRET_KEY` | JWT signing secret | ✅ |
| `ALGORITHM` | JWT algorithm (default: `HS256`) | — |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL in minutes (default: 30) | — |
| `NEXT_PUBLIC_API_URL` | Backend base URL for the frontend | ✅ |

---

## Project Structure

```
smart-robe/
├── backend/          FastAPI app, services, Celery tasks
├── ml/               ML models (CLIP, ViT, Two-Tower, SASRec, Diffusion)
├── data/             Dataset loaders and preprocessing utilities
├── frontend/         Next.js 14 frontend (TypeScript + Tailwind)
└── infra/            Docker Compose and environment template
```

## License

MIT
 We want it to become a smart, personal stylist. Based on today’s weather, occasion and whatever your prompt, to make your own ootd, and it must suit your taste.
