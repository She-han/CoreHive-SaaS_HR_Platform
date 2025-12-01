"""
Health Check Router

This provides endpoints for Azure to check if the service is running.
Azure App Service uses these to know if the container is healthy.
"""

from fastapi import APIRouter
from datetime import datetime

from app.repositories.database import test_database_connection

# Create router instance
router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Basic health check endpoint.
    
    Azure calls this to see if the container is alive.
    Returns simple status information.
    """
    return {
        "status": "healthy",
        "service": "CoreHive AI Service",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


@router.get("/health/detailed")
async def detailed_health_check():
    """
    Detailed health check with database status.
    
    Useful for debugging connection issues.
    """
    db_status = test_database_connection()
    
    return {
        "status": "healthy" if db_status else "degraded",
        "service": "CoreHive AI Service",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "components": {
            "database": "connected" if db_status else "disconnected",
            "ai_service": "ready"
        }
    }


@router.get("/ready")
async def readiness_check():
    """
    Readiness check for load balancers.
    
    Returns 200 if service is ready to accept traffic.
    """
    return {"status": "ready"}