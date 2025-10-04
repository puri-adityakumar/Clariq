"""
Voice sales agent schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class VoiceSessionStatus(str, Enum):
    """Voice session status enumeration."""
    PENDING = "pending"
    READY = "ready"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


class CreateVoiceAgentRequest(BaseModel):
    """Request schema for creating a voice agent."""
    research_job_id: str = Field(..., description="ID of the research job to use as context")
    session_name: str = Field(..., min_length=1, max_length=500, description="Name for the voice session")


class VoiceSessionResponse(BaseModel):
    """Response schema for voice session data."""
    id: str = Field(..., description="Voice session ID")
    user_id: str = Field(..., description="User ID who created the session")
    research_job_id: str = Field(..., description="Research job ID used as context")
    session_name: str = Field(..., description="Session name")
    livekit_room_id: str = Field(..., description="LiveKit room identifier")
    voice_agent_url: Optional[str] = Field(None, description="Public URL to access voice agent")
    status: VoiceSessionStatus = Field(..., description="Current session status")
    duration_seconds: Optional[int] = Field(None, description="Session duration in seconds")
    created_at: datetime = Field(..., description="When the session was created")
    completed_at: Optional[datetime] = Field(None, description="When the session was completed")


class CreateVoiceAgentResponse(BaseModel):
    """Response schema for creating a voice agent."""
    session_id: str = Field(..., description="Created voice session ID")
    voice_agent_url: str = Field(..., description="URL to access the voice agent")
    status: VoiceSessionStatus = Field(..., description="Initial session status")
    message: str = Field(..., description="Success message")


class VoiceSessionListResponse(BaseModel):
    """Response schema for listing voice sessions."""
    sessions: list[VoiceSessionResponse] = Field(..., description="List of voice sessions")
    total: int = Field(..., description="Total number of sessions")


class TranscriptResponse(BaseModel):
    """Response schema for session transcript."""
    session_id: str = Field(..., description="Voice session ID")
    transcript: str = Field(..., description="Full conversation transcript")
    duration_seconds: int = Field(..., description="Session duration")
    created_at: datetime = Field(..., description="When transcript was created")