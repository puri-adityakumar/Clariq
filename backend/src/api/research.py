from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from core.auth import AppwriteUser
from core.config import get_settings
from schemas.responses import SuccessResponse, ResponseMeta
from workers.research_worker import execute_research_worker
from utils.rate_limiting import check_research_rate_limit
import logging

router = APIRouter(prefix="/v1/research", tags=["research"])
settings = get_settings()
logger = logging.getLogger(__name__)


def get_current_user(request: Request) -> AppwriteUser:
    """
    Dependency to extract authenticated user from request state.
    """
    if not hasattr(request.state, 'user'):
        raise HTTPException(
            status_code=401, 
            detail="User information not found in request"
        )
    
    return request.state.user


class ResearchExecuteResponse(BaseModel):
    """Response model for research execution endpoint."""
    job_id: str
    status: str
    message: str
    estimated_completion: str


class ResearchStatusResponse(BaseModel):
    """Response model for research status endpoint."""
    job_id: str
    status: str
    progress: Optional[str] = None
    error_message: Optional[str] = None
    created_at: str
    updated_at: str


@router.post("/execute/{job_id}", response_model=SuccessResponse)
async def execute_research_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    user: AppwriteUser = Depends(get_current_user)
):
    """
    Execute a research job by job ID.
    
    This endpoint:
    1. Validates the job_id exists in Appwrite
    2. Checks the job belongs to the authenticated user
    3. Updates status to "processing" 
    4. Queues the research job as a background task
    5. Returns 202 Accepted with estimated completion time
    
    Args:
        job_id: The unique identifier for the research job
        background_tasks: FastAPI background tasks for async processing
        user: Authenticated user from middleware
    
    Returns:
        202 Accepted with job execution details
    
    Raises:
        404: Job not found or doesn't belong to user
        400: Job is not in a valid state for execution
        500: Internal server error during job setup
    """
    try:
        logger.info(f"Research execution requested - Job ID: {job_id}, User: {user.email}")
        
        # Step 0: Check rate limit
        check_research_rate_limit(user.id, "execution")
        
        # Import Appwrite service
        from services.appwrite_service import appwrite_service
        
        # Step 1: Validate job exists and belongs to user
        job = await appwrite_service.get_research_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Research job not found")
        
        if job.get('user_id') != user.id:
            raise HTTPException(status_code=404, detail="Research job not found")
        
        # Step 2: Check job status is valid for execution
        if job.get('status') not in ["pending"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Job cannot be executed. Current status: {job.get('status')}"
            )
        
        # Step 3: Update job status to "processing"
        await appwrite_service.update_job_status(job_id, "processing")
        
        # Step 4: Queue background research task
        background_tasks.add_task(execute_research_worker, job_id)
        
        # Step 5: Calculate estimated completion (10-15 minutes from now)
        estimated_completion = datetime.utcnow().replace(microsecond=0)
        estimated_completion = estimated_completion.replace(minute=estimated_completion.minute + 12)
        estimated_completion_str = estimated_completion.isoformat() + "Z"
        
        logger.info(f"Research job {job_id} queued for execution by user {user.id}")
        
        # Simulate the response for now
        response_data = ResearchExecuteResponse(
            job_id=job_id,
            status="processing",
            message="Research job has been queued for execution",
            estimated_completion=estimated_completion_str
        )
        
        return JSONResponse(
            status_code=202,  # 202 Accepted for async processing
            content={
                "data": response_data.model_dump(),
                "meta": {
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "service": settings.service_name,
                    "version": settings.service_version,
                },
                "message": "Research execution started successfully"
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error executing research job {job_id}: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {repr(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Research execution failed: {str(e)}"
        )


@router.get("/status/{job_id}", response_model=SuccessResponse)
async def get_research_status(
    job_id: str,
    user: AppwriteUser = Depends(get_current_user)
):
    """
    Get the current status of a research job.
    
    This endpoint provides real-time status information about a research job,
    including progress updates and error messages if applicable.
    
    Args:
        job_id: The unique identifier for the research job
        user: Authenticated user from middleware
    
    Returns:
        Current job status and metadata
    
    Raises:
        404: Job not found or doesn't belong to user
        500: Internal server error during status retrieval
    """
    try:
        logger.info(f"Status check requested - Job ID: {job_id}, User: {user.email}")
        
        # Step 0: Check rate limit
        check_research_rate_limit(user.id, "status")
        
        # Import Appwrite service
        from services.appwrite_service import appwrite_service
        
        # Step 1: Fetch job from Appwrite
        job = await appwrite_service.get_research_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Research job not found")
        
        if job.get('user_id') != user.id:
            raise HTTPException(status_code=404, detail="Research job not found")
        
        # Build response data from actual job
        response_data = ResearchStatusResponse(
            job_id=job_id,
            status=job.get('status', 'pending'),
            progress=None,  # Could add progress tracking later
            error_message=job.get('error_message'),
            created_at=job.get('created_at', datetime.utcnow().isoformat() + "Z"),
            updated_at=job.get('updated_at', job.get('created_at', datetime.utcnow().isoformat() + "Z"))
        )
        
        logger.info(f"Status retrieved for job {job_id}: {response_data.status}")
        
        return {
            "data": response_data.model_dump(),
            "meta": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "service": settings.service_name,
                "version": settings.service_version,
            },
            "message": f"Status retrieved successfully for job {job_id}"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting status for job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while retrieving job status"
        )


@router.get("/health", include_in_schema=False)
async def research_health_check():
    """
    Health check endpoint for the research service.
    Used for monitoring and debugging.
    """
    return {
        "service": "research",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "features": {
            "job_execution": True,
            "status_checking": True,
            "background_processing": True,
            "appwrite_integration": False,  # Will be True in Phase 4.3
            "research_agents": False        # Will be True in Phase 5
        }
    }