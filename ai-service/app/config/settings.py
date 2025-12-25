"""
Configuration Settings for CoreHive AI Service

This file loads environment variables and provides them to the application.
Using Pydantic for validation ensures type safety and proper error handling.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Pydantic automatically:
    - Reads from .env file
    - Validates types
    - Provides helpful error messages if required vars are missing
    """
     # Azure Blob Storage Settings
    AZURE_STORAGE_CONNECTION_STRING: str = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
    AZURE_PHOTOS_CONTAINER: str = os.getenv("AZURE_PHOTOS_CONTAINER", "employee-photos")
    AZURE_EMBEDDINGS_CONTAINER: str = os.getenv("AZURE_EMBEDDINGS_CONTAINER", "face-embeddings")
    
    # Use Azure Storage in production, local in development
    USE_AZURE_STORAGE: bool = os.getenv("USE_AZURE_STORAGE", "false").lower() == "true"
    
    # ----- Application Settings -----
    APP_NAME: str = "CoreHive AI Service"
    DEBUG: bool = True
    
    # ----- Database Configuration -----
    # These MUST match your Spring Boot backend's database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "corehive_db"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    
    # ----- Google Gemini API -----
    GEMINI_API_KEY: str = ""
    
    # ----- Service URLs -----
    BACKEND_URL: str = "http://localhost:8080"
    FRONTEND_URL: str = "http://localhost:5173"
    
    @property
    def DATABASE_URL(self) -> str:
        """
        Constructs the database connection URL.
        Format: mysql+pymysql://user:password@host:port/database
        """
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        # Tell Pydantic to read from .env file
        env_file = ".env"
        # Environment variables are case-sensitive
        case_sensitive = True
        # Allow extra fields (won't cause errors)
        extra = "ignore"


# Create a global settings instance
# This is used throughout the application
settings = Settings()

# Print debug info on startup (only in debug mode)
if settings.DEBUG:
    print(f"🔧 Settings loaded:")
    print(f"   - App Name: {settings.APP_NAME}")
    print(f"   - Database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    print(f"   - Gemini API Key: {'✅ Set' if settings.GEMINI_API_KEY else '❌ Not Set'}")