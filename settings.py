"""
Application settings
"""
try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback for pydantic v1
    from pydantic import BaseSettings

from typing import List

class Settings(BaseSettings):
    # App settings
    app_name: str = "RAGSuite"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql://ragsuites:nitsan123@localhost:5432/ragsuite_db"
    
    # JWT
    jwt_secret_key: str = "your-secret-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 525600  # 1 year (365 days) - session expires only on manual logout
    jwt_inactivity_timeout_minutes: int = 1440  # Auto-logout after 24 hours (1440 minutes) of inactivity
    
    # CORS
    cors_origins: List[str] = ["*"]
    
    # Crawler settings
    max_concurrent_requests: int = 16
    download_delay: float = 1.0
    user_agent: str = "RAGSuite-Crawler/1.0"
    external_crawler_url: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()