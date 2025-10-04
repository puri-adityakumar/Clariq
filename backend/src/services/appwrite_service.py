"""
Appwrite backend service for research job management.
This service handles all database operations for research jobs.
"""
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AppwriteService:
    """
    Service class for interacting with Appwrite database.
    Handles all CRUD operations for research jobs.
    """
    
    def __init__(self):
        self.client = Client()
        self.client.set_endpoint(settings.appwrite_endpoint)
        self.client.set_project(settings.appwrite_project_id)
        self.client.set_key(settings.appwrite_api_key or "")
        
        self.databases = Databases(self.client)
        self.database_id = settings.appwrite_database_id
        self.collection_id = settings.appwrite_research_collection_id
        self.voice_collection_id = settings.appwrite_voice_collection_id
        
        # Log configuration status
        if self.is_configured():
            logger.info("Appwrite service configured successfully")
        else:
            logger.warning("Appwrite service not fully configured - some operations may fail")
    
    async def get_research_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a research job by ID from Appwrite.
        
        Args:
            job_id: The unique identifier for the research job
            
        Returns:
            Job document as dictionary, or None if not found
            
        Raises:
            AppwriteException: If database operation fails
        """
        try:
            logger.info(f"Fetching research job {job_id} from Appwrite")
            
            response = self.databases.get_document(
                database_id=self.database_id,
                collection_id=self.collection_id,
                document_id=job_id
            )
            
            logger.info(f"Successfully fetched job {job_id}")
            return response
            
        except AppwriteException as e:
            if e.code == 404:
                logger.warning(f"Research job {job_id} not found")
                return None
            else:
                logger.error(f"Failed to fetch job {job_id}: {e.message}")
                raise
        except Exception as e:
            logger.error(f"Unexpected error fetching job {job_id}: {str(e)}")
            raise
    
    async def update_research_job(self, job_id: str, data: Dict[str, Any]) -> bool:
        """
        Update a research job in Appwrite.
        
        Args:
            job_id: The unique identifier for the research job
            data: Dictionary of fields to update
            
        Returns:
            True if update successful, False otherwise
            
        Raises:
            AppwriteException: If database operation fails
        """
        try:
            logger.info(f"Updating research job {job_id} with data: {list(data.keys())}")
            
            # Add update timestamp
            update_data = {
                **data,
                "updated_at": datetime.utcnow().isoformat() + "Z"
            }
            
            response = self.databases.update_document(
                database_id=self.database_id,
                collection_id=self.collection_id,
                document_id=job_id,
                data=update_data
            )
            
            logger.info(f"Successfully updated job {job_id}")
            return True
            
        except AppwriteException as e:
            logger.error(f"Failed to update job {job_id}: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error updating job {job_id}: {str(e)}")
            raise
    
    async def update_job_status(self, job_id: str, status: str, error_message: Optional[str] = None) -> bool:
        """
        Update just the status of a research job.
        
        Args:
            job_id: The unique identifier for the research job
            status: New status (pending, processing, completed, failed)
            error_message: Optional error message if status is failed
            
        Returns:
            True if update successful
        """
        update_data = {"status": status}
        
        if error_message:
            update_data["error_message"] = error_message
            
        if status == "completed":
            update_data["completed_at"] = datetime.utcnow().isoformat() + "Z"
        
        return await self.update_research_job(job_id, update_data)
    
    async def update_job_results(self, job_id: str, results: str, total_sources: int) -> bool:
        """
        Update a research job with completed results.
        
        Args:
            job_id: The unique identifier for the research job
            results: The markdown research report
            total_sources: Number of sources analyzed
            
        Returns:
            True if update successful
        """
        update_data = {
            "status": "completed",
            "results": results,
            "total_sources": total_sources,
            "completed_at": datetime.utcnow().isoformat() + "Z"
        }
        
        return await self.update_research_job(job_id, update_data)
    
    # Voice Collection Methods
    
    async def create_document(self, database_id: str, collection_id: str, document_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a document in any collection.
        
        Args:
            database_id: Database ID
            collection_id: Collection ID  
            document_id: Document ID
            data: Document data
            
        Returns:
            Created document
        """
        try:
            logger.info(f"Creating document {document_id} in collection {collection_id}")
            
            response = self.databases.create_document(
                database_id=database_id,
                collection_id=collection_id,
                document_id=document_id,
                data=data
            )
            
            # Convert response to dict
            if hasattr(response, 'dict'):
                result = response.dict()
            elif hasattr(response, '__dict__'):
                result = vars(response)
            else:
                result = dict(response) if response else {}
            
            logger.info(f"Successfully created document {document_id}")
            return result
            
        except AppwriteException as e:
            logger.error(f"Failed to create document {document_id}: {e.message} (code: {e.code})")
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating document {document_id}: {str(e)}", exc_info=True)
            raise
    
    async def get_document(self, database_id: str, collection_id: str, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a document from any collection.
        
        Args:
            database_id: Database ID
            collection_id: Collection ID
            document_id: Document ID
            
        Returns:
            Document data or None if not found
        """
        try:
            logger.info(f"Fetching document {document_id} from collection {collection_id}")
            
            response = self.databases.get_document(
                database_id=database_id,
                collection_id=collection_id,
                document_id=document_id
            )
            
            # Convert response to dict
            if hasattr(response, 'dict'):
                result = response.dict()
            elif hasattr(response, '__dict__'):
                result = vars(response)
            else:
                result = dict(response) if response else {}
            
            logger.info(f"Successfully fetched document {document_id}")
            return result
            
        except AppwriteException as e:
            if e.code == 404:
                logger.warning(f"Document {document_id} not found in {collection_id}")
                return None
            else:
                logger.error(f"Failed to fetch document {document_id}: {e.message} (code: {e.code})")
                raise
        except Exception as e:
            logger.error(f"Unexpected error fetching document {document_id}: {str(e)}", exc_info=True)
            raise
    
    async def update_document(self, database_id: str, collection_id: str, document_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a document in any collection.
        
        Args:
            database_id: Database ID
            collection_id: Collection ID
            document_id: Document ID
            data: Update data
            
        Returns:
            Updated document
        """
        try:
            logger.info(f"Updating document {document_id} in collection {collection_id} with keys: {list(data.keys())}")
            
            response = self.databases.update_document(
                database_id=database_id,
                collection_id=collection_id,
                document_id=document_id,
                data=data
            )
            
            # Convert response to dict
            if hasattr(response, 'dict'):
                result = response.dict()
            elif hasattr(response, '__dict__'):
                result = vars(response)
            else:
                result = dict(response) if response else {}
            
            logger.info(f"Successfully updated document {document_id}")
            return result
            
        except AppwriteException as e:
            logger.error(f"Failed to update document {document_id}: {e.message} (code: {e.code})")
            raise
        except Exception as e:
            logger.error(f"Unexpected error updating document {document_id}: {str(e)}", exc_info=True)
            raise
    
    async def list_documents(self, database_id: str, collection_id: str, queries: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        List documents from any collection.
        
        Args:
            database_id: Database ID
            collection_id: Collection ID
            queries: Optional queries for filtering/sorting
            
        Returns:
            List response with documents and total count
        """
        try:
            logger.info(f"Listing documents from collection {collection_id} with queries: {queries}")
            
            response = self.databases.list_documents(
                database_id=database_id,
                collection_id=collection_id,
                queries=queries or []
            )
            
            # Convert response to dict if it's not already
            if hasattr(response, 'dict'):
                result = response.dict()
            elif hasattr(response, '__dict__'):
                result = vars(response)
            else:
                result = dict(response) if response else {}
            
            logger.info(f"Successfully listed {len(result.get('documents', []))} documents from {collection_id}")
            return result
            
        except AppwriteException as e:
            logger.error(f"Failed to list documents from {collection_id}: {e.message} (code: {e.code})")
            raise
        except Exception as e:
            logger.error(f"Unexpected error listing documents from {collection_id}: {str(e)}", exc_info=True)
            raise
    
    def is_configured(self) -> bool:
        """
        Check if Appwrite service is properly configured.
        
        Returns:
            True if all required settings are available
        """
        return bool(
            settings.appwrite_project_id and 
            settings.appwrite_api_key and
            settings.appwrite_database_id and
            settings.appwrite_research_collection_id
        )


# Global service instance
appwrite_service = AppwriteService()


class AppwriteServiceError(Exception):
    """Custom exception for Appwrite service errors."""
    def __init__(self, message: str, job_id: str, operation: str = "unknown"):
        self.message = message
        self.job_id = job_id
        self.operation = operation
        super().__init__(self.message)