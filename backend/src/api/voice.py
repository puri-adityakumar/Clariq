"""
Voice sales agent API endpoints.
"""

import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import FileResponse, PlainTextResponse

from core.auth import get_current_user
from schemas.voice import (
    CreateVoiceAgentRequest,
    CreateVoiceAgentResponse,
    VoiceSessionResponse,
    VoiceSessionListResponse,
    TranscriptResponse,
    VoiceSessionStatus
)
from services.appwrite_service import appwrite_service
from services.livekit_service import livekit_service
from services.voice_url_service import voice_url_service
from workers.voice_agent_worker import voice_agent_worker
from utils.transcript_processor import transcript_processor
from core.config import get_settings

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])
settings = get_settings()


@router.post("/create-agent", response_model=CreateVoiceAgentResponse)
async def create_voice_agent(
    request: CreateVoiceAgentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new voice sales agent from a research job.
    
    - Validates research job exists and belongs to user
    - Converts research results to sales context
    - Creates voice session record
    - Generates LiveKit room and deploys agent
    - Returns session details and voice agent URL
    """
    try:
        user_id = current_user["$id"]
        
        # 1. Validate research job exists and belongs to user
        research_job = await appwrite_service.get_document(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_research_collection_id,
            document_id=request.research_job_id
        )
        
        if not research_job or research_job.get("user_id") != user_id:
            raise HTTPException(
                status_code=404,
                detail="Research job not found or access denied"
            )
        
        # Ensure research job is completed
        if research_job.get("status") != "completed":
            raise HTTPException(
                status_code=400,
                detail="Research job must be completed to create voice agent"
            )
        
        # 2. Convert research results to sales context
        context_data = await _convert_research_to_context(research_job)
        
        # 3. Generate session ID and room ID
        session_id = str(uuid.uuid4())
        room_id = f"voice-session-{session_id}"
        
        # 4. Create voice session record
        session_data = {
            "user_id": user_id,
            "research_job_id": request.research_job_id,
            "session_name": request.session_name,
            "livekit_room_id": room_id,
            "context_data": context_data,
            "status": VoiceSessionStatus.PENDING.value,
            "duration_seconds": 0,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        voice_session = await appwrite_service.create_document(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_voice_collection_id,
            document_id=session_id,
            data=session_data
        )
        
        # 5. Create LiveKit room and deploy agent
        try:
            # Create room with agent
            room_result = await livekit_service.create_voice_agent_room(
                session_id=session_id,
                context_data=context_data
            )
            
            # Create and start agent
            agent = await voice_agent_worker.create_sales_agent(
                context_data=context_data,
                session_id=session_id
            )
            
            await voice_agent_worker.start_agent_in_room(
                room_id=room_id,
                agent=agent,
                session_id=session_id
            )
            
            # Generate public voice agent URL
            voice_agent_url = voice_url_service.generate_voice_agent_url(
                session_id=session_id,
                user_id=user_id,
                room_id=room_id
            )
            
            # Update session with URL and status
            await appwrite_service.update_document(
                database_id=settings.appwrite_database_id,
                collection_id=settings.appwrite_voice_collection_id,
                document_id=session_id,
                data={
                    "voice_agent_url": voice_agent_url,
                    "status": VoiceSessionStatus.READY.value
                }
            )
            
            return CreateVoiceAgentResponse(
                session_id=session_id,
                voice_agent_url=voice_agent_url,
                status=VoiceSessionStatus.READY,
                message="Voice agent created successfully"
            )
            
        except Exception as e:
            # Update session status to failed
            await appwrite_service.update_document(
                database_id=settings.appwrite_database_id,
                collection_id=settings.appwrite_voice_collection_id,
                document_id=session_id,
                data={"status": VoiceSessionStatus.FAILED.value}
            )
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create voice agent: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/sessions", response_model=VoiceSessionListResponse)
async def get_voice_sessions(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0)
):
    """
    Get list of user's voice sessions.
    
    Returns paginated list of voice sessions with basic information.
    """
    try:
        user_id = current_user["$id"]
        
        # Get user's voice sessions
        sessions_result = await appwrite_service.list_documents(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_voice_collection_id,
            queries=[
                f'equal("user_id", "{user_id}")',
                f'limit({limit})',
                f'offset({offset})',
                'orderDesc("$createdAt")'
            ]
        )
        
        sessions = []
        for doc in sessions_result.get("documents", []):
            session = VoiceSessionResponse(
                id=doc["$id"],
                user_id=doc["user_id"],
                research_job_id=doc["research_job_id"],
                session_name=doc["session_name"],
                livekit_room_id=doc["livekit_room_id"],
                voice_agent_url=doc.get("voice_agent_url"),
                status=VoiceSessionStatus(doc["status"]),
                duration_seconds=doc.get("duration_seconds"),
                created_at=datetime.fromisoformat(doc["created_at"].replace('Z', '+00:00')),
                completed_at=datetime.fromisoformat(doc["completed_at"].replace('Z', '+00:00')) if doc.get("completed_at") else None
            )
            sessions.append(session)
        
        return VoiceSessionListResponse(
            sessions=sessions,
            total=sessions_result.get("total", 0)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve sessions: {str(e)}"
        )


@router.get("/session/{session_id}", response_model=VoiceSessionResponse)
async def get_voice_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific voice session.
    """
    try:
        user_id = current_user["$id"]
        
        # Get session
        session_doc = await appwrite_service.get_document(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_voice_collection_id,
            document_id=session_id
        )
        
        if not session_doc or session_doc.get("user_id") != user_id:
            raise HTTPException(
                status_code=404,
                detail="Voice session not found or access denied"
            )
        
        return VoiceSessionResponse(
            id=session_doc["$id"],
            user_id=session_doc["user_id"],
            research_job_id=session_doc["research_job_id"],
            session_name=session_doc["session_name"],
            livekit_room_id=session_doc["livekit_room_id"],
            voice_agent_url=session_doc.get("voice_agent_url"),
            status=VoiceSessionStatus(session_doc["status"]),
            duration_seconds=session_doc.get("duration_seconds"),
            created_at=datetime.fromisoformat(session_doc["created_at"].replace('Z', '+00:00')),
            completed_at=datetime.fromisoformat(session_doc["completed_at"].replace('Z', '+00:00')) if session_doc.get("completed_at") else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve session: {str(e)}"
        )


@router.get("/transcript/{session_id}")
async def get_session_transcript(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    download: bool = Query(default=False)
):
    """
    Get or download session transcript.
    
    - If download=true, returns file download
    - If download=false, returns transcript data as JSON
    """
    try:
        user_id = current_user["$id"]
        
        # Get session and validate access
        session_doc = await appwrite_service.get_document(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_voice_collection_id,
            document_id=session_id
        )
        
        if not session_doc or session_doc.get("user_id") != user_id:
            raise HTTPException(
                status_code=404,
                detail="Voice session not found or access denied"
            )
        
        # Check if transcript exists
        transcript_file_id = session_doc.get("transcript_file_id")
        if not transcript_file_id:
            raise HTTPException(
                status_code=404,
                detail="Transcript not available for this session"
            )
        
        # Get transcript content
        transcript_content = await transcript_processor.get_transcript_from_storage(
            file_id=transcript_file_id
        )
        
        if not transcript_content:
            raise HTTPException(
                status_code=404,
                detail="Transcript file not found"
            )
        
        if download:
            # Return as file download
            filename = f"transcript_{session_id}.txt"
            return PlainTextResponse(
                content=transcript_content,
                headers={
                    "Content-Disposition": f"attachment; filename={filename}",
                    "Content-Type": "text/plain"
                }
            )
        else:
            # Return as JSON
            return TranscriptResponse(
                session_id=session_id,
                transcript=transcript_content,
                duration_seconds=session_doc.get("duration_seconds", 0),
                created_at=datetime.fromisoformat(session_doc["created_at"].replace('Z', '+00:00'))
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve transcript: {str(e)}"
        )


async def _convert_research_to_context(research_job: dict) -> str:
    """
    Convert research job results to sales context format.
    
    Args:
        research_job: Research job document from database
        
    Returns:
        Formatted context string for sales agent
    """
    try:
        context_parts = []
        
        # Add research target/topic
        if research_job.get("target"):
            context_parts.append(f"RESEARCH TARGET: {research_job['target']}")
            context_parts.append("")
        
        # Add research results (markdown format)
        if research_job.get("results"):
            context_parts.append("RESEARCH FINDINGS:")
            context_parts.append(research_job["results"])
            context_parts.append("")
        
        # Add any additional metadata
        if research_job.get("keywords"):
            context_parts.append(f"KEY TOPICS: {', '.join(research_job['keywords'])}")
            context_parts.append("")
        
        # Add instructions for sales context
        context_parts.append("SALES INSTRUCTIONS:")
        context_parts.append("- Use this research to answer customer questions")
        context_parts.append("- Focus on benefits and value propositions")
        context_parts.append("- Reference specific data points when relevant")
        context_parts.append("- Guide customers toward solutions that fit their needs")
        
        return "\n".join(context_parts)
        
    except Exception as e:
        print(f"Error converting research to context: {e}")
        return "Error: Unable to load research context"