"""
Face Embedding Service
Handles face embedding extraction, storage, and matching.

Embedding එකක් කියන්නේ face එකක features 512 numbers වලින් represent කරන vector එකක්.
මේක fingerprint එකක් වගේ - unique to each person.
"""

import numpy as np
import pickle
import json
from pathlib import Path
from typing import Optional, Dict, List, Tuple
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# DeepFace import
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    logger.warning("DeepFace not installed!")


class EmbeddingService:
    """
    Face Embedding Service
    
    මේ class එකෙන් කරන්නේ:
    1. Face photo එකකින් embedding extract කරනවා
    2. Embeddings save/load කරනවා
    3. Two embeddings compare කරනවා (similarity check)
    4. Organization එකේ employees ලා අතරින් match search කරනවා
    """
    
    def __init__(self, data_dir: str = "data/embeddings"):
        """
        Initialize the service
        
        Args:
            data_dir: Embeddings save කරන folder path එක
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # In-memory cache for fast access
        # {organization_uuid: {employee_id: embedding_array}}
        self._cache: Dict[str, Dict[str, np.ndarray]] = {}
        
        # Model name - Facenet is good balance of speed and accuracy
        self.model_name = "Facenet"
        
        # Similarity threshold (higher = more strict)
        self.similarity_threshold = 0.65
        
        # Load existing embeddings to cache on startup
        self._load_all_embeddings()
        
        logger.info(f"EmbeddingService initialized. Data dir: {self.data_dir}")
    
    def _get_org_file(self, organization_uuid: str) -> Path:
        """Get the embeddings file path for an organization"""
        return self.data_dir / f"{organization_uuid}.pkl"
    
    def _load_all_embeddings(self):
        """Load all embeddings from disk to memory cache"""
        try:
            for pkl_file in self.data_dir.glob("*.pkl"):
                org_uuid = pkl_file.stem
                with open(pkl_file, 'rb') as f:
                    self._cache[org_uuid] = pickle.load(f)
                logger.info(f"Loaded {len(self._cache[org_uuid])} embeddings for org: {org_uuid}")
        except Exception as e:
            logger.error(f"Error loading embeddings: {e}")
    
    def _save_org_embeddings(self, organization_uuid: str):
        """Save organization embeddings to disk"""
        try:
            file_path = self._get_org_file(organization_uuid)
            with open(file_path, 'wb') as f:
                pickle.dump(self._cache.get(organization_uuid, {}), f)
            logger.info(f"Saved embeddings for org: {organization_uuid}")
        except Exception as e:
            logger.error(f"Error saving embeddings: {e}")
            raise
    
    def extract_embedding(self, image_path: str) -> Optional[np.ndarray]:
        """
        Extract face embedding from an image.
        
        මේකෙන් කරන්නේ photo එකෙන් face detect කරලා,
        ඒකේ features extract කරලා 512-dimensional vector එකක් return කරනවා.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            512-dimensional numpy array, or None if no face detected
        """
        if not DEEPFACE_AVAILABLE:
            raise RuntimeError("DeepFace is not installed")
        
        try:
            # DeepFace.represent() extracts the face embedding
            # මේක internally:
            # 1. Face detect කරනවා
            # 2. Face align කරනවා (straighten)
            # 3. Neural network එකෙන් features extract කරනවා
            # 4. 512 numbers return කරනවා
            
            result = DeepFace.represent(
                img_path=image_path,
                model_name=self.model_name,
                enforce_detection=True,  # Must have a face
                detector_backend="opencv"
            )
            
            if result and len(result) > 0:
                embedding = np.array(result[0]["embedding"])
                logger.info(f"Extracted embedding with shape: {embedding.shape}")
                return embedding
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting embedding: {e}")
            return None
    
    def extract_embedding_safe(self, image_path: str) -> Tuple[Optional[np.ndarray], str]:
        """
        Safe version that returns error message instead of raising exception.
        
        Returns:
            Tuple of (embedding or None, message)
        """
        try:
            embedding = self.extract_embedding(image_path)
            if embedding is not None:
                return embedding, "Success"
            return None, "No face detected in image"
        except Exception as e:
            return None, str(e)
    
    def register_employee(
        self, 
        organization_uuid: str, 
        employee_id: str, 
        image_path: str
    ) -> Tuple[bool, str]:
        """
        Register an employee's face embedding.
        
        Photo එකෙන් embedding extract කරලා save කරනවා.
        
        Args:
            organization_uuid: Organization identifier
            employee_id: Employee identifier
            image_path: Path to face photo
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            # Extract embedding
            embedding, message = self.extract_embedding_safe(image_path)
            
            if embedding is None:
                return False, f"Failed to extract embedding: {message}"
            
            # Initialize org dict if needed
            if organization_uuid not in self._cache:
                self._cache[organization_uuid] = {}
            
            # Store embedding
            self._cache[organization_uuid][employee_id] = embedding
            
            # Save to disk
            self._save_org_embeddings(organization_uuid)
            
            logger.info(f"Registered employee {employee_id} in org {organization_uuid}")
            return True, "Face registered successfully"
            
        except Exception as e:
            logger.error(f"Error registering employee: {e}")
            return False, str(e)
    
    def calculate_similarity(
        self, 
        embedding1: np.ndarray, 
        embedding2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Cosine similarity measures the angle between two vectors.
        1.0 = identical, 0.0 = completely different
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Similarity score between 0 and 1
        """
        # Normalize vectors
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Cosine similarity = dot product of normalized vectors
        similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
        
        return float(similarity)
    
    def identify_employee(
        self, 
        organization_uuid: str, 
        image_path: str
    ) -> Dict:
        """
        Identify which employee a face belongs to.
        
        Live photo එකේ embedding extract කරලා,
        organization එකේ සියලුම employees ලගේ embeddings එක්ක compare කරනවා.
        Highest similarity එක threshold එකට වඩා වැඩි නම් match!
        
        Args:
            organization_uuid: Organization to search in
            image_path: Path to live photo
            
        Returns:
            Dict with identified employee or error
        """
        try:
            # Step 1: Extract embedding from live photo
            live_embedding, message = self.extract_embedding_safe(image_path)
            
            if live_embedding is None:
                return {
                    "identified": False,
                    "message": message,
                    "error": "no_face"
                }
            
            # Step 2: Get organization's embeddings
            org_embeddings = self._cache.get(organization_uuid, {})
            
            if not org_embeddings:
                return {
                    "identified": False,
                    "message": "No registered employees in this organization",
                    "error": "no_employees"
                }
            
            # Step 3: Compare with all employees
            best_match = None
            best_similarity = 0.0
            
            for emp_id, stored_embedding in org_embeddings.items():
                similarity = self.calculate_similarity(live_embedding, stored_embedding)
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = emp_id
            
            # Step 4: Check if best match exceeds threshold
            if best_match and best_similarity >= self.similarity_threshold:
                logger.info(f"Identified employee {best_match} with similarity {best_similarity:.2%}")
                return {
                    "identified": True,
                    "employee_id": best_match,
                    "confidence": round(best_similarity, 4),
                    "similarity_percent": f"{best_similarity:.1%}",
                    "message": "Employee identified successfully"
                }
            else:
                return {
                    "identified": False,
                    "message": "Face not recognized",
                    "best_similarity": round(best_similarity, 4) if best_match else 0,
                    "threshold": self.similarity_threshold,
                    "error": "no_match"
                }
                
        except Exception as e:
            logger.error(f"Error identifying employee: {e}")
            return {
                "identified": False,
                "message": str(e),
                "error": "exception"
            }
    
    def verify_employee(
        self, 
        organization_uuid: str, 
        employee_id: str, 
        image_path: str
    ) -> Dict:
        """
        Verify if a face matches a specific employee.
        
        Known employee එකක්ගේ face verify කරන්න - faster than identify
        
        Args:
            organization_uuid: Organization identifier
            employee_id: Employee to verify against
            image_path: Path to live photo
            
        Returns:
            Dict with verification result
        """
        try:
            # Get stored embedding
            org_embeddings = self._cache.get(organization_uuid, {})
            stored_embedding = org_embeddings.get(employee_id)
            
            if stored_embedding is None:
                return {
                    "verified": False,
                    "message": "Employee not registered",
                    "error": "not_registered"
                }
            
            # Extract live embedding
            live_embedding, message = self.extract_embedding_safe(image_path)
            
            if live_embedding is None:
                return {
                    "verified": False,
                    "message": message,
                    "error": "no_face"
                }
            
            # Compare
            similarity = self.calculate_similarity(live_embedding, stored_embedding)
            verified = similarity >= self.similarity_threshold
            
            return {
                "verified": verified,
                "confidence": round(similarity, 4),
                "similarity_percent": f"{similarity:.1%}",
                "threshold": self.similarity_threshold,
                "message": "Face verified" if verified else "Face does not match"
            }
            
        except Exception as e:
            logger.error(f"Error verifying employee: {e}")
            return {
                "verified": False,
                "message": str(e),
                "error": "exception"
            }
    
    def is_registered(self, organization_uuid: str, employee_id: str) -> bool:
        """Check if an employee is registered"""
        return employee_id in self._cache.get(organization_uuid, {})
    
    def deregister_employee(self, organization_uuid: str, employee_id: str) -> bool:
        """Remove an employee's embedding"""
        try:
            if organization_uuid in self._cache:
                if employee_id in self._cache[organization_uuid]:
                    del self._cache[organization_uuid][employee_id]
                    self._save_org_embeddings(organization_uuid)
                    logger.info(f"Deregistered employee {employee_id}")
                    return True
            return False
        except Exception as e:
            logger.error(f"Error deregistering: {e}")
            return False
    
    def get_org_stats(self, organization_uuid: str) -> Dict:
        """Get statistics for an organization"""
        org_embeddings = self._cache.get(organization_uuid, {})
        return {
            "organization_uuid": organization_uuid,
            "registered_count": len(org_embeddings),
            "employee_ids": list(org_embeddings.keys())
        }


# Global instance - singleton pattern
_embedding_service: Optional[EmbeddingService] = None

def get_embedding_service() -> EmbeddingService:
    """Get the global embedding service instance"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service