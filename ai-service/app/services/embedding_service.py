"""
Face Embedding Service - With Azure Blob Storage Support
Handles face embedding extraction, storage, and comparison.
"""

import logging
import numpy as np
from typing import Optional, Dict, Tuple, Any

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
        if not DEEPFACE_AVAILABLE:
            logger.error("DeepFace not available")
            return None
            
        try:
            from deepface import DeepFace
            import cv2
            
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.error("Failed to decode image")
                return None
            
            logger.info(f"Image decoded: {img.shape}")
            
            # Get embedding
            result = DeepFace.represent(
                img_path=img,
                model_name=self.model_name,
                enforce_detection=True,
                detector_backend="opencv"
            )
            
            if result and len(result) > 0:
                embedding = np.array(result[0]["embedding"])
                logger.info(f"Embedding extracted: {embedding.shape}")
                return embedding
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to extract embedding: {e}")
            return None
    
    def _extract_embedding_from_data(self, data: Any, emp_id: str) -> Optional[np.ndarray]:
        """
        Extract embedding array from various data formats.
        Handles both old and new storage formats.
        
        Supported formats:
        - {"embedding": [...], "employee_id": "..."} (new format)
        - [...] (direct array - old format)
        - np.ndarray (direct numpy array)
        """
        try:
            if isinstance(data, dict):
                if "embedding" in data:
                    # New format: {"embedding": [...], "employee_id": "..."}
                    return np.array(data["embedding"])
                else:
                    logger.warning(f"Dict without 'embedding' key for employee {emp_id}: {list(data.keys())}")
                    return None
            elif isinstance(data, (list, tuple)):
                # Old format: direct embedding array
                return np.array(data)
            elif isinstance(data, np.ndarray):
                # Already numpy array
                return data
            else:
                logger.warning(f"Unknown data type for employee {emp_id}: {type(data)}")
                return None
        except Exception as e:
            logger.error(f"Failed to extract embedding for {emp_id}: {e}")
            return None
    
    def register_employee(self, organization_uuid: str, employee_id: str, 
                         image_data: bytes) -> Tuple[bool, str]:
        """
        Register an employee's face.
        
        Args:
            organization_uuid: Organization's unique identifier
            employee_id: Employee's unique identifier
            image_data: Raw image bytes
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            logger.info(f"Registering employee {employee_id} for org {organization_uuid}")
            
            # 1. Extract embedding from image
            embedding = self.get_embedding_from_image(image_data)
            
            if embedding is None:
                return False, "No face detected in image. Please ensure face is clearly visible."
            
            logger.info(f"Face detected, embedding extracted")
            
            # 2. Save photo to storage (Azure Blob or Local)
            photo_path = self.storage.save_photo(
                organization_uuid=organization_uuid,
                employee_id=str(employee_id),
                photo_data=image_data,
                filename=f"{employee_id}.jpg"
            )
            logger.info(f"Photo saved: {photo_path}")
            
            # 3. Load existing embeddings for organization
            org_embeddings = self.storage.get_embedding(organization_uuid) or {}
            
            # 4. Add/update employee embedding (consistent format)
            org_embeddings[str(employee_id)] = {
                "embedding": embedding.tolist(),
                "employee_id": str(employee_id)
            }
            
            # 5. Save updated embeddings
            self.storage.save_embedding(organization_uuid, org_embeddings)
            logger.info(f"Embeddings saved for org {organization_uuid}")
            
            # 6. Update cache
            self._embedding_cache[organization_uuid] = org_embeddings
            
            logger.info(f"✅ Employee {employee_id} registered successfully for org {organization_uuid}")
            return True, "Face registered successfully"
            
        except Exception as e:
            logger.error(f"Failed to register employee: {e}", exc_info=True)
            return False, f"Registration failed: {str(e)}"
    
    def identify_employee(self, organization_uuid: str, 
                         image_data: bytes) -> Tuple[Optional[str], float, str]:
        """
        Identify an employee from an image.
        
        Returns:
            Tuple of (employee_id, similarity, message)
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
            
            logger.info(f"Comparing against {len(org_embeddings)} registered employees")
            
            # Debug: Log data structure
            if org_embeddings:
                first_key = next(iter(org_embeddings.keys()))
                first_value = org_embeddings[first_key]
                logger.debug(f"Data structure - Key: {first_key}, Value type: {type(first_value)}")
                if isinstance(first_value, dict):
                    logger.debug(f"Dict keys: {list(first_value.keys())}")
            
            # 3. Find best match
            best_match_id = None
            best_similarity = 0.0
            
            for emp_id, data in org_embeddings.items():
                try:
                    # Handle different data formats
                    stored_embedding = self._extract_embedding_from_data(data, emp_id)
                    
                    if stored_embedding is None:
                        logger.warning(f"Skipping employee {emp_id} - invalid embedding data")
                        continue
                    
                    similarity = self._cosine_similarity(input_embedding, stored_embedding)
                    
                    logger.debug(f"Employee {emp_id}: similarity = {similarity:.4f}")
                    
                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_match_id = emp_id
                        
                except Exception as emp_error:
                    logger.warning(f"Error processing employee {emp_id}: {emp_error}")
                    continue
            
            # 4. Check threshold
            if best_match_id and best_similarity >= self.similarity_threshold:
                logger.info(f"Employee identified: {best_match_id} (confidence: {best_similarity:.2%})")
                return best_match_id, best_similarity, "Employee identified successfully"
            else:
                logger.warning(f"Best match {best_match_id} below threshold: {best_similarity:.2%} < {self.similarity_threshold:.2%}")
                return None, best_similarity, "Face not recognized"
                
        except Exception as e:
            logger.error(f"Failed to identify employee: {e}", exc_info=True)
            return None, 0.0, f"Identification failed: {str(e)}"
    
    def verify_employee(self, organization_uuid: str, employee_id: str,
                       image_data: bytes) -> Tuple[bool, float, str]:
        """
        Verify if a face matches a specific employee.
        
        Returns:
            Tuple of (verified: bool, similarity: float, message: str)
        """
        try:
            # 1. Extract embedding from input image
            input_embedding = self.get_embedding_from_image(image_data)
            
            if input_embedding is None:
                return False, 0.0, "No face detected in image"
            
            # 2. Get organization embeddings
            org_embeddings = self._get_org_embeddings(organization_uuid)
            
            if not org_embeddings:
                return False, 0.0, "No registered employees found"
            
            # 3. Check if employee exists
            employee_id_str = str(employee_id)
            if employee_id_str not in org_embeddings:
                return False, 0.0, f"Employee {employee_id} is not registered"
            
            # 4. Get stored embedding - handle different formats
            emp_data = org_embeddings[employee_id_str]
            stored_embedding = self._extract_embedding_from_data(emp_data, employee_id_str)
            
            if stored_embedding is None:
                return False, 0.0, f"Invalid embedding data for employee {employee_id}"
            
            similarity = self._cosine_similarity(input_embedding, stored_embedding)
            
            # 5. Check threshold
            if similarity >= self.similarity_threshold:
                logger.info(f"Verification successful for {employee_id}: {similarity:.2%}")
                return True, similarity, "Face verified successfully"
            else:
                logger.warning(f"Verification failed for {employee_id}: {similarity:.2%}")
                return False, similarity, "Face does not match"
                
        except Exception as e:
            logger.error(f"Failed to verify employee: {e}", exc_info=True)
            return False, 0.0, f"Verification failed: {str(e)}"
    
    def deregister_employee(self, organization_uuid: str, employee_id: str) -> Tuple[bool, str]:
        """Remove an employee's face registration."""
        try:
            # 1. Load embeddings
            org_embeddings = self.storage.get_embedding(organization_uuid) or {}
            
            employee_id_str = str(employee_id)
            
            # 2. Remove employee
            if employee_id_str in org_embeddings:
                del org_embeddings[employee_id_str]
                
                # 3. Save updated embeddings
                if org_embeddings:
                    self.storage.save_embedding(organization_uuid, org_embeddings)
                else:
                    # Delete the embedding file if no employees left
                    self.storage.delete_embedding(organization_uuid)
                
                # 4. Delete photo
                self.storage.delete_photo(organization_uuid, employee_id_str)
                
                # 5. Update cache
                self._embedding_cache[organization_uuid] = org_embeddings
                
                logger.info(f"Employee {employee_id} deregistered from org {organization_uuid}")
                return True, "Face deregistered successfully"
            else:
                return False, "Employee not found or not registered"
                
        except Exception as e:
            logger.error(f"Failed to deregister employee: {e}", exc_info=True)
            return False, f"Deregistration failed: {str(e)}"
    
    def get_registration_status(self, organization_uuid: str, 
                                employee_id: str) -> Dict:
        """Check if employee is registered."""
        org_embeddings = self._get_org_embeddings(organization_uuid)
        
        employee_id_str = str(employee_id)
        is_registered = employee_id_str in org_embeddings if org_embeddings else False
        
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
    
    def clear_cache(self, organization_uuid: str = None):
        """Clear embedding cache. Useful after manual data changes."""
        if organization_uuid:
            self._embedding_cache.pop(organization_uuid, None)
            logger.info(f"Cache cleared for org {organization_uuid}")
        else:
            self._embedding_cache.clear()
            logger.info("All embedding cache cleared")


# Singleton instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """Get or create the embedding service singleton."""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service