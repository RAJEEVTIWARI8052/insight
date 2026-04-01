from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class SendOtpRequest(BaseModel):
    email: str


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ToggleRoleRequest(BaseModel):
    experience: Optional[int] = 0
    expertise: Optional[list[str]] = []


class AuthResponse(BaseModel):
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None


# ── Question Schemas ──────────────────────────────────────────────────────────

class CreateQuestionRequest(BaseModel):
    title: str
    content: Optional[str] = None
    topic: Optional[str] = None
    imageUrl: Optional[str] = ""
    mentionedExpertId: Optional[str] = None
    bypassDeduplication: Optional[bool] = False


class ExpertResponseRequest(BaseModel):
    response: str


class AddAnswerRequest(BaseModel):
    content: str


# ── Notification Schemas ──────────────────────────────────────────────────────

class UnreadCountResponse(BaseModel):
    count: int


class MessageResponse(BaseModel):
    message: str
