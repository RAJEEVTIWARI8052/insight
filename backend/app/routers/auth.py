import json
import random
import string
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    SendOtpRequest,
    VerifyOtpRequest,
    ToggleRoleRequest,
)
from app.utils.mailer import send_otp_email, send_welcome_email

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def _create_token(user_id: str) -> str:
    payload = {
        "id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _user_to_dict(user: User) -> dict:
    """Convert SQLAlchemy User to a serialisable dict (matches old API shape)."""
    expertise = user.expertise
    if expertise:
        try:
            expertise = json.loads(expertise)
        except (json.JSONDecodeError, TypeError):
            expertise = []
    else:
        expertise = []

    return {
        "id": user.id,
        "_id": user.id,  # backward compat
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "avatar": user.avatar,
        "bio": user.bio,
        "isVerified": user.isVerified,
        "role": user.role,
        "experience": user.experience,
        "expertise": expertise,
        "createdAt": user.createdAt.isoformat() if user.createdAt else None,
        "updatedAt": user.updatedAt.isoformat() if user.updatedAt else None,
    }


# ── POST /api/auth/send-otp ──────────────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(body: SendOtpRequest, db: Session = Depends(get_db)):
    try:
        otp = _generate_otp()
        otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=5)

        user = db.query(User).filter(User.email == body.email).first()

        if not user:
            user = User(email=body.email, otp=otp, otpExpiry=otp_expiry, isVerified=False)
            db.add(user)
        else:
            user.otp = otp
            user.otpExpiry = otp_expiry

        db.commit()

        await send_otp_email(body.email, otp)
        return {"message": "Verification code sent to your email"}
    except Exception as e:
        print(f"OTP sending error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send verification code")


# ── POST /api/auth/verify-otp ────────────────────────────────────────────────

@router.post("/verify-otp")
async def verify_otp(body: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if (
        not user
        or user.otp != body.otp
        or not user.otpExpiry
        or user.otpExpiry.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")

    user.isVerified = True
    user.otp = None
    user.otpExpiry = None
    db.commit()

    return {"message": "Email verified successfully"}


# ── POST /api/auth/register ──────────────────────────────────────────────────

@router.post("/register")
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if not body.name or not body.email or not body.password:
        raise HTTPException(status_code=400, detail="Name, email, and password are required")

    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered with this email")

    hashed = pwd_context.hash(body.password)
    new_user = User(
        name=body.name,
        email=body.email,
        password=hashed,
        isVerified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = _create_token(new_user.id)

    return {
        "message": "Registration successful! Welcome to Insight.",
        "token": token,
        "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email},
    }


# ── POST /api/auth/login ─────────────────────────────────────────────────────

@router.post("/login")
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not user.password:
        raise HTTPException(status_code=400, detail="User not registered")

    if not pwd_context.verify(body.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = _create_token(user.id)

    return {
        "message": "Login successful",
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }


# ── GET /api/auth/me ─────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return _user_to_dict(current_user)


# ── POST /api/auth/toggle-role ───────────────────────────────────────────────

@router.post("/toggle-role")
async def toggle_role(
    body: ToggleRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "user":
        experience = body.experience or 0
        expertise = body.expertise or []

        if experience < 4:
            raise HTTPException(
                status_code=400,
                detail="You need at least 4 years of experience to become an expert.",
            )
        if len(expertise) == 0:
            raise HTTPException(
                status_code=400,
                detail="You must provide at least one area of expertise.",
            )

        user.role = "expert"
        user.experience = experience
        user.expertise = json.dumps(expertise)
        db.commit()
        db.refresh(user)
        return _user_to_dict(user)
    else:
        user.role = "user"
        db.commit()
        db.refresh(user)
        return _user_to_dict(user)


# ── POST /api/auth/google ────────────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token from frontend


@router.post("/google")
async def google_auth(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Verify Google ID token and create/login user."""
    try:
        idinfo = google_id_token.verify_oauth2_token(
            body.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        email = idinfo.get("email")
        name = idinfo.get("name", "")
        avatar = idinfo.get("picture", "")

        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email")

        # Find or create user
        user = db.query(User).filter(User.email == email).first()

        if not user:
            user = User(
                name=name,
                email=email,
                avatar=avatar,
                isVerified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update avatar/name if not already set
            if not user.avatar and avatar:
                user.avatar = avatar
            if not user.name and name:
                user.name = name
            db.commit()
            db.refresh(user)

        token = _create_token(user.id)

        return {
            "message": "Google login successful",
            "token": token,
            "user": {"id": user.id, "name": user.name, "email": user.email, "avatar": user.avatar},
        }
    except ValueError as e:
        print(f"Google token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token")


# ── GET /api/auth/experts ────────────────────────────────────────────────────

@router.get("/experts")
async def list_experts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    experts = db.query(User).filter(User.role == "expert").all()
    result = []
    for e in experts:
        d = _user_to_dict(e)
        result.append(d)
    return result
