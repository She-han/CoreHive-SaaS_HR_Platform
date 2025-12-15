"""
CoreHive AI Service - Main Application

Features:
- AI Dashboard Insights (Gemini AI)
- Face Recognition with Embeddings (DeepFace + Facenet)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
import logging

from app.config.settings import settings
from app.routers import health, insights
from app.routers import face_recognition
from app.repositories.database import test_database_connection

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create directories
UPLOAD_DIR = Path("uploads/employee_photos")
TEMP_DIR = Path("uploads/temp")
DATA_DIR = Path("data/embeddings")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)


def check_face_recognition_dependencies() -> bool:
    """Check if face recognition dependencies are installed."""
    try:
        from deepface import DeepFace
        import cv2
        import numpy as np
        return True
    except ImportError as e:
        print(f"   ⚠️ Face Recognition dependency missing: {e}")
        return False


def preload_face_model():
    """Pre-load face recognition model to avoid first-request delay."""
    try:
        from deepface import DeepFace
        print("   📥 Pre-loading Facenet model...")
        # This triggers model download if not present
        DeepFace.build_model("Facenet")
        print("   ✅ Facenet model loaded!")
        return True
    except Exception as e:
        print(f"   ⚠️ Model pre-load failed: {e}")
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    
    # ===== STARTUP =====
    print("\n" + "=" * 60)
    print("🚀 CoreHive AI Service Starting...")
    print("=" * 60)
    
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
        print("   ⚠️ Database connection failed!")
    
    # Check Gemini API
    print(f"\n🤖 Checking Gemini API...")
    if settings.GEMINI_API_KEY:
        print("   ✅ Gemini API key is configured")
    else:
        print("   ⚠️ Gemini API key is not set")
    
    # Check Face Recognition
    print(f"\n👤 Checking Face Recognition...")
    face_available = check_face_recognition_dependencies()
    if face_available:
        print("   ✅ Face Recognition dependencies installed!")
        print(f"   📁 Photos Directory: {UPLOAD_DIR.absolute()}")
        print(f"   📁 Embeddings Directory: {DATA_DIR.absolute()}")
        
        # Pre-load model
        preload_face_model()
        
        # Initialize embedding service
        from app.services.embedding_service import get_embedding_service
        embedding_service = get_embedding_service()
        print(f"   ✅ Embedding service initialized!")
        print(f"   📊 Model: {embedding_service.model_name}")
        print(f"   📊 Similarity Threshold: {embedding_service.similarity_threshold}")
    else:
        print("   ⚠️ Face Recognition not available")
    
    print("\n" + "=" * 60)
    print("✅ CoreHive AI Service is ready!")
    print(f"📍 API Docs: http://localhost:8001/docs")
    print("=" * 60)
    
    print("\n📌 Available Endpoints:")
    print("   • Health Check:      /health")
    print("   • AI Insights:       /api/insights/dashboard")
    print("   • Face Register:     /api/face/register")
    print("   • Face Identify:     /api/face/identify (Kiosk)")
    print("   • Face Verify:       /api/face/verify")
    print("   • Face Status:       /api/face/status/{org}/{emp}")
    print("=" * 60 + "\n")
    
    yield
    
    # ===== SHUTDOWN =====
    print("\n👋 CoreHive AI Service shutting down...")


# Create FastAPI app
app = FastAPI(
    title="CoreHive AI Service",
    description="""
    🧠 AI-powered features for CoreHive HR Platform
    
    ## Features
    
    ### 📊 Dashboard Insights (Gemini AI)
    - AI-generated insights from HR data
    
    ### 👤 Face Recognition (Embedding-based)
    - Fast employee identification using pre-computed embeddings
    - Employee face registration
    - Attendance kiosk support
    
    ---
    Powered by Google Gemini AI & DeepFace (Facenet)
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, tags=["Health Check"])
app.include_router(insights.router, prefix="/api/insights", tags=["AI Insights"])
app.include_router(face_recognition.router, tags=["Face Recognition"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": "CoreHive AI Service",
        "version": "2.0.0",
        "status": "running",
        "features": ["AI Insights", "Face Recognition (Embeddings)"],
        "docs": "/docs"
    }