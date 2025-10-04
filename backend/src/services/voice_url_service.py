"""
Voice URL service for generating public access URLs to voice agents.
"""

import uuid
import base64
import json
from typing import Optional
from urllib.parse import urlencode
from core.config import get_settings


class VoiceUrlService:
    """Service for generating and managing voice agent URLs."""
    
    def __init__(self):
        """Initialize the voice URL service."""
        self.settings = get_settings()
        # Use localhost for development, can be overridden via environment variable
        self.base_url = "http://localhost:8000"  # TODO: Use env variable for production
    
    def generate_voice_agent_url(self, session_id: str, user_id: str, room_id: str) -> str:
        """
        Generate a public URL for accessing a voice agent.
        
        Args:
            session_id: Voice session identifier
            user_id: User identifier for authentication
            room_id: LiveKit room identifier
            
        Returns:
            Public URL to access the voice agent
        """
        try:
            # Create access token data
            token_data = {
                "session_id": session_id,
                "user_id": user_id,
                "room_id": room_id,
                "timestamp": str(uuid.uuid4())  # Simple nonce for security
            }
            
            # Encode token (in production, use proper JWT or encryption)
            token_json = json.dumps(token_data)
            token_encoded = base64.urlsafe_b64encode(token_json.encode()).decode()
            
            # Build URL with parameters
            url_params = {
                "session": session_id,
                "token": token_encoded
            }
            
            # Generate the public voice agent URL
            voice_agent_url = f"{self.base_url}/voice-agent?{urlencode(url_params)}"
            
            return voice_agent_url
            
        except Exception as e:
            print(f"Error generating voice agent URL: {e}")
            raise
    
    def validate_voice_agent_token(self, token: str) -> Optional[dict]:
        """
        Validate and decode a voice agent access token.
        
        Args:
            token: Encoded access token
            
        Returns:
            Decoded token data or None if invalid
        """
        try:
            # Decode token
            token_json = base64.urlsafe_b64decode(token.encode()).decode()
            token_data = json.loads(token_json)
            
            # Basic validation
            required_fields = ["session_id", "user_id", "room_id", "timestamp"]
            if all(field in token_data for field in required_fields):
                return token_data
            
            return None
            
        except Exception as e:
            print(f"Error validating token: {e}")
            return None
    
    def create_direct_room_url(self, room_id: str, user_id: str) -> str:
        """
        Create a direct URL to a LiveKit room.
        
        Args:
            room_id: LiveKit room identifier
            user_id: User identifier
            
        Returns:
            Direct room access URL
        """
        # This would integrate with LiveKit's room URL generation
        # For now, return a placeholder that would redirect to the actual room
        
        return f"{self.base_url}/rooms/{room_id}?user={user_id}"
    
    def generate_transcript_download_url(self, session_id: str, user_id: str) -> str:
        """
        Generate URL for downloading session transcript.
        
        Args:
            session_id: Voice session identifier
            user_id: User identifier for access control
            
        Returns:
            Transcript download URL
        """
        # Create secure download token
        download_token = base64.urlsafe_b64encode(
            json.dumps({
                "session_id": session_id,
                "user_id": user_id,
                "type": "transcript"
            }).encode()
        ).decode()
        
        return f"{self.base_url}/api/v1/voice/transcript/{session_id}?token={download_token}"
    
    def get_embed_code(self, session_id: str, user_id: str) -> str:
        """
        Generate embeddable HTML/JavaScript code for voice agent.
        
        Args:
            session_id: Voice session identifier
            user_id: User identifier
            
        Returns:
            HTML embed code
        """
        voice_url = self.generate_voice_agent_url(session_id, user_id, f"room-{session_id}")
        
        embed_code = f"""
        <div id="clariq-voice-agent-{session_id}">
            <iframe 
                src="{voice_url}"
                width="400" 
                height="600" 
                frameborder="0"
                allow="microphone; camera">
            </iframe>
        </div>
        """
        
        return embed_code


# Global service instance
voice_url_service = VoiceUrlService()