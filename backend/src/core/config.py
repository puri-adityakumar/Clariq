from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # API Configuration
    api_keys: List[str] = ["dev-key-123", "admin-key-456"]  # Static for Phase 1
    environment: str = "development"
    
    # Service Configuration
    service_name: str = "clariq-backend"
    service_version: str = "0.1.0"
    
    # Future: Database, Redis, External APIs
    # database_url: str = ""
    # redis_url: str = ""
    # appwrite_endpoint: str = ""
    # appwrite_project_id: str = ""
    
    class Config:
        env_file = ".env"
        env_prefix = "CLARIQ_"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()