"""
Voice agent worker for managing LiveKit agent deployment and lifecycle.
"""

import asyncio
from typing import Optional, Dict, Any
from datetime import datetime
from agents.sales_voice_agent import SalesVoiceAgent
from services.livekit_service import livekit_service
from services.livekit_room_service import livekit_room_service
from utils.transcript_processor import transcript_processor
from services.appwrite_service import appwrite_service
from core.config import get_settings


class VoiceAgentWorker:
    """Worker for managing voice agent deployment and lifecycle."""
    
    def __init__(self):
        """Initialize the voice agent worker."""
        self.settings = get_settings()
        self.active_agents: Dict[str, Dict[str, Any]] = {}
    
    async def create_sales_agent(self, context_data: str, session_id: str) -> SalesVoiceAgent:
        """
        Create a sales voice agent with research context.
        
        Args:
            context_data: Formatted research content
            session_id: Voice session identifier
            
        Returns:
            Configured sales voice agent
        """
        try:
            # Create the sales agent
            agent = SalesVoiceAgent(context_data=context_data, session_id=session_id)
            
            # Store agent reference
            self.active_agents[session_id] = {
                "agent": agent,
                "created_at": datetime.utcnow(),
                "status": "created",
                "context_length": len(context_data)
            }
            
            print(f"Created sales agent for session {session_id}")
            return agent
            
        except Exception as e:
            print(f"Error creating sales agent: {e}")
            raise
    
    async def start_agent_in_room(self, room_id: str, agent: SalesVoiceAgent, session_id: str) -> bool:
        """
        Start an agent in a LiveKit room and begin conversation handling.
        
        Args:
            room_id: LiveKit room identifier
            agent: Sales voice agent instance
            session_id: Voice session identifier
            
        Returns:
            True if agent started successfully
        """
        try:
            # Deploy agent to room using room service
            success = await livekit_room_service.deploy_agent_to_room(
                room_id=room_id,
                context_data=agent.context_data,
                session_id=session_id
            )
            
            if success:
                # Update agent status
                if session_id in self.active_agents:
                    self.active_agents[session_id]["status"] = "active"
                    self.active_agents[session_id]["room_id"] = room_id
                
                # Start conversation handling
                await self.handle_conversation_flow(session_id)
                
                print(f"Agent started in room {room_id} for session {session_id}")
                return True
            
            return False
            
        except Exception as e:
            print(f"Error starting agent in room: {e}")
            return False
    
    async def handle_conversation_flow(self, session_id: str) -> None:
        """
        Handle the main conversation flow for a voice session.
        
        Args:
            session_id: Voice session identifier
        """
        try:
            if session_id not in self.active_agents:
                print(f"No active agent found for session {session_id}")
                return
            
            agent_info = self.active_agents[session_id]
            agent = agent_info["agent"]
            
            # Update session status in database
            await self._update_session_status(session_id, "active")
            
            # Start conversation monitoring and transcript capture
            await self._monitor_conversation(session_id)
            
            print(f"Handling conversation flow for session {session_id}")
            
        except Exception as e:
            print(f"Error in conversation flow: {e}")
            await self._update_session_status(session_id, "failed")
    
    async def auto_save_transcript(self, session_id: str, conversation_data: list) -> bool:
        """
        Automatically save conversation transcript during the session.
        
        Args:
            session_id: Voice session identifier
            conversation_data: List of conversation events
            
        Returns:
            True if transcript saved successfully
        """
        try:
            # Format the transcript
            transcript_content = transcript_processor.format_conversation_history(conversation_data)
            
            # Save to storage
            file_id = await transcript_processor.save_transcript_to_storage(
                session_id=session_id,
                transcript_content=transcript_content
            )
            
            if file_id:
                # Update session record with transcript file ID
                await self._update_session_transcript(session_id, file_id)
                print(f"Transcript saved for session {session_id}")
                return True
            
            return False
            
        except Exception as e:
            print(f"Error auto-saving transcript: {e}")
            return False
    
    async def agent_greeting(self, session_id: str) -> bool:
        """
        Trigger the agent's greeting when a user joins.
        
        Args:
            session_id: Voice session identifier
            
        Returns:
            True if greeting sent successfully
        """
        try:
            if session_id not in self.active_agents:
                return False
            
            agent = self.active_agents[session_id]["agent"]
            
            # The agent's on_enter method handles the greeting
            # This is called automatically when the agent enters the room
            await agent.on_enter()
            
            print(f"Agent greeting sent for session {session_id}")
            return True
            
        except Exception as e:
            print(f"Error sending agent greeting: {e}")
            return False
    
    async def cleanup_agent_session(self, session_id: str) -> bool:
        """
        Clean up an agent session and save final transcript.
        
        Args:
            session_id: Voice session identifier
            
        Returns:
            True if cleanup successful
        """
        try:
            if session_id in self.active_agents:
                agent_info = self.active_agents[session_id]
                
                # Save final transcript if available
                # In real implementation, capture conversation history from LiveKit
                final_conversation = []  # Would be populated from actual conversation
                if final_conversation:
                    await self.auto_save_transcript(session_id, final_conversation)
                
                # Update session status
                await self._update_session_status(session_id, "completed")
                
                # Clean up room
                room_id = agent_info.get("room_id")
                if room_id:
                    await livekit_service.cleanup_room(room_id)
                
                # Remove from active agents
                del self.active_agents[session_id]
                
                print(f"Cleaned up agent session {session_id}")
                return True
            
            return False
            
        except Exception as e:
            print(f"Error cleaning up agent session: {e}")
            return False
    
    async def _update_session_status(self, session_id: str, status: str) -> None:
        """Update session status in database."""
        try:
            update_data = {"status": status}
            if status == "completed":
                update_data["completed_at"] = datetime.utcnow().isoformat() + "Z"
            
            await appwrite_service.update_document(
                database_id=self.settings.appwrite_database_id,
                collection_id=self.settings.appwrite_voice_collection_id,
                document_id=session_id,
                data=update_data
            )
        except Exception as e:
            print(f"Error updating session status: {e}")
    
    async def _update_session_transcript(self, session_id: str, file_id: str) -> None:
        """Update session with transcript file ID."""
        try:
            await appwrite_service.update_document(
                database_id=self.settings.appwrite_database_id,
                collection_id=self.settings.appwrite_voice_collection_id,
                document_id=session_id,
                data={"transcript_file_id": file_id}
            )
        except Exception as e:
            print(f"Error updating session transcript: {e}")
    
    async def _monitor_conversation(self, session_id: str) -> None:
        """Monitor conversation and handle periodic saves."""
        try:
            # In real implementation, this would:
            # 1. Listen to LiveKit room events
            # 2. Capture conversation data in real-time
            # 3. Periodically save transcripts
            # 4. Handle session timeouts
            
            print(f"Monitoring conversation for session {session_id}")
            
            # Simulate conversation monitoring
            # In actual implementation, this runs continuously
            
        except Exception as e:
            print(f"Error monitoring conversation: {e}")
    
    def get_active_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all active agent sessions."""
        return self.active_agents.copy()
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific session."""
        return self.active_agents.get(session_id)


# Global worker instance
voice_agent_worker = VoiceAgentWorker()