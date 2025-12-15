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
    1. Photo එක save කරනවා (BOTH original photo AND embedding)
    2. Face detect කරනවා
    3. Embedding extract කරනවා (128-dim or 512-dim vector)
    4. Embedding save කරනවා .pkl file එකේ
    
    Future attendance marking වලදී මේ embedding එක use කරනවා compare කරන්න.
    """
    check_dependencies()
    
    # Validate inputs
    if not employee_id or not organization_uuid:
        raise HTTPException(
            status_code=400,
            detail="employee_id and organization_uuid are required"
        )
    
    logger.info(f"🔵 Registration request received:")
    logger.info(f"   Employee ID: {employee_id}")
    logger.info(f"   Organization: {organization_uuid}")
    logger.info(f"   Image filename: {image.filename}")
    
    # Save photo to organization folder
    org_dir = UPLOAD_DIR / organization_uuid
    org_dir.mkdir(parents=True, exist_ok=True)
    photo_path = org_dir / f"{employee_id}.jpg"
    
    try:
        # Save the uploaded file
        logger.info(f"💾 Saving photo to: {photo_path}")
        save_upload_file(image, photo_path)
        
        # Verify file was saved
        if not photo_path.exists():
            logger.error(f"❌ Photo file not found after save: {photo_path}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save employee photo"
            )
        
        file_size = photo_path.stat().st_size
        logger.info(f"✅ Photo saved successfully: {photo_path} ({file_size} bytes)")
        
        # Register using embedding service
        # This will:
        # 1. Extract face embedding from photo
        # 2. Save embedding to .pkl file
        embedding_service = get_embedding_service()
        success, message = embedding_service.register_employee(
            organization_uuid=organization_uuid,
            employee_id=employee_id,
            image_path=str(photo_path)
        )
        
        if success:
            pkl_file = embedding_service._get_org_file(organization_uuid)
            logger.info(f"✅ Registration successful!")
            logger.info(f"   Employee ID: {employee_id}")
            logger.info(f"   Organization: {organization_uuid}")
            logger.info(f"   Photo path: {photo_path}")
            logger.info(f"   Embedding file: {pkl_file}")
            
            return {
                "success": True,
                "message": message,
                "employee_id": employee_id,
                "organization_uuid": organization_uuid,
                "photo_path": str(photo_path),
                "embedding_file": str(pkl_file),
                "registered": True
            }
        else:
            # Delete photo if registration failed
            if photo_path.exists():
                photo_path.unlink()
                logger.warning(f"🗑️ Deleted photo due to registration failure: {photo_path}")
            
            logger.error(f"❌ Registration failed: {message}")
            raise HTTPException(status_code=400, detail=message)
            
    except HTTPException:
        raise
    except Exception as e:
        # Cleanup on error
        if photo_path.exists():
            photo_path.unlink()
            logger.error(f"🗑️ Deleted photo due to error: {photo_path}")
        
        logger.error(f"❌ Registration error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


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
    
    logger.info(f"🔍 Identification request for org: {organization_uuid}")
    
    # Save live image temporarily
    temp_filename = f"identify_{uuid.uuid4().hex}.jpg"
    temp_path = TEMP_DIR / temp_filename
    
    try:
        save_upload_file(image, temp_path)
        logger.info(f"💾 Saved temp image: {temp_path}")
        
        # Verify temp file exists
        if not temp_path.exists():
            logger.error("❌ Failed to save temporary image")
            raise HTTPException(
                status_code=500,
                detail="Failed to save temporary image"
            )
        
        # Identify using embedding service
        embedding_service = get_embedding_service()
        result = embedding_service.identify_employee(
            organization_uuid=organization_uuid,
            image_path=str(temp_path)
        )
        
        if result.get("identified"):
            logger.info(f"✅ Identified employee: {result.get('employee_id')} ({result.get('similarity_percent')})")
        else:
            logger.warning(f"⚠️ Face not identified: {result.get('message')}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Identification error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Identification failed: {str(e)}"
        )
    finally:
        # Always cleanup temp file
        if temp_path.exists():
            temp_path.unlink()
            logger.debug(f"🗑️ Cleaned up temp file: {temp_path}")


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
    
    logger.info(f"✓ Verification request: employee={employee_id}, org={organization_uuid}")
    
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
        
        if result.get("verified"):
            logger.info(f"✅ Verification successful: {result.get('similarity_percent')}")
        else:
            logger.warning(f"❌ Verification failed: {result.get('message')}")
        
        return result
        
    finally:
        if temp_path.exists():
            temp_path.unlink()


@router.get("/status/{organization_uuid}/{employee_id}")
async def check_face_status(organization_uuid: str, employee_id: str):
    """
    Check if an employee has registered their face.
    
    Returns registration status for specific employee.
    """
    check_dependencies()
    
    logger.info(f"📋 Status check: employee={employee_id}, org={organization_uuid}")
    
    embedding_service = get_embedding_service()
    
    # Check if employee exists in cache
    # Convert employee_id to string to match registration
    employee_id_str = str(employee_id)
    org_embeddings = embedding_service._cache.get(organization_uuid, {})
    
    # Check both string and original employee_id
    is_registered = (
        employee_id_str in org_embeddings or 
        employee_id in org_embeddings
    )
    
    logger.info(f"📊 Status result: registered={is_registered}")
    logger.info(f"   Organization has {len(org_embeddings)} registered employees")
    
    if is_registered:
        logger.info(f"   ✅ Employee {employee_id} is registered")
    else:
        logger.info(f"   ❌ Employee {employee_id} is NOT registered")
        logger.debug(f"   Registered IDs in org: {list(org_embeddings.keys())}")
    
    return {
        "employee_id": employee_id,
        "organization_uuid": organization_uuid,
        "registered": is_registered,
        "total_registered": len(org_embeddings)
    }


@router.get("/stats/{organization_uuid}")
async def get_organization_stats(organization_uuid: str):
    """
    Get face registration statistics for an organization.
    """
    check_dependencies()
    
    embedding_service = get_embedding_service()
    
    org_embeddings = embedding_service._cache.get(organization_uuid, {})
    registered_employees = list(org_embeddings.keys())
    
    logger.info(f"📊 Stats for org {organization_uuid}: {len(registered_employees)} employees")
    
    return {
        "organization_uuid": organization_uuid,
        "total_registered": len(registered_employees),
        "registered_employees": registered_employees
    }


@router.delete("/deregister/{organization_uuid}/{employee_id}")
async def deregister_employee_face(organization_uuid: str, employee_id: str):
    """
    Remove an employee's face registration.
    """
    check_dependencies()
    
    logger.info(f"🗑️ Deregistration request: employee={employee_id}, org={organization_uuid}")
    
    embedding_service = get_embedding_service()
    success = embedding_service.deregister_employee(organization_uuid, employee_id)
    
    # Also delete photo
    photo_path = UPLOAD_DIR / organization_uuid / f"{employee_id}.jpg"
    if photo_path.exists():
        photo_path.unlink()
        logger.info(f"   Deleted photo: {photo_path}")
    
    if success:
        logger.info(f"✅ Employee {employee_id} deregistered successfully")
        return {
            "success": True,
            "message": "Employee face deregistered successfully"
        }
    else:
        logger.warning(f"❌ Employee {employee_id} not found or not registered")
        raise HTTPException(status_code=404, detail="Employee not found or not registered")