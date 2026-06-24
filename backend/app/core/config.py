import os
from typing import List, Optional
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database settings
    # Render uses DATABASE_URI, so we check that fallback as well
    DATABASE_URL: str = "sqlite:///./pulseiq.db"
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str]) -> str:
        if v:
            # PostgreSQL URL schema update for SQLAlchemy (replace postgres:// with postgresql://)
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql://", 1)
            return v
        
        # Check alternative env variable name
        uri = os.environ.get("DATABASE_URI")
        if uri:
            if uri.startswith("postgres://"):
                return uri.replace("postgres://", "postgresql://", 1)
            return uri
        return "sqlite:///./pulseiq.db"

    # Clerk settings
    CLERK_JWKS_URL: str = "https://api.clerk.com/v1/jwks"
    CLERK_WEBHOOK_SECRET: Optional[str] = None
    
    # AI SDK configs
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    # Secrets
    SECRET_KEY: str = "pulseiq-auxiliary-secret"
    
    # Twilio (SMS Alert fallback)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None
    
    # Resend (Email Alerts)
    RESEND_API_KEY: Optional[str] = None
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"
    
    # CORS Origins
    # Defaults to wildcard/local urls
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
