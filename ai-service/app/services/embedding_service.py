"""
Face Embedding Service - Updated to use Storage Service
"""

import logging
import numpy as np
from typing import Optional, Dict, List, Tuple
from pathlib import Path

from app.services.storage_service import get_storage_service

logger = logging.getLogger(__name__)

# Check if DeepFace dependencies are available
DEEPFACE_AVAILABLE = False
try:
    from deepface import DeepFace
    import cv2
    DEEPFACE_AVAILABLE = True
    logger.info("DeepFace dependencies loaded successfully")
except ImportError as e:
    logger.warning(f"DeepFace dependencies not available: {e}")

class EmbeddingService:
    """Face embedding service with Azure/Local storage support."""
    
    def __init__(self):
        self.model_name = "Facenet"
        self.similarity_threshold = 0.6
        self.storage = get_storage_service()
        
        # Cache embeddings in memory for faster lookups
        self._embedding_cache: Dict[str, dict] = {}
        
        logger.info(f"EmbeddingService initialized with {self.model_name}")
    
    def get_embedding_from_image(self, image_data: bytes) -> Optional[np.ndarray]:
        """Extract face embedding from image bytes."""
        try:
            from deepface import DeepFace
            import cv2
            import numpy as np
            
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.error("Failed to decode image")
                return None
            
            # Get embedding
            result = DeepFace.represent(
                img_path=img,
                model_name=self.model_name,
                enforce_detection=True,
                detector_backend="opencv"
            )
            
            if result and len(result) > 0:
                return np.array(result[0]["embedding"])
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to extract embedding: {e}")
            return None
    
    def register_employee(self, organization_uuid: str, employee_id: str, 
                         image_data: bytes) -> Tuple[bool, str]:
        """
        Register an employee's face.
        Returns (success, message)
        """
        try:
            # 1. Extract embedding from image
            embedding = self.get_embedding_from_image(image_data)
            
            if embedding is None:
                return False, "No face detected in image"
            
            # 2. Save photo
            self.storage.save_photo(organization_uuid, employee_id, image_data)
            
            # 3. Load existing embeddings for organization
            org_embeddings = self.storage.get_embedding(organization_uuid) or {}
            
            # 4. Add/update employee embedding
            org_embeddings[employee_id] = {
                "embedding": embedding.tolist(),
                "employee_id": employee_id
            }
            
            # 5. Save updated embeddings
            self.storage.save_embedding(organization_uuid, org_embeddings)
            
            # 6. Update cache
            self._embedding_cache[organization_uuid] = org_embeddings
            
            logger.info(f"Employee {employee_id} registered successfully for org {organization_uuid}")
            return True, "Face registered successfully"
            
        except Exception as e:
            logger.error(f"Failed to register employee: {e}")
            return False, f"Registration failed: {str(e)}"
    
    def identify_employee(self, organization_uuid: str, 
                         image_data: bytes) -> Tuple[Optional[str], float, str]:
        """
        Identify an employee from an image.
        Returns (employee_id, confidence, message)
        """
        try:
            # 1. Extract embedding from input image
            input_embedding = self.get_embedding_from_image(image_data)
            
            if input_embedding is None:
                return None, 0.0, "No face detected in image"
            
            # 2. Get organization embeddings (from cache or storage)
            org_embeddings = self._get_org_embeddings(organization_uuid)
            
            if not org_embeddings:
                return None, 0.0, "No registered employees found"
            
            # 3. Find best match
            best_match_id = None
            best_similarity = 0.0
            
            for emp_id, data in org_embeddings.items():
                stored_embedding = np.array(data["embedding"])
                similarity = self._cosine_similarity(input_embedding, stored_embedding)
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match_id = emp_id
            
            # 4. Check threshold
            if best_similarity >= self.similarity_threshold:
                logger.info(f"Employee identified: {best_match_id} (confidence: {best_similarity:.2%})")
                return best_match_id, best_similarity, "Employee identified successfully"
            else:
                return None, best_similarity, "Face not recognized"
                
        except Exception as e:
            logger.error(f"Failed to identify employee: {e}")
            return None, 0.0, f"Identification failed: {str(e)}"
    
    def deregister_employee(self, organization_uuid: str, employee_id: str) -> Tuple[bool, str]:
        """Remove an employee's face registration."""
        try:
            # 1. Load embeddings
            org_embeddings = self.storage.get_embedding(organization_uuid) or {}
            
            # 2. Remove employee
            if employee_id in org_embeddings:
                del org_embeddings[employee_id]
                
                # 3. Save updated embeddings
                self.storage.save_embedding(organization_uuid, org_embeddings)
                
                # 4. Delete photo
                self.storage.delete_photo(organization_uuid, employee_id)
                
                # 5. Update cache
                self._embedding_cache[organization_uuid] = org_embeddings
                
                logger.info(f"Employee {employee_id} deregistered from org {organization_uuid}")
                return True, "Face deregistered successfully"
            else:
                return False, "Employee not found"
                
        except Exception as e:
            logger.error(f"Failed to deregister employee: {e}")
            return False, f"Deregistration failed: {str(e)}"
    
    def get_registration_status(self, organization_uuid: str, 
                                employee_id: str) -> Dict:
        """Check if employee is registered."""
        org_embeddings = self._get_org_embeddings(organization_uuid)
        
        is_registered = employee_id in org_embeddings if org_embeddings else False
        
        return {
            "employee_id": employee_id,
            "organization_uuid": organization_uuid,
            "is_registered": is_registered
        }
    
    def _get_org_embeddings(self, organization_uuid: str) -> Optional[dict]:
        """Get organization embeddings from cache or storage."""
        # Check cache first
        if organization_uuid in self._embedding_cache:
            return self._embedding_cache[organization_uuid]
        
        # Load from storage
        embeddings = self.storage.get_embedding(organization_uuid)
        
        if embeddings:
            self._embedding_cache[organization_uuid] = embeddings
        
        return embeddings
    
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# Singleton instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """Get or create the embedding service singleton."""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service