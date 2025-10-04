"""
Research worker implementation for background job processing.
Handles the complete lifecycle of research job execution with proper error handling.
"""
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from services.appwrite_service import appwrite_service, AppwriteServiceError

logger = logging.getLogger(__name__)


async def execute_research_worker(job_id: str) -> None:
    """
    Background worker function to execute research jobs.
    
    This function handles the complete research job lifecycle:
    1. Fetch job details from Appwrite
    2. Validate job state and update to "processing"
    3. Execute research orchestrator (Phase 5)
    4. Update job with results or handle errors
    5. Comprehensive error handling and logging
    
    Args:
        job_id: The unique identifier for the research job to execute
    """
    execution_start_time = datetime.utcnow()
    
    try:
        logger.info(f"Starting research execution for job {job_id}")
        
        # Step 1: Fetch job details from Appwrite
        job = await appwrite_service.get_research_job(job_id)
        if not job:
            logger.error(f"Job {job_id} not found in database")
            raise ResearchWorkerError(
                message="Research job not found",
                job_id=job_id,
                error_type="job_not_found"
            )
        
        logger.info(f"Job {job_id} fetched successfully - Target: {job.get('target', 'Unknown')}")
        
        # Step 2: Validate job state and update to processing
        current_status = job.get('status', 'unknown')
        if current_status not in ['pending']:
            logger.warning(f"Job {job_id} has unexpected status: {current_status}")
            if current_status == 'processing':
                logger.info(f"Job {job_id} already processing, continuing...")
            elif current_status in ['completed', 'failed']:
                logger.warning(f"Job {job_id} already finished with status {current_status}")
                return
        
        # Update status to processing
        success = await appwrite_service.update_job_status(job_id, "processing")
        if not success:
            raise ResearchWorkerError(
                message="Failed to update job status to processing",
                job_id=job_id,
                error_type="status_update_failed"
            )
        
        logger.info(f"Job {job_id} status updated to processing")
        
        # Step 3: Execute research orchestrator
        logger.info(f"Starting research orchestrator for job {job_id}")
        
        # Import and execute research orchestrator
        from services.research_orchestrator import get_research_orchestrator
        
        orchestrator = get_research_orchestrator()
        orchestrator_result = await orchestrator.run_multi_agent_research(job)
        
        # Convert to ResearchWorkerResult
        research_result = ResearchWorkerResult(
            markdown_report=orchestrator_result['markdown_report'],
            source_count=orchestrator_result['source_count'],
            metadata=orchestrator_result['metadata']
        )
        
        # Step 4: Update job with results
        logger.info(f"Research completed for job {job_id}, updating results...")
        
        success = await appwrite_service.update_job_results(
            job_id=job_id,
            results=research_result.markdown_report,
            total_sources=research_result.source_count
        )
        
        if not success:
            raise ResearchWorkerError(
                message="Failed to save research results",
                job_id=job_id,
                error_type="result_save_failed"
            )
        
        execution_time = (datetime.utcnow() - execution_start_time).total_seconds()
        logger.info(f"Research execution completed successfully for job {job_id} in {execution_time:.1f}s")
        
    except ResearchWorkerError as e:
        logger.error(f"Research worker error for job {job_id}: {e.message}")
        await handle_research_error(job_id, e)
        
    except AppwriteServiceError as e:
        logger.error(f"Appwrite service error for job {job_id}: {e.message}")
        error = ResearchWorkerError(
            message=f"Database error: {e.message}",
            job_id=job_id,
            error_type="database_error"
        )
        await handle_research_error(job_id, error)
        
    except Exception as e:
        logger.error(f"Unexpected error in research execution for job {job_id}: {str(e)}")
        error = ResearchWorkerError(
            message=f"Unexpected error: {str(e)}",
            job_id=job_id,
            error_type="unexpected_error"
        )
        await handle_research_error(job_id, error)


async def handle_research_error(job_id: str, error: 'ResearchWorkerError') -> None:
    """
    Handle research execution errors by updating job status and logging.
    
    Args:
        job_id: The job identifier
        error: The research worker error that occurred
    """
    try:
        logger.info(f"Handling error for job {job_id}: {error.error_type}")
        
        # Update job status to failed with error message
        success = await appwrite_service.update_job_status(
            job_id=job_id,
            status="failed",
            error_message=error.message
        )
        
        if success:
            logger.info(f"Job {job_id} status updated to failed")
        else:
            logger.error(f"Failed to update job {job_id} error status")
            
    except Exception as update_error:
        logger.error(f"Critical: Failed to update job {job_id} with error status: {str(update_error)}")


