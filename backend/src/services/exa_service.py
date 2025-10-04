"""
Exa API Service Wrapper
Provides search and discovery functionality using Exa's API
"""
import logging
from typing import List, Dict, Optional
from exa_py import Exa
from core.config import settings

logger = logging.getLogger(__name__)


class ExaService:
    """Service wrapper for Exa API operations"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Exa client with API key"""
        self.api_key = api_key or settings.EXA_API_KEY
        if not self.api_key:
            raise ValueError("EXA_API_KEY not configured")
        
        self.client = Exa(api_key=self.api_key)
        logger.info("Exa service initialized")
    
    def search_web(self, query: str, num_results: int = 5) -> List[Dict]:
        """
        Search the web using Exa's auto search
        
        Args:
            query: Search query string
            num_results: Number of results to return (default: 5)
            
        Returns:
            List of search results with title, url, and content
        """
        try:
            logger.info(f"Searching web for: {query} (num_results={num_results})")
            
            result = self.client.search_and_contents(
                query,
                type="auto",
                num_results=num_results,
                text={"max_characters": 1000}
            )
            
            # Convert results to simple dict format
            results = []
            for item in result.results:
                results.append({
                    "title": item.title,
                    "url": item.url,
                    "content": item.text,
                    "score": getattr(item, 'score', None)
                })
            
            logger.info(f"Found {len(results)} results for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Error searching web: {str(e)}")
            raise
    
    def find_similar_companies(self, url: str, num_results: int = 5) -> List[Dict]:
        """
        Find similar companies using Exa's similarity search
        
        Args:
            url: Company website URL to find similar companies to
            num_results: Number of results to return (default: 5)
            
        Returns:
            List of similar companies with title, url, and content
        """
        try:
            logger.info(f"Finding similar companies to: {url}")
            
            result = self.client.find_similar_and_contents(
                url,
                num_results=num_results,
                category="company",
                exclude_source_domain=True,
                text={"max_characters": 1000}
            )
            
            # Convert results to simple dict format
            results = []
            for item in result.results:
                results.append({
                    "title": item.title,
                    "url": item.url,
                    "content": item.text,
                    "score": getattr(item, 'score', None)
                })
            
            logger.info(f"Found {len(results)} similar companies")
            return results
            
        except Exception as e:
            logger.error(f"Error finding similar companies: {str(e)}")
            raise
    
    def search_person(self, name: str, linkedin_url: Optional[str] = None) -> List[Dict]:
        """
        Search for a person's LinkedIn profile and information
        
        Args:
            name: Person's name
            linkedin_url: Optional LinkedIn URL for direct search
            
        Returns:
            List of search results about the person
        """
        try:
            if linkedin_url:
                logger.info(f"Searching for person with LinkedIn: {linkedin_url}")
                query = linkedin_url
            else:
                logger.info(f"Searching for person: {name}")
                query = f"{name} LinkedIn profile"
            
            result = self.client.search_and_contents(
                query,
                type="auto",
                num_results=5,
                category="linkedin profile",
                text={"max_characters": 1000}
            )
            
            # Convert results to simple dict format
            results = []
            for item in result.results:
                results.append({
                    "title": item.title,
                    "url": item.url,
                    "content": item.text,
                    "score": getattr(item, 'score', None)
                })
            
            logger.info(f"Found {len(results)} results for person: {name}")
            return results
            
        except Exception as e:
            logger.error(f"Error searching for person: {str(e)}")
            raise


# Global instance for easy import
_exa_service: Optional[ExaService] = None


def get_exa_service() -> ExaService:
    """Get or create the global Exa service instance"""
    global _exa_service
    if _exa_service is None:
        _exa_service = ExaService()
    return _exa_service
