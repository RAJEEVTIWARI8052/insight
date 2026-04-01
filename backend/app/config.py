from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./dev.db"
    JWT_SECRET: str = "codevirus_secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_DAYS: int = 7
    PORT: int = 5001
    GOOGLE_CLIENT_ID: str = ""
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "onboarding@resend.dev"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