async def simulate_research_execution(job: Dict[str, Any]) -> 'ResearchWorkerResult':
    """
    Simulate research execution for Phase 4.2 testing.
    This will be replaced with actual research orchestrator in Phase 5.
    
    Args:
        job: The research job document from Appwrite
        
    Returns:
        Simulated research results
    """
    logger.info("Simulating research execution (Phase 4.2 placeholder)")
    
    # Simulate processing time (reduced for testing)
    await asyncio.sleep(2)  # In real implementation, this would be 10-15 minutes
    
    target = job.get('target', 'Unknown Target')
    enabled_agents = job.get('enabled_agents', ['company_discovery'])
    person_name = job.get('person_name')
    
    # Generate simulated markdown report
    report_sections = [
        f"# Market Research Report: {target}",
        f"*Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC*",
        "",
        "## Executive Summary",
        f"This is a simulated research report for {target}.",
        f"Research was conducted using the following agents: {', '.join(enabled_agents)}",
        "",
        "## Company Profile",
        f"**Company:** {target}",
        "**Industry:** Technology (simulated)",
        "**Status:** Active (simulated)",
        "",
        "## Key Findings",
        "- This is simulated data for Phase 4.2 testing",
        "- Actual research will be implemented in Phase 5",
        "- Integration with Exa and Cerebras APIs pending",
        ""
    ]
    
    if person_name:
        report_sections.extend([
            f"## Person Profile: {person_name}",
            f"**Name:** {person_name}",
            "**Role:** Executive (simulated)",
            "",
            "### Talking Points",
            "- Discuss recent company developments",
            "- Ask about technology initiatives",
            "- Mention industry trends",
            ""
        ])
    
    report_sections.extend([
        "## Sources",
        "1. Simulated Source 1 - Company Website",
        "2. Simulated Source 2 - Industry Report", 
        "3. Simulated Source 3 - News Article",
        "",
        "---",
        "*This report was generated by CLARIQ Research Agents*"
    ])
    
    markdown_report = "\n".join(report_sections)
    
    # Create result object
    metadata = {
        "execution_time": 2.0,
        "agents_used": enabled_agents,
        "target": target,
        "simulation": True
    }
    
    return ResearchWorkerResult(
        markdown_report=markdown_report,
        source_count=3,  # Simulated source count
        metadata=metadata
    )


async def validate_research_job(job: Dict[str, Any]) -> bool:
    """
    Validate that a research job has all required fields and is in valid state.
    
    Args:
        job: The research job document
        
    Returns:
        True if job is valid for execution
        
    Raises:
        ResearchWorkerError: If job validation fails
    """
    required_fields = ['user_id', 'target', 'enabled_agents', 'status']
    
    for field in required_fields:
        if not job.get(field):
            raise ResearchWorkerError(
                message=f"Missing required field: {field}",
                job_id=job.get('$id', 'unknown'),
                error_type="validation_error"
            )
    
    # Validate enabled_agents is not empty
    if not job.get('enabled_agents') or len(job.get('enabled_agents', [])) == 0:
        raise ResearchWorkerError(
            message="No research agents enabled",
            job_id=job.get('$id', 'unknown'),
            error_type="validation_error"
        )
    
    return True


class ResearchWorkerResult:
    """
    Data class to hold research execution results.
    Contains all information needed to update the job in Appwrite.
    """
    def __init__(self, markdown_report: str, source_count: int, metadata: Dict[str, Any]):
        self.markdown_report = markdown_report
        self.source_count = source_count
        self.metadata = metadata
        self.execution_time = metadata.get("execution_time", 0)
        self.agents_used = metadata.get("agents_used", [])
        self.target = metadata.get("target", "Unknown")
        self.is_simulation = metadata.get("simulation", False)
        
        # Validate required fields
        if not markdown_report:
            raise ValueError("Markdown report cannot be empty")
        if source_count < 0:
            raise ValueError("Source count cannot be negative")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for logging/debugging."""
        return {
            "source_count": self.source_count,
            "execution_time": self.execution_time,
            "agents_used": self.agents_used,
            "target": self.target,
            "report_length": len(self.markdown_report),
            "is_simulation": self.is_simulation
        }


class ResearchWorkerError(Exception):
    """
    Custom exception for research worker errors.
    Provides structured error information for better handling and logging.
    """
    
    # Error type constants
    JOB_NOT_FOUND = "job_not_found"
    VALIDATION_ERROR = "validation_error"
    STATUS_UPDATE_FAILED = "status_update_failed"
    RESULT_SAVE_FAILED = "result_save_failed"
    DATABASE_ERROR = "database_error"
    RESEARCH_EXECUTION_ERROR = "research_execution_error"
    UNEXPECTED_ERROR = "unexpected_error"
    
    def __init__(self, message: str, job_id: str, error_type: str = UNEXPECTED_ERROR):
        self.message = message
        self.job_id = job_id
        self.error_type = error_type
        self.timestamp = datetime.utcnow().isoformat() + "Z"
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for logging."""
        return {
            "message": self.message,
            "job_id": self.job_id,
            "error_type": self.error_type,
            "timestamp": self.timestamp
        }
    
    def is_retryable(self) -> bool:
        """
        Determine if this error type is retryable.
        
        Returns:
            True if the operation could potentially succeed on retry
        """
        non_retryable_errors = [
            self.JOB_NOT_FOUND,
            self.VALIDATION_ERROR
        ]
        return self.error_type not in non_retryable_errors