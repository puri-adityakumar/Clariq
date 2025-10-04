"""
Transcript processing utilities for voice sessions.
"""

import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from services.appwrite_service import appwrite_service
from core.config import get_settings


class TranscriptProcessor:
    """Process and format voice conversation transcripts."""
    
    def __init__(self):
        """Initialize transcript processor."""
        self.settings = get_settings()
    
    def format_conversation_history(self, conversation_data: List[Dict[str, Any]]) -> str:
        """
        Format conversation data into a readable transcript.
        
        Args:
            conversation_data: List of conversation events/messages
            
        Returns:
            Formatted transcript string
        """
        try:
            transcript_lines = []
            transcript_lines.append("CLARIQ Voice Sales Agent - Conversation Transcript")
            transcript_lines.append("=" * 50)
            transcript_lines.append(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
            transcript_lines.append("")
            
            for event in conversation_data:
                timestamp = event.get("timestamp", "")
                speaker = event.get("speaker", "Unknown")
                text = event.get("text", "")
                
                if timestamp:
                    formatted_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%H:%M:%S')
                    transcript_lines.append(f"[{formatted_time}] {speaker}: {text}")
                else:
                    transcript_lines.append(f"{speaker}: {text}")
                transcript_lines.append("")
            
            return "\n".join(transcript_lines)
            
        except Exception as e:
            print(f"Error formatting conversation history: {e}")
            return "Error formatting transcript"
    
    def extract_conversation_insights(self, conversation_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract key insights from the conversation.
        
        Args:
            conversation_data: List of conversation events/messages
            
        Returns:
            Dictionary with conversation insights
        """
        try:
            insights = {
                "total_messages": len(conversation_data),
                "duration_seconds": 0,
                "user_messages": 0,
                "agent_messages": 0,
                "key_topics": [],
                "questions_asked": 0,
                "products_mentioned": []
            }
            
            # Analyze conversation
            for event in conversation_data:
                speaker = event.get("speaker", "")
                text = event.get("text", "")
                
                if speaker.lower() in ["user", "customer", "human"]:
                    insights["user_messages"] += 1
                    # Count questions
                    if "?" in text:
                        insights["questions_asked"] += 1
                elif speaker.lower() in ["agent", "ai", "assistant"]:
                    insights["agent_messages"] += 1
            
            # Calculate duration if timestamps are available
            if conversation_data and len(conversation_data) >= 2:
                try:
                    start_time = datetime.fromisoformat(conversation_data[0]["timestamp"].replace('Z', '+00:00'))
                    end_time = datetime.fromisoformat(conversation_data[-1]["timestamp"].replace('Z', '+00:00'))
                    insights["duration_seconds"] = int((end_time - start_time).total_seconds())
                except:
                    pass
            
            return insights
            
        except Exception as e:
            print(f"Error extracting insights: {e}")
            return {"error": str(e)}
    
    async def save_transcript_to_storage(self, session_id: str, transcript_content: str) -> Optional[str]:
        """
        Save transcript to Appwrite storage.
        
        Args:
            session_id: Voice session identifier
            transcript_content: Formatted transcript content
            
        Returns:
            File ID if successful, None otherwise
        """
        try:
            # Create filename
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"transcript_{session_id}_{timestamp}.txt"
            
            # Save to Appwrite storage
            file_result = await appwrite_service.upload_file(
                bucket_id=self.settings.appwrite_transcript_bucket_id,
                file_content=transcript_content.encode('utf-8'),
                filename=filename,
                content_type="text/plain"
            )
            
            if file_result:
                return file_result.get("$id")
            
            return None
            
        except Exception as e:
            print(f"Error saving transcript to storage: {e}")
            return None
    
    async def get_transcript_from_storage(self, file_id: str) -> Optional[str]:
        """
        Retrieve transcript from Appwrite storage.
        
        Args:
            file_id: Appwrite file identifier
            
        Returns:
            Transcript content or None if not found
        """
        try:
            # Get file from Appwrite storage
            file_content = await appwrite_service.download_file(
                bucket_id=self.settings.appwrite_transcript_bucket_id,
                file_id=file_id
            )
            
            if file_content:
                return file_content.decode('utf-8')
            
            return None
            
        except Exception as e:
            print(f"Error retrieving transcript from storage: {e}")
            return None
    
    def create_transcript_summary(self, transcript: str) -> Dict[str, Any]:
        """
        Create a summary of the transcript.
        
        Args:
            transcript: Full transcript content
            
        Returns:
            Transcript summary data
        """
        try:
            lines = transcript.split('\n')
            
            # Count conversation exchanges
            conversation_lines = [line for line in lines if ']' in line and ':' in line]
            
            summary = {
                "total_lines": len(conversation_lines),
                "estimated_duration": f"{len(conversation_lines) * 10} seconds",  # Rough estimate
                "preview": lines[:5] if lines else [],
                "word_count": len(transcript.split()),
                "character_count": len(transcript)
            }
            
            return summary
            
        except Exception as e:
            print(f"Error creating transcript summary: {e}")
            return {"error": str(e)}


# Global processor instance
transcript_processor = TranscriptProcessor()