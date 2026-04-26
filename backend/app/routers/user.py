import uuid

from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserProfile, UserResponse

router = APIRouter()

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Create a new user account with a hashed password."""
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = _pwd_context.hash(payload.password)
    user = User(email=payload.email, hashed_password=hashed)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/profile", response_model=UserResponse)
async def update_user_profile(
    user_id: uuid.UUID,
    payload: UserProfile,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Update a user's style profile based on their quiz answers."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.style_profile = {
        "style_answers": payload.style_answers,
        "occasion_prefs": payload.occasion_prefs,
    }
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)
