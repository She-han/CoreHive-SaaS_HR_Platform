"""
CoreHive AI Service - Configuration Settings
=============================================
මේ file එකේ environment variables manage කරනවා.
Production එකේදී Azure App Service settings වලින් values ගන්නවා.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Pydantic settings automatically load values from:
    1. Environment variables
    2. .env file (if exists)
    """
    
    # ===========================================
    # Application Settings
    # ===========================================
    APP_NAME: str = "CoreHive AI Service"
    DEBUG: bool = False
    
    # ===========================================
    # Database Connection
    # ඔයාගේ existing MySQL database එකේම connect වෙනවා
    # ===========================================
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "corehive_db"
    DB_USER: str = "root"
    DB_PASSWORD: str = "1234"
    
    # ===========================================
    # Google Gemini API (FREE!)
    # Google AI Studio එකෙන් ගත්ත key එක
    # ===========================================
    GEMINI_API_KEY: str = "AIzaSyDS3UI3-AfaD-kd6kBjnvHtFq9D6umHsew"
    
    # ===========================================
    # Other Services URLs
    # ===========================================
    BACKEND_URL: str = "http://localhost:8080"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # ===========================================
    # Computed Properties
    # ===========================================
    @property
    def DATABASE_URL(self) -> str:
        """Generate SQLAlchemy database connection URL"""
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        # .env file එකෙන් values load කරන්න
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
# අනිත් files වලින් මේක import කරන්න පුළුවන්
settings = Settings()