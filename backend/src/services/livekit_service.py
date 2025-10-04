"""
LiveKit service for managing voice agent rooms and sessions.
"""

import uuid
from typing import Optional
from livekit import api
from core.config import get_settings
from agents.sales_voice_agent import SalesVoiceAgent


class LiveKitService:
    """Service for managing LiveKit rooms and voice agents."""
    
    def __init__(self):
        """Initialize LiveKit service with API credentials."""
        self.settings = get_settings()
        
        # Initialize LiveKit API client
        if self.settings.LIVEKIT_API_KEY and self.settings.LIVEKIT_API_SECRET:
            self.client = api.LiveKitAPI(
                url=self.settings.livekit_ws_url,
                api_key=self.settings.LIVEKIT_API_KEY,
                api_secret=self.settings.LIVEKIT_API_SECRET
            )
        else:
            self.client = None
            print("Warning: LiveKit credentials not configured")
    
    async def create_voice_agent_room(self, session_id: str, context_data: str) -> dict:
        """
        Create a LiveKit room with a voice agent.
        
        Args:
            session_id: Unique identifier for the voice session
            context_data: Research context for the sales agent
            
        Returns:
            Dictionary with room_id and agent_info
        """
        if not self.client:
            raise ValueError("LiveKit not properly configured")
        
        # Generate unique room name
        room_name = f"voice-session-{session_id}"
        
        try:
            # Create room
            room = await self.client.room.create_room(
                api.CreateRoomRequest(
                    name=room_name,
                    empty_timeout=1800,  # 30 minutes
                    max_participants=10
                )
            )
            
            # Create sales agent for this room
            agent = SalesVoiceAgent(context_data=context_data, session_id=session_id)
            
            return {
                "room_id": room.name,
                "room_sid": room.sid,
                "agent": agent,
                "created": True
            }
            
        except Exception as e:
            print(f"Error creating LiveKit room: {e}")
            raise
    
    def get_room_url(self, room_id: str, user_id: str) -> str:
        """
        Generate a public access URL for a LiveKit room.
        
        Args:
            room_id: LiveKit room identifier
            user_id: User identifier for access token
            
        Returns:
            Public URL to access the voice agent
        """
        if not self.client:
            raise ValueError("LiveKit not properly configured")
        
        try:
            # Generate access token for the user
            token = api.AccessToken(
                api_key=self.settings.LIVEKIT_API_KEY,
                api_secret=self.settings.LIVEKIT_API_SECRET
            )
            
            # Grant permissions
            token = token.with_identity(user_id).with_name(f"User-{user_id}")
            token = token.with_grants(
                api.VideoGrants(
                    room_join=True,
                    room=room_id,
                    can_publish=True,
                    can_subscribe=True
                )
            )
            
            # Create the room URL
            # This would typically be your frontend URL that handles LiveKit connections
            base_url = "https://your-domain.com/voice-agent"  # Update with actual domain
            room_url = f"{base_url}?room={room_id}&token={token.to_jwt()}"
            
            return room_url
            
        except Exception as e:
            print(f"Error generating room URL: {e}")
            raise
    
    async def monitor_session(self, session_id: str, room_id: str) -> dict:
        """
        Monitor a voice session for activity and status.
        
        Args:
            session_id: Voice session identifier
            room_id: LiveKit room identifier
            
        Returns:
            Session status information
        """
        if not self.client:
            return {"status": "unavailable", "message": "LiveKit not configured"}
        
        try:
            # Get room information
            rooms = await self.client.room.list_rooms(api.ListRoomsRequest())
            
            for room in rooms:
                if room.name == room_id:
                    return {
                        "status": "active",
                        "participants": room.num_participants,
                        "duration": room.creation_time,
                        "room_active": True
                    }
            
            return {"status": "completed", "room_active": False}
            
        except Exception as e:
            print(f"Error monitoring session: {e}")
            return {"status": "error", "message": str(e)}
    
    async def cleanup_room(self, room_id: str) -> bool:
        """
        Clean up LiveKit room resources.
        
        Args:
            room_id: LiveKit room identifier
            
        Returns:
            True if cleanup successful
        """
        if not self.client:
            return False
        
        try:
            # Delete the room
            await self.client.room.delete_room(
                api.DeleteRoomRequest(room=room_id)
            )
            return True
            
        except Exception as e:
            print(f"Error cleaning up room: {e}")
            return False


# Global service instance
livekit_service = LiveKitService()