"""
Storage Service - Handles file storage for photos and embeddings
Supports both local storage (development) and Azure Blob Storage (production)
"""

import os
import pickle
import logging
from pathlib import Path
from typing import Optional, Union
from io import BytesIO

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Azure imports (optional - only loaded if using Azure)
try:
    from azure.storage.blob import BlobServiceClient, ContentSettings
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    logger.warning("Azure Storage SDK not installed. Using local storage only.")


class StorageService:
    """
    Unified storage service for employee photos and face embeddings.
    Automatically switches between local and Azure Blob storage based on configuration.
    """
    
    def __init__(self):
        self.use_azure = settings.USE_AZURE_STORAGE and AZURE_AVAILABLE
        
        if self.use_azure:
            self._init_azure_storage()
        else:
            self._init_local_storage()
        
        logger.info(f"Storage Service initialized. Using {'Azure Blob' if self.use_azure else 'Local'} storage.")
    
    def _init_azure_storage(self):
        """Initialize Azure Blob Storage client."""
        try:
            self.blob_service = BlobServiceClient.from_connection_string(
                settings.AZURE_STORAGE_CONNECTION_STRING
            )
            self.photos_container = self.blob_service.get_container_client(
                settings.AZURE_PHOTOS_CONTAINER
            )
            self.embeddings_container = self.blob_service.get_container_client(
                settings.AZURE_EMBEDDINGS_CONTAINER
            )
            logger.info("Azure Blob Storage connected successfully!")
        except Exception as e:
            logger.error(f"Failed to connect to Azure Blob Storage: {e}")
            logger.warning("Falling back to local storage.")
            self.use_azure = False
            self._init_local_storage()
    
    def _init_local_storage(self):
        """Initialize local storage directories."""
        self.photos_dir = Path("uploads/employee_photos")
        self.embeddings_dir = Path("data/embeddings")
        self.photos_dir.mkdir(parents=True, exist_ok=True)
        self.embeddings_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Local storage initialized: {self.photos_dir}, {self.embeddings_dir}")
    
    # ==================== PHOTO STORAGE ====================
    
    def save_photo(self, organization_uuid: str, employee_id: str, photo_data: bytes, 
                   filename: str = "photo.jpg") -> str:
        """
        Save employee photo.
        Returns the storage path/URL.
        """
        if self.use_azure:
            return self._save_photo_azure(organization_uuid, employee_id, photo_data, filename)
        return self._save_photo_local(organization_uuid, employee_id, photo_data, filename)
    
    def _save_photo_azure(self, org_uuid: str, emp_id: str, photo_data: bytes, filename: str) -> str:
        """Save photo to Azure Blob Storage."""
        blob_name = f"{org_uuid}/{emp_id}/{filename}"
        try:
            blob_client = self.photos_container.get_blob_client(blob_name)
            
            # Set content type for images
            content_settings = ContentSettings(content_type="image/jpeg")
            
            blob_client.upload_blob(
                photo_data, 
                overwrite=True,
                content_settings=content_settings
            )
            
            logger.info(f"Photo saved to Azure: {blob_name}")
            return blob_name
        except Exception as e:
            logger.error(f"Failed to save photo to Azure: {e}")
            raise
    
    def _save_photo_local(self, org_uuid: str, emp_id: str, photo_data: bytes, filename: str) -> str:
        """Save photo to local filesystem."""
        photo_dir = self.photos_dir / org_uuid
        photo_dir.mkdir(parents=True, exist_ok=True)
        
        photo_path = photo_dir / f"{emp_id}.jpg"
        photo_path.write_bytes(photo_data)
        
        logger.info(f"Photo saved locally: {photo_path}")
        return str(photo_path)
    
    def get_photo(self, organization_uuid: str, employee_id: str) -> Optional[bytes]:
        """Retrieve employee photo."""
        if self.use_azure:
            return self._get_photo_azure(organization_uuid, employee_id)
        return self._get_photo_local(organization_uuid, employee_id)
    
    def _get_photo_azure(self, org_uuid: str, emp_id: str) -> Optional[bytes]:
        """Get photo from Azure Blob Storage."""
        blob_name = f"{org_uuid}/{emp_id}/photo.jpg"
        try:
            blob_client = self.photos_container.get_blob_client(blob_name)
            return blob_client.download_blob().readall()
        except Exception as e:
            logger.warning(f"Photo not found in Azure: {blob_name}")
            return None
    
    def _get_photo_local(self, org_uuid: str, emp_id: str) -> Optional[bytes]:
        """Get photo from local filesystem."""
        photo_path = self.photos_dir / org_uuid / f"{emp_id}.jpg"
        if photo_path.exists():
            return photo_path.read_bytes()
        return None
    
    def delete_photo(self, organization_uuid: str, employee_id: str) -> bool:
        """Delete employee photo."""
        if self.use_azure:
            return self._delete_photo_azure(organization_uuid, employee_id)
        return self._delete_photo_local(organization_uuid, employee_id)
    
    def _delete_photo_azure(self, org_uuid: str, emp_id: str) -> bool:
        """Delete photo from Azure Blob Storage."""
        blob_name = f"{org_uuid}/{emp_id}/photo.jpg"
        try:
            blob_client = self.photos_container.get_blob_client(blob_name)
            blob_client.delete_blob()
            logger.info(f"Photo deleted from Azure: {blob_name}")
            return True
        except Exception as e:
            logger.warning(f"Failed to delete photo from Azure: {e}")
            return False
    
    def _delete_photo_local(self, org_uuid: str, emp_id: str) -> bool:
        """Delete photo from local filesystem."""
        photo_path = self.photos_dir / org_uuid / f"{emp_id}.jpg"
        try:
            if photo_path.exists():
                photo_path.unlink()
                logger.info(f"Photo deleted locally: {photo_path}")
            return True
        except Exception as e:
            logger.warning(f"Failed to delete local photo: {e}")
            return False
    
    # ==================== EMBEDDING STORAGE ====================
    
    def save_embedding(self, organization_uuid: str, embedding_data: dict) -> str:
        """
        Save face embedding data (pickle format).
        embedding_data contains employee_id -> embedding vector mapping
        """
        if self.use_azure:
            return self._save_embedding_azure(organization_uuid, embedding_data)
        return self._save_embedding_local(organization_uuid, embedding_data)
    
    def _save_embedding_azure(self, org_uuid: str, embedding_data: dict) -> str:
        """Save embedding to Azure Blob Storage."""
        blob_name = f"{org_uuid}.pkl"
        try:
            blob_client = self.embeddings_container.get_blob_client(blob_name)
            
            # Serialize with pickle
            pickle_data = pickle.dumps(embedding_data)
            
            blob_client.upload_blob(pickle_data, overwrite=True)
            
            logger.info(f"Embedding saved to Azure: {blob_name}")
            return blob_name
        except Exception as e:
            logger.error(f"Failed to save embedding to Azure: {e}")
            raise
    
    def _save_embedding_local(self, org_uuid: str, embedding_data: dict) -> str:
        """Save embedding to local filesystem."""
        embedding_path = self.embeddings_dir / f"{org_uuid}.pkl"
        
        with open(embedding_path, 'wb') as f:
            pickle.dump(embedding_data, f)
        
        logger.info(f"Embedding saved locally: {embedding_path}")
        return str(embedding_path)
    
    def get_embedding(self, organization_uuid: str) -> Optional[dict]:
        """Retrieve face embedding data for an organization."""
        if self.use_azure:
            return self._get_embedding_azure(organization_uuid)
        return self._get_embedding_local(organization_uuid)
    
    def _get_embedding_azure(self, org_uuid: str) -> Optional[dict]:
        """Get embedding from Azure Blob Storage."""
        blob_name = f"{org_uuid}.pkl"
        try:
            blob_client = self.embeddings_container.get_blob_client(blob_name)
            pickle_data = blob_client.download_blob().readall()
            return pickle.loads(pickle_data)
        except Exception as e:
            logger.warning(f"Embedding not found in Azure: {blob_name}")
            return None
    
    def _get_embedding_local(self, org_uuid: str) -> Optional[dict]:
        """Get embedding from local filesystem."""
        embedding_path = self.embeddings_dir / f"{org_uuid}.pkl"
        if embedding_path.exists():
            with open(embedding_path, 'rb') as f:
                return pickle.load(f)
        return None
    
    def delete_embedding(self, organization_uuid: str) -> bool:
        """Delete organization's embedding file."""
        if self.use_azure:
            return self._delete_embedding_azure(organization_uuid)
        return self._delete_embedding_local(organization_uuid)
    
    def _delete_embedding_azure(self, org_uuid: str) -> bool:
        """Delete embedding from Azure Blob Storage."""
        blob_name = f"{org_uuid}.pkl"
        try:
            blob_client = self.embeddings_container.get_blob_client(blob_name)
            blob_client.delete_blob()
            logger.info(f"Embedding deleted from Azure: {blob_name}")
            return True
        except Exception as e:
            logger.warning(f"Failed to delete embedding from Azure: {e}")
            return False
    
    def _delete_embedding_local(self, org_uuid: str) -> bool:
        """Delete embedding from local filesystem."""
        embedding_path = self.embeddings_dir / f"{org_uuid}.pkl"
        try:
            if embedding_path.exists():
                embedding_path.unlink()
                logger.info(f"Embedding deleted locally: {embedding_path}")
            return True
        except Exception as e:
            logger.warning(f"Failed to delete local embedding: {e}")
            return False
    
    def embedding_exists(self, organization_uuid: str) -> bool:
        """Check if embedding exists for organization."""
        if self.use_azure:
            blob_name = f"{organization_uuid}.pkl"
            try:
                blob_client = self.embeddings_container.get_blob_client(blob_name)
                return blob_client.exists()
            except:
                return False
        else:
            embedding_path = self.embeddings_dir / f"{organization_uuid}.pkl"
            return embedding_path.exists()


# Singleton instance
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """Get or create the storage service singleton."""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service