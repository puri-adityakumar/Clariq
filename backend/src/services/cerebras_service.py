"""
Cerebras API Service Wrapper
Provides AI analysis and synthesis using Cerebras Cloud SDK
"""
import logging
from typing import Optional
from cerebras.cloud.sdk import Cerebras
from core.config import settings

logger = logging.getLogger(__name__)


class CerebrasService:
    """Service wrapper for Cerebras API operations"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Cerebras client with API key"""
        self.api_key = api_key or settings.CEREBRAS_API_KEY
        if not self.api_key:
            raise ValueError("CEREBRAS_API_KEY not configured")
        
        self.client = Cerebras(api_key=self.api_key)
        self.model = "llama-4-scout-17b-16e-instruct"
        logger.info("Cerebras service initialized")
    
    def ask_ai(self, prompt: str, max_tokens: int = 600, temperature: float = 0.2) -> str:
        """
        Get AI response from Cerebras for analysis and insights
        
        Args:
            prompt: The prompt to send to the AI
            max_tokens: Maximum tokens in response (default: 600)
            temperature: Randomness of response (default: 0.2 for consistency)
            
        Returns:
            AI response as string
        """
        try:
            logger.info(f"Asking AI (max_tokens={max_tokens}, temp={temperature})")
            logger.debug(f"Prompt: {prompt[:100]}...")
            
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            response = chat_completion.choices[0].message.content
            logger.info(f"AI response received ({len(response)} chars)")
            return response
            
        except Exception as e:
            logger.error(f"Error getting AI response: {str(e)}")
            raise
    
    def ask_ai_long(self, prompt: str, max_tokens: int = 1500, temperature: float = 0.2) -> str:
        """
        Get longer AI response for synthesis and comprehensive analysis
        
        Args:
            prompt: The prompt to send to the AI
            max_tokens: Maximum tokens in response (default: 1500 for longer responses)
            temperature: Randomness of response (default: 0.2 for consistency)
            
        Returns:
            AI response as string
        """
        logger.info("Asking AI for long-form response")
        return self.ask_ai(prompt, max_tokens=max_tokens, temperature=temperature)
    
    def generate_follow_up_queries(self, context: str) -> str:
        """
        Generate follow-up research queries based on initial findings
        
        Args:
            context: Research context and initial findings
            
        Returns:
            Follow-up query suggestions
        """
        logger.info("Generating follow-up queries")
        return self.ask_ai(context, max_tokens=400, temperature=0.3)
    
    def synthesize_research(self, context: str) -> str:
        """
        Synthesize comprehensive research report from multiple sources
        
        Args:
            context: All research findings and sources
            
        Returns:
            Synthesized research report
        """
        logger.info("Synthesizing research report")
        return self.ask_ai_long(context, max_tokens=1500, temperature=0.2)


# Global instance for easy import
_cerebras_service: Optional[CerebrasService] = None


def get_cerebras_service() -> CerebrasService:
    """Get or create the global Cerebras service instance"""
    global _cerebras_service
    if _cerebras_service is None:
        _cerebras_service = CerebrasService()
    return _cerebras_service
