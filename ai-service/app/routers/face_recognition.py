"""
Face Recognition Router - Embedding Based
Fast face recognition using pre-computed embeddings.

Endpoints:
- POST /api/face/register - Register employee face (extract & save embedding)
- POST /api/face/identify - Identify employee from photo (kiosk mode)
- POST /api/face/verify - Verify specific employee's face
- GET /api/face/status/{org}/{emp} - Check registration status
- DELETE /api/face/deregister/{org}/{emp} - Remove registration
- GET /api/face/health - Service health check
- GET /api/face/stats/{org} - Organization statistics
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
import logging

from app.services.embedding_service import get_embedding_service, DEEPFACE_AVAILABLE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/face", tags=["Face Recognition"])

# Directory to store original photos (optional backup)
UPLOAD_DIR = Path("uploads/employee_photos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

TEMP_DIR = Path("uploads/temp")
TEMP_DIR.mkdir(parents=True, exist_ok=True)


def check_dependencies():
    """Check if face recognition is available"""
    if not DEEPFACE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Face recognition service is not available. Dependencies not installed."
        )


def save_upload_file(upload_file: UploadFile, destination: Path) -> str:
    """Save uploaded file to disk"""
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return str(destination)
    finally:
        upload_file.file.close()


# ============================================================
# ENDPOINTS
# ============================================================

@router.get("/health")
async def face_health_check():
    """
    Check if face recognition service is healthy.
    """
    embedding_service = get_embedding_service()
    
    return {
        "status": "healthy" if DEEPFACE_AVAILABLE else "unhealthy",
        "service": "Face Recognition (Embedding-based)",
        "dependencies_installed": DEEPFACE_AVAILABLE,
        "model": embedding_service.model_name if DEEPFACE_AVAILABLE else None,
        "similarity_threshold": embedding_service.similarity_threshold if DEEPFACE_AVAILABLE else None,
        "message": "Face recognition service is running with embedding support." if DEEPFACE_AVAILABLE else "Dependencies not installed."
    }


@router.post("/register")
async def register_employee_face(
    employee_id: str = Form(..., description="Employee's unique ID"),
    organization_uuid: str = Form(..., description="Organization's UUID"),
    image: UploadFile = File(..., description="Clear photo of employee's face")
):
    """
    Register an employee's face.
    
    මේකෙන් කරන්නේ:
    1. Photo එක save කරනවා
    2. Face detect කරනවා
    3. Embedding extract කරනවා (512-dim vector)
    4. Embedding save කරනවා
    
    Future attendance marking වලදී මේ embedding එක use කරනවා compare කරන්න.
    """
    check_dependencies()
    
    # Save photo to organization folder
    org_dir = UPLOAD_DIR / organization_uuid
    org_dir.mkdir(parents=True, exist_ok=True)
    photo_path = org_dir / f"{employee_id}.jpg"
    
    try:
        # Save the uploaded file
        save_upload_file(image, photo_path)
        
        # Register using embedding service
        embedding_service = get_embedding_service()
        success, message = embedding_service.register_employee(
            organization_uuid=organization_uuid,
            employee_id=employee_id,
            image_path=str(photo_path)
        )
        
        if success:
            logger.info(f"✅ Registered employee {employee_id} in org {organization_uuid}")
            return {
                "success": True,
                "message": message,
                "employee_id": employee_id,
                "organization_uuid": organization_uuid
            }
        else:
            # Delete photo if registration failed
            if photo_path.exists():
                photo_path.unlink()
            raise HTTPException(status_code=400, detail=message)
            
    except HTTPException:
        raise
    except Exception as e:
        # Cleanup on error
        if photo_path.exists():
            photo_path.unlink()
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/identify")
async def identify_employee(
    organization_uuid: str = Form(..., description="Organization's UUID"),
    image: UploadFile = File(..., description="Live photo from camera")
):
    """
    Identify which employee this face belongs to.
    
    මේක Kiosk mode එකේදී use කරනවා:
    1. Camera එකෙන් photo ගන්නවා
    2. Photo එකේ embedding extract කරනවා
    3. Organization එකේ registered employees ලා එක්ක compare කරනවා
    4. Best match return කරනවා
    
    Fast! - embedding comparison = simple math, not image processing
    """
    check_dependencies()
    
    # Save live image temporarily
    temp_filename = f"identify_{uuid.uuid4().hex}.jpg"
    temp_path = TEMP_DIR / temp_filename
    
    try:
        save_upload_file(image, temp_path)
        
        # Identify using embedding service
        embedding_service = get_embedding_service()
        result = embedding_service.identify_employee(
            organization_uuid=organization_uuid,
            image_path=str(temp_path)
        )
        
        return result
        
    finally:
        # Always cleanup temp file
        if temp_path.exists():
            temp_path.unlink()


@router.post("/verify")
async def verify_employee_face(
    employee_id: str = Form(..., description="Employee's unique ID"),
    organization_uuid: str = Form(..., description="Organization's UUID"),
    live_image: UploadFile = File(..., description="Live photo from webcam")
):
    """
    Verify if a face matches a specific employee.
    
    Identify එකට වඩා fast - known employee එකයි compare කරන්නේ.
    """
    check_dependencies()
    
    temp_filename = f"verify_{uuid.uuid4().hex}.jpg"
    temp_path = TEMP_DIR / temp_filename
    
    try:
        save_upload_file(live_image, temp_path)
        
        embedding_service = get_embedding_service()
        result = embedding_service.verify_employee(
            organization_uuid=organization_uuid,
            employee_id=employee_id,
            image_path=str(temp_path)
        )
        
        return result
        
    finally:
        if temp_path.exists():
            temp_path.unlink()


@router.get("/status/{organization_uuid}/{employee_id}")
async def check_registration_status(organization_uuid: str, employee_id: str):
    """
    Check if an employee's face is registered.
    """
    embedding_service = get_embedding_service()
    is_registered = embedding_service.is_registered(organization_uuid, employee_id)
    
    # Also check if photo exists
    photo_path = UPLOAD_DIR / organization_uuid / f"{employee_id}.jpg"
    
    return {
        "registered": is_registered,
        "employee_id": employee_id,
        "organization_uuid": organization_uuid,
        "photo_exists": photo_path.exists(),
        "message": "Employee is registered" if is_registered else "Employee is not registered"
    }


@router.delete("/deregister/{organization_uuid}/{employee_id}")
async def deregister_employee_face(organization_uuid: str, employee_id: str):
    """
    Remove an employee's face registration.
    """
    embedding_service = get_embedding_service()
    success = embedding_service.deregister_employee(organization_uuid, employee_id)
    
    # Also delete photo
    photo_path = UPLOAD_DIR / organization_uuid / f"{employee_id}.jpg"
    if photo_path.exists():
        photo_path.unlink()
    
    if success:
        return {
            "success": True,
            "message": "Employee face deregistered successfully"
        }
    else:
        raise HTTPException(status_code=404, detail="Employee not found or not registered")


@router.get("/stats/{organization_uuid}")
async def get_organization_stats(organization_uuid: str):
    """
    Get face registration statistics for an organization.
    """
    embedding_service = get_embedding_service()
    stats = embedding_service.get_org_stats(organization_uuid)
    return stats