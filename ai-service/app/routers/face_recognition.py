"""
Face Recognition Router - Embedding Based with Azure Blob Storage Support
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

# Temp directory for processing (not for permanent storage)
TEMP_DIR = Path("uploads/temp")
TEMP_DIR.mkdir(parents=True, exist_ok=True)


def check_dependencies():
    """Check if face recognition is available"""
    if not DEEPFACE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Face recognition service is not available. Dependencies not installed."
        )


async def read_upload_file_bytes(upload_file: UploadFile) -> bytes:
    """Read uploaded file content as bytes."""
    try:
        content = await upload_file.read()
        return content
    finally:
        await upload_file.seek(0)  # Reset file pointer


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
        "storage_type": "Azure Blob" if embedding_service.storage.use_azure else "Local",
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
    
    Process:
    1. Read image bytes
    2. Extract face embedding (128-dim vector)
    3. Save photo to Azure Blob Storage (or local)
    4. Save embedding to Azure Blob Storage (or local .pkl file)
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
    
    try:
        # Read image bytes from uploaded file
        image_bytes = await read_upload_file_bytes(image)
        
        if not image_bytes or len(image_bytes) == 0:
            logger.error("❌ Empty image file received")
            raise HTTPException(status_code=400, detail="Empty image file")
        
        logger.info(f"📥 Received image: {len(image_bytes)} bytes")
        
        # Register using embedding service (handles both photo and embedding storage)
        embedding_service = get_embedding_service()
        success, message = embedding_service.register_employee(
            organization_uuid=organization_uuid,
            employee_id=str(employee_id),
            image_data=image_bytes  # Pass bytes directly
        )
        
        if success:
            logger.info(f"✅ Registration successful!")
            logger.info(f"   Employee ID: {employee_id}")
            logger.info(f"   Organization: {organization_uuid}")
            logger.info(f"   Storage: {'Azure Blob' if embedding_service.storage.use_azure else 'Local'}")
            
            return {
                "success": True,
                "message": message,
                "employee_id": employee_id,
                "organization_uuid": organization_uuid,
                "storage_type": "azure_blob" if embedding_service.storage.use_azure else "local",
                "registered": True
            }
        else:
            logger.error(f"❌ Registration failed: {message}")
            raise HTTPException(status_code=400, detail=message)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Registration error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/identify")
async def identify_employee(
    organization_uuid: str = Form(..., description="Organization's UUID"),
    image: UploadFile = File(..., description="Live photo from camera")
):
    """
    Identify which employee this face belongs to.
    
    Used in Kiosk mode for attendance:
    1. Receive camera photo
    2. Extract embedding
    3. Compare with all registered employees
    4. Return best match if above threshold
    """
    check_dependencies()
    
    logger.info(f"🔍 Identification request for org: {organization_uuid}")
    
    try:
        # Read image bytes
        image_bytes = await read_upload_file_bytes(image)
        
        if not image_bytes or len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        logger.info(f"📥 Received identification image: {len(image_bytes)} bytes")
        
        # Identify using embedding service
        embedding_service = get_embedding_service()
        employee_id, similarity, message = embedding_service.identify_employee(
            organization_uuid=organization_uuid,
            image_data=image_bytes
        )
        
        if employee_id:
            logger.info(f"✅ Identified employee: {employee_id} ({similarity:.2%})")
            return {
                "identified": True,
                "employee_id": employee_id,
                "similarity": similarity,
                "similarity_percent": f"{similarity:.1%}",
                "message": message
            }
        else:
            logger.warning(f"⚠️ Face not identified: {message}")
            return {
                "identified": False,
                "employee_id": None,
                "similarity": similarity,
                "similarity_percent": f"{similarity:.1%}",
                "message": message
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Identification error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Identification failed: {str(e)}"
        )


@router.post("/verify")
async def verify_employee_face(
    employee_id: str = Form(..., description="Employee's unique ID"),
    organization_uuid: str = Form(..., description="Organization's UUID"),
    live_image: UploadFile = File(..., description="Live photo from webcam")
):
    """
    Verify if a face matches a specific employee.
    Faster than identify - only compares with one person.
    """
    check_dependencies()
    
    logger.info(f"✓ Verification request: employee={employee_id}, org={organization_uuid}")
    
    try:
        # Read image bytes
        image_bytes = await read_upload_file_bytes(live_image)
        
        if not image_bytes or len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        embedding_service = get_embedding_service()
        verified, similarity, message = embedding_service.verify_employee(
            organization_uuid=organization_uuid,
            employee_id=str(employee_id),
            image_data=image_bytes
        )
        
        if verified:
            logger.info(f"✅ Verification successful: {similarity:.2%}")
        else:
            logger.warning(f"❌ Verification failed: {message}")
        
        return {
            "verified": verified,
            "employee_id": employee_id,
            "similarity": similarity,
            "similarity_percent": f"{similarity:.1%}",
            "message": message
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Verification error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )


@router.get("/status/{organization_uuid}/{employee_id}")
async def check_face_status(organization_uuid: str, employee_id: str):
    """
    Check if an employee has registered their face.
    """
    check_dependencies()
    
    logger.info(f"📋 Status check: employee={employee_id}, org={organization_uuid}")
    
    embedding_service = get_embedding_service()
    
    # Use the proper method from embedding service
    status = embedding_service.get_registration_status(
        organization_uuid=organization_uuid,
        employee_id=str(employee_id)
    )
    
    is_registered = status.get("is_registered", False)
    
    # Get total count from cache
    org_embeddings = embedding_service._get_org_embeddings(organization_uuid) or {}
    total_registered = len(org_embeddings)
    
    logger.info(f"📊 Status result: registered={is_registered}")
    logger.info(f"   Organization has {total_registered} registered employees")
    
    return {
        "employee_id": employee_id,
        "organization_uuid": organization_uuid,
        "registered": is_registered,
        "total_registered": total_registered
    }


@router.get("/stats/{organization_uuid}")
async def get_organization_stats(organization_uuid: str):
    """
    Get face registration statistics for an organization.
    """
    check_dependencies()
    
    embedding_service = get_embedding_service()
    
    # Get embeddings from cache or storage
    org_embeddings = embedding_service._get_org_embeddings(organization_uuid) or {}
    registered_employees = list(org_embeddings.keys())
    
    logger.info(f"📊 Stats for org {organization_uuid}: {len(registered_employees)} employees")
    
    return {
        "organization_uuid": organization_uuid,
        "total_registered": len(registered_employees),
        "registered_employees": registered_employees,
        "storage_type": "azure_blob" if embedding_service.storage.use_azure else "local"
    }


@router.delete("/deregister/{organization_uuid}/{employee_id}")
async def deregister_employee_face(organization_uuid: str, employee_id: str):
    """
    Remove an employee's face registration.
    Deletes both photo and embedding from storage.
    """
    check_dependencies()
    
    logger.info(f"🗑️ Deregistration request: employee={employee_id}, org={organization_uuid}")
    
    embedding_service = get_embedding_service()
    success, message = embedding_service.deregister_employee(
        organization_uuid=organization_uuid,
        employee_id=str(employee_id)
    )
    
    if success:
        logger.info(f"✅ Employee {employee_id} deregistered successfully")
        return {
            "success": True,
            "message": message
        }
    else:
        logger.warning(f"❌ Deregistration failed: {message}")
        raise HTTPException(status_code=404, detail=message)