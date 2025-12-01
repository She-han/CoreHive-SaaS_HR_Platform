"""
CoreHive AI Service - Main Application

This is the entry point for the AI service.
It sets up FastAPI, configures middleware, and registers routers.

Run locally with: uvicorn app.main:app --reload --port 8001
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys

from app.config.settings import settings
from app.routers import health, insights
from app.repositories.database import test_database_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    
    This runs code on startup and shutdown of the application.
    - Startup: Test database connection, verify Gemini API
    - Shutdown: Cleanup resources
    """
    # ===== STARTUP =====
    print("\n" + "=" * 60)
    print("🚀 CoreHive AI Service Starting...")
    print("=" * 60)
    
    # Print configuration info
    print(f"\n📋 Configuration:")
    print(f"   App Name: {settings.APP_NAME}")
    print(f"   Debug Mode: {settings.DEBUG}")
    print(f"   Database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    
    # Test database connection
    print(f"\n🔌 Testing database connection...")
    db_connected = test_database_connection()
    if db_connected:
        print("   ✅ Database connection successful!")
    else:
        print("   ⚠️ Database connection failed - some features may not work")
    
    # Check Gemini API key
    print(f"\n🤖 Checking Gemini API...")
    if settings.GEMINI_API_KEY:
        print("   ✅ Gemini API key is configured")
    else:
        print("   ⚠️ Gemini API key not set - AI insights will use fallback mode")
    
    print("\n" + "=" * 60)
    print("✅ CoreHive AI Service is ready!")
    print(f"📍 API Docs: http://localhost:8001/docs")
    print("=" * 60 + "\n")
    
    # Yield control to the application
    yield
    
    # ===== SHUTDOWN =====
    print("\n" + "=" * 60)
    print("👋 CoreHive AI Service shutting down...")
    print("=" * 60 + "\n")


# Create FastAPI application instance
app = FastAPI(
    title="CoreHive AI Service",
    description="""
    🧠 AI-powered insights for CoreHive HR Platform
    
    This service provides:
    - **Dashboard Insights**: AI-generated insights from HR data
    - **Attendance Analytics**: Pattern detection and anomaly alerts
    - **Leave Analytics**: Leave trend analysis and predictions
    
    Powered by Google Gemini AI (FREE tier)
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configure CORS (Cross-Origin Resource Sharing)
# This allows the frontend to call our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,          # React frontend
        settings.BACKEND_URL,           # Spring Boot backend
        "http://localhost:5173",        # Vite dev server
        "http://localhost:3000",        # Alternative React port
        "http://127.0.0.1:5173",        # localhost alternative
        "http://127.0.0.1:8001",        # AI service itself
    ],
    allow_credentials=True,
    allow_methods=["*"],                # Allow all HTTP methods
    allow_headers=["*"],                # Allow all headers
)


# Register routers
# Health check endpoints (no prefix - accessible at /health)
app.include_router(
    health.router,
    tags=["Health Check"]
)

# AI Insights endpoints (prefix: /api/insights)
app.include_router(
    insights.router,
    prefix="/api/insights",
    tags=["AI Insights"]
)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - basic service information.
    
    Useful for quick health checks and service discovery.
    """
    return {
        "service": "CoreHive AI Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "insights": "/api/insights/dashboard"
    }


# Debug endpoint (only in debug mode)
if settings.DEBUG:
    @app.get("/debug/config", tags=["Debug"])
    async def debug_config():
        """
        Debug endpoint to check configuration.
        Only available when DEBUG=true
        """
        return {
            "app_name": settings.APP_NAME,
            "debug": settings.DEBUG,
            "database": {
                "host": settings.DB_HOST,
                "port": settings.DB_PORT,
                "name": settings.DB_NAME,
                "user": settings.DB_USER,
                # Never expose password!
                "password": "***hidden***"
            },
            "gemini_api_key": "***configured***" if settings.GEMINI_API_KEY else "NOT SET",
            "urls": {
                "backend": settings.BACKEND_URL,
                "frontend": settings.FRONTEND_URL
            }
        }