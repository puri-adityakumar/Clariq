from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # Environment Configuration
    environment: str = "development"
    
    # Service Configuration
    service_name: str = "clariq-backend"
    service_version: str = "0.1.0"
    
    # Appwrite Configuration - REQUIRED for user authentication
    appwrite_endpoint: str = "https://cloud.appwrite.io/v1"
    appwrite_project_id: str = ""  # Must be set via CLARIQ_APPWRITE_PROJECT_ID
    
    # External API Keys (for research features)
    cerebras_api_key: Optional[str] = None
    exa_api_key: Optional[str] = None
    
    # Future: Database, Redis, External APIs
    # database_url: str = ""
    # redis_url: str = ""
    
    class Config:
        env_file = ".env"
        env_prefix = "CLARIQ_"
        # Allow extra fields to prevent validation errors
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()