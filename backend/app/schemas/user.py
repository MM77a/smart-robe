import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Schema for registering a new user."""

    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """Schema for authenticating an existing user."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema returned upon successful authentication."""

    access_token: str
    token_type: str = "bearer"
    user_id: uuid.UUID


class UserProfile(BaseModel):
    """Schema for updating a user's style profile after the style quiz."""

    style_answers: dict
    occasion_prefs: list[str]


class UserResponse(BaseModel):
    """Schema for returning user information to the client."""

    id: uuid.UUID
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}
