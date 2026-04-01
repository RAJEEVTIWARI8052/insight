from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, questions, notifications

settings = get_settings()

# Create tables if they don't already exist (safe for existing DB)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Insight API",
    description="Cybersecurity Q&A Platform — Python Backend",
    version="2.0.0",
)

# ── CORS (matches old Express config) ────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(notifications.router)


# ── Root endpoint ────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "Backend running "}


# ── Global exception handler ────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Unhandled Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "error": str(exc)},
    )
