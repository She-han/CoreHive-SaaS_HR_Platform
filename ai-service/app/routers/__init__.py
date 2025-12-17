"""
Routers package for CoreHive AI Service.

This package contains all API route handlers:
- health: Health check endpoints
- insights: AI-powered dashboard insights
- face_recognition: Face recognition for attendance
"""

from app.routers import health
from app.routers import insights
from app.routers import face_recognition

__all__ = ["health", "insights", "face_recognition"]