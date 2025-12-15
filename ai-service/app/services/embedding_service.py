"""
Face Embedding Service
Handles face embedding extraction, storage, and matching.

Embedding එකක් කියන්නේ face එකක features 128/512 numbers වලින් represent කරන vector එකක්.
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
    logger.info("✅ DeepFace library loaded successfully")
except ImportError:
    DEEPFACE_AVAILABLE = False
    logger.warning("❌ DeepFace not installed! Face recognition will not work.")


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
        
        # Model name - Facenet512 is better accuracy, Facenet is faster
        self.model_name = "Facenet"  # Returns 128-dim embeddings (fast)
        # Alternative: "Facenet512" for 512-dim embeddings (more accurate)
        
        # Similarity threshold (higher = more strict)
        # 0.65 = 65% similarity required for match
        self.similarity_threshold = 0.65
        
        # Load existing embeddings to cache on startup
        self._load_all_embeddings()
        
        logger.info(f"🚀 EmbeddingService initialized")
        logger.info(f"   Data directory: {self.data_dir}")
        logger.info(f"   Model: {self.model_name}")
        logger.info(f"   Similarity threshold: {self.similarity_threshold}")
    
    def _get_org_file(self, organization_uuid: str) -> Path:
        """Get the embeddings file path for an organization"""
        return self.data_dir / f"{organization_uuid}.pkl"
    
    def _load_all_embeddings(self):
        """Load all embeddings from disk to memory cache"""
        try:
            loaded_count = 0
            for pkl_file in self.data_dir.glob("*.pkl"):
                org_uuid = pkl_file.stem
                with open(pkl_file, 'rb') as f:
                    self._cache[org_uuid] = pickle.load(f)
                employee_count = len(self._cache[org_uuid])
                logger.info(f"📂 Loaded {employee_count} embeddings for org: {org_uuid[:8]}...")
                loaded_count += 1
            
            if loaded_count > 0:
                logger.info(f"✅ Loaded embeddings from {loaded_count} organization(s)")
            else:
                logger.info(f"📭 No existing embeddings found (fresh start)")
                
        except Exception as e:
            logger.error(f"❌ Error loading embeddings: {e}", exc_info=True)
    
    def _save_org_embeddings(self, organization_uuid: str):
        """Save organization embeddings to disk"""
        try:
            file_path = self._get_org_file(organization_uuid)
            embeddings = self._cache.get(organization_uuid, {})
            
            with open(file_path, 'wb') as f:
                pickle.dump(embeddings, f)
            
            logger.info(f"💾 Saved {len(embeddings)} embeddings for org: {organization_uuid[:8]}...")
            logger.info(f"   File: {file_path}")
            
        except Exception as e:
            logger.error(f"❌ Error saving embeddings: {e}", exc_info=True)
            raise
    
    def extract_embedding(self, image_path: str) -> Optional[np.ndarray]:
        """
        Extract face embedding from an image.
        
        මේකෙන් කරන්නේ photo එකෙන් face detect කරලා,
        ඒකේ features extract කරලා 128/512-dimensional vector එකක් return කරනවා.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            numpy array (128-dim or 512-dim depending on model), or None if no face detected
        """
        if not DEEPFACE_AVAILABLE:
            raise RuntimeError("DeepFace is not installed")
        
        try:
            logger.debug(f"🔍 Extracting embedding from: {image_path}")
            
            # DeepFace.represent() extracts the face embedding
            # මේක internally:
            # 1. Face detect කරනවා (opencv detector)
            # 2. Face align කරනවා (straighten)
            # 3. Neural network එකෙන් features extract කරනවා
            # 4. 128 or 512 numbers return කරනවා
            
            result = DeepFace.represent(
                img_path=image_path,
                model_name=self.model_name,
                enforce_detection=True,  # Must have a face
                detector_backend="opencv"  # Fast detector
            )
            
            if result and len(result) > 0:
                embedding = np.array(result[0]["embedding"])
                logger.info(f"✅ Extracted embedding with shape: {embedding.shape}")
                return embedding
            
            logger.warning("⚠️ No embedding returned from DeepFace")
            return None
            
        except ValueError as e:
            # This happens when no face is detected
            logger.warning(f"⚠️ No face detected in image: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Error extracting embedding: {e}", exc_info=True)
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
            return None, "No face detected in image. Please ensure the photo clearly shows a face."
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Embedding extraction error: {error_msg}")
            return None, f"Failed to process image: {error_msg}"
    
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
            logger.info(f"🔵 Starting registration:")
            logger.info(f"   Employee ID: {employee_id}")
            logger.info(f"   Organization: {organization_uuid[:8]}...")
            logger.info(f"   Image path: {image_path}")
            
            # Verify image file exists
            if not Path(image_path).exists():
                error_msg = f"Image file not found: {image_path}"
                logger.error(f"❌ {error_msg}")
                return False, error_msg
            
            # Extract embedding
            embedding, message = self.extract_embedding_safe(image_path)
            
            if embedding is None:
                logger.error(f"❌ Failed to extract embedding: {message}")
                return False, message
            
            logger.info(f"✅ Extracted embedding with shape: {embedding.shape}")
            
            # Initialize org dict if needed
            if organization_uuid not in self._cache:
                self._cache[organization_uuid] = {}
                logger.info(f"📁 Initialized new organization in cache: {organization_uuid[:8]}...")
            
            # Store embedding - Convert employee_id to string to ensure consistency
            employee_id_str = str(employee_id)
            self._cache[organization_uuid][employee_id_str] = embedding
            
            logger.info(f"💾 Stored embedding in memory for employee: {employee_id_str}")
            
            # Save to disk
            self._save_org_embeddings(organization_uuid)
            
            total_in_org = len(self._cache[organization_uuid])
            logger.info(f"✅ Registration successful!")
            logger.info(f"   Employee ID: {employee_id_str}")
            logger.info(f"   Total employees in org: {total_in_org}")
            
            return True, "Face registered successfully"
            
        except Exception as e:
            error_msg = f"Registration failed: {str(e)}"
            logger.error(f"❌ {error_msg}", exc_info=True)
            return False, error_msg
    
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
            logger.warning("⚠️ Zero-norm vector encountered in similarity calculation")
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
            logger.info(f"🔍 Starting identification in org: {organization_uuid[:8]}...")
            
            # Step 1: Extract embedding from live photo
            live_embedding, message = self.extract_embedding_safe(image_path)
            
            if live_embedding is None:
                logger.warning(f"⚠️ Could not extract embedding: {message}")
                return {
                    "identified": False,
                    "message": message,
                    "error": "no_face"
                }
            
            logger.info(f"✅ Extracted live embedding: shape={live_embedding.shape}")
            
            # Step 2: Get organization's embeddings
            org_embeddings = self._cache.get(organization_uuid, {})
            
            if not org_embeddings:
                logger.warning(f"⚠️ No registered employees in org: {organization_uuid[:8]}...")
                return {
                    "identified": False,
                    "message": "No registered employees in this organization",
                    "error": "no_employees"
                }
            
            logger.info(f"📊 Comparing with {len(org_embeddings)} registered employees")
            
            # Step 3: Compare with all employees
            best_match = None
            best_similarity = 0.0
            
            for emp_id, stored_embedding in org_embeddings.items():
                similarity = self.calculate_similarity(live_embedding, stored_embedding)
                
                logger.debug(f"   Employee {emp_id}: similarity={similarity:.4f}")
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = emp_id
            
            # Step 4: Check if best match exceeds threshold
            if best_match and best_similarity >= self.similarity_threshold:
                logger.info(f"✅ Match found!")
                logger.info(f"   Employee ID: {best_match}")
                logger.info(f"   Similarity: {best_similarity:.2%}")
                
                return {
                    "identified": True,
                    "employee_id": best_match,
                    "confidence": round(best_similarity, 4),
                    "similarity_percent": f"{best_similarity:.1%}",
                    "message": "Employee identified successfully"
                }
            else:
                logger.warning(f"❌ No match found")
                logger.warning(f"   Best similarity: {best_similarity:.2%}")
                logger.warning(f"   Threshold: {self.similarity_threshold:.2%}")
                
                return {
                    "identified": False,
                    "message": "Face not recognized. Please try again or register your face.",
                    "best_similarity": round(best_similarity, 4) if best_match else 0,
                    "threshold": self.similarity_threshold,
                    "error": "no_match"
                }
                
        except Exception as e:
            logger.error(f"❌ Error during identification: {e}", exc_info=True)
            return {
                "identified": False,
                "message": f"Identification error: {str(e)}",
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
            logger.info(f"✓ Verifying employee: {employee_id} in org: {organization_uuid[:8]}...")
            
            # Get stored embedding
            org_embeddings = self._cache.get(organization_uuid, {})
            
            # Try both string and original ID
            employee_id_str = str(employee_id)
            stored_embedding = org_embeddings.get(employee_id_str) or org_embeddings.get(employee_id)
            
            if stored_embedding is None:
                logger.warning(f"⚠️ Employee {employee_id} not registered")
                return {
                    "verified": False,
                    "message": "Employee not registered. Please register face first.",
                    "error": "not_registered"
                }
            
            # Extract live embedding
            live_embedding, message = self.extract_embedding_safe(image_path)
            
            if live_embedding is None:
                logger.warning(f"⚠️ Could not extract embedding: {message}")
                return {
                    "verified": False,
                    "message": message,
                    "error": "no_face"
                }
            
            # Compare
            similarity = self.calculate_similarity(live_embedding, stored_embedding)
            verified = similarity >= self.similarity_threshold
            
            if verified:
                logger.info(f"✅ Verification successful: {similarity:.2%}")
            else:
                logger.warning(f"❌ Verification failed: {similarity:.2%} < {self.similarity_threshold:.2%}")
            
            return {
                "verified": verified,
                "confidence": round(similarity, 4),
                "similarity_percent": f"{similarity:.1%}",
                "threshold": self.similarity_threshold,
                "message": "Face verified successfully" if verified else "Face does not match registered employee"
            }
            
        except Exception as e:
            logger.error(f"❌ Error during verification: {e}", exc_info=True)
            return {
                "verified": False,
                "message": f"Verification error: {str(e)}",
                "error": "exception"
            }
    
    def is_registered(self, organization_uuid: str, employee_id: str) -> bool:
        """
        Check if an employee is registered.
        
        Args:
            organization_uuid: Organization identifier
            employee_id: Employee identifier
            
        Returns:
            True if registered, False otherwise
        """
        org_embeddings = self._cache.get(organization_uuid, {})
        employee_id_str = str(employee_id)
        
        is_reg = employee_id_str in org_embeddings or employee_id in org_embeddings
        
        logger.debug(f"Registration check: {employee_id} -> {is_reg}")
        
        return is_reg
    
    def deregister_employee(self, organization_uuid: str, employee_id: str) -> bool:
        """
        Remove an employee's embedding.
        
        Args:
            organization_uuid: Organization identifier
            employee_id: Employee identifier
            
        Returns:
            True if deregistered, False if not found
        """
        try:
            employee_id_str = str(employee_id)
            
            if organization_uuid in self._cache:
                # Try both string and original ID
                deleted = False
                
                if employee_id_str in self._cache[organization_uuid]:
                    del self._cache[organization_uuid][employee_id_str]
                    deleted = True
                
                if employee_id in self._cache[organization_uuid]:
                    del self._cache[organization_uuid][employee_id]
                    deleted = True
                
                if deleted:
                    self._save_org_embeddings(organization_uuid)
                    logger.info(f"✅ Deregistered employee {employee_id}")
                    return True
            
            logger.warning(f"⚠️ Employee {employee_id} not found for deregistration")
            return False
            
        except Exception as e:
            logger.error(f"❌ Error deregistering: {e}", exc_info=True)
            return False
    
    def get_org_stats(self, organization_uuid: str) -> Dict:
        """
        Get statistics for an organization.
        
        Args:
            organization_uuid: Organization identifier
            
        Returns:
            Dictionary with statistics
        """
        org_embeddings = self._cache.get(organization_uuid, {})
        
        return {
            "organization_uuid": organization_uuid,
            "registered_count": len(org_embeddings),
            "employee_ids": list(org_embeddings.keys())
        }


# Global instance - singleton pattern
_embedding_service: Optional[EmbeddingService] = None

def get_embedding_service() -> EmbeddingService:
    """
    Get the global embedding service instance (singleton).
    
    Returns:
        EmbeddingService instance
    """
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service