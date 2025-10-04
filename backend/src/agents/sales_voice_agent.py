"""
Sales voice agent implementation using Cerebras and LiveKit.
Based on the Sales_Agent notebook but simplified for single-agent use.
"""

import os
from livekit.agents import Agent, AgentSession
from livekit.plugins import openai, silero, deepgram
from core.config import get_settings


class SalesVoiceAgent(Agent):
    """
    AI Sales Agent that communicates by voice using research context.
    Based on the notebook implementation but adapted for production use.
    """
    
    def __init__(self, context_data: str, session_id: str):
        """
        Initialize the sales voice agent with research context.
        
        Args:
            context_data: Formatted research content for sales conversations
            session_id: Unique identifier for this voice session
        """
        settings = get_settings()
        
        # Set API keys in environment (required by the plugins)
        if settings.DEEPGRAM_API_KEY:
            os.environ["DEEPGRAM_API_KEY"] = settings.DEEPGRAM_API_KEY
        if settings.CEREBRAS_API_KEY:
            os.environ["CEREBRAS_API_KEY"] = settings.CEREBRAS_API_KEY
        
        # Initialize AI services
        llm = openai.LLM.with_cerebras(model="llama-3.3-70b")
        stt = deepgram.STT()
        tts = deepgram.TTS()
        vad = silero.VAD.load()
        
        # Create sales-focused instructions with research context
        instructions = f"""
        You are a sales agent communicating by voice. All text that you return
        will be spoken aloud, so don't use things like bullets, slashes, or any
        other non-pronounceable punctuation.

        You have access to the following company information and research data:

        {context_data}

        CRITICAL RULES:
        - ONLY use information from the context above
        - If asked about something not in the context, say "I don't have that information"
        - DO NOT make up prices, features, or any other details
        - Quote directly from the context when possible
        - Be a helpful sales agent but only use the provided information
        - Keep responses conversational and natural for voice interaction
        - Avoid technical jargon unless specifically asked
        - Ask clarifying questions to better understand customer needs
        
        Your goal is to help potential customers understand our offerings and
        guide them toward making informed decisions based on the research provided.
        """
        
        # Store session info for tracking
        self.session_id = session_id
        self.context_data = context_data
        
        # Initialize the agent with all components
        super().__init__(
            instructions=instructions,
            stt=stt, 
            llm=llm, 
            tts=tts, 
            vad=vad
        )
    
    async def on_enter(self):
        """
        Called when the agent enters a room/session.
        Provides a greeting to start the conversation.
        """
        greeting_prompt = (
            "Give a short, friendly greeting. Introduce yourself as a sales agent "
            "and offer to answer any questions about our products or services. "
            "Keep it to 1-2 sentences."
        )
        
        await self.session.generate_reply(user_input=greeting_prompt)
    
    async def on_leave(self):
        """
        Called when the agent leaves a room/session.
        Handle cleanup if needed.
        """
        # Log session completion or perform cleanup
        print(f"Sales agent session {self.session_id} completed")
    
    def get_session_info(self) -> dict:
        """Get information about this agent session."""
        return {
            "session_id": self.session_id,
            "agent_type": "sales_voice_agent",
            "context_length": len(self.context_data),
            "model": "llama-3.3-70b"
        }