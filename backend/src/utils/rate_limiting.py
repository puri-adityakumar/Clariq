"""
Simple rate limiting for research API endpoints.
This is a basic implementation for MVP. For production, consider using
Redis-based rate limiting or a service like Upstash.
"""
from fastapi import HTTPException, Request
from typing import Dict, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class SimpleRateLimiter:
    """
    In-memory rate limiter for research endpoints.
    
    This implementation tracks requests per user and enforces limits
    to prevent abuse of the research API which uses external paid APIs.
    
    Note: This is not suitable for multi-instance deployments as it
    stores state in memory. For production, use Redis or a distributed
    rate limiting service.
    """
    
    def __init__(self):
        # Store: user_id -> List[timestamp]
        self._user_requests: Dict[str, List[datetime]] = {}
        
        # Rate limits
        self.RESEARCH_EXECUTION_LIMIT = 5  # Max 5 research jobs per hour
        self.STATUS_CHECK_LIMIT = 60       # Max 60 status checks per hour
        self.WINDOW_HOURS = 1
    
    def _cleanup_old_requests(self, user_id: str) -> None:
        """Remove requests older than the time window."""
        if user_id not in self._user_requests:
            return
            
        cutoff_time = datetime.utcnow() - timedelta(hours=self.WINDOW_HOURS)
        self._user_requests[user_id] = [
            req_time for req_time in self._user_requests[user_id] 
            if req_time > cutoff_time
        ]
    
    def check_rate_limit(self, user_id: str, endpoint_type: str = "execution") -> bool:
        """
        Check if user has exceeded rate limit for the given endpoint type.
        
        Args:
            user_id: The user identifier
            endpoint_type: "execution" or "status"
            
        Returns:
            True if request is allowed, False if rate limited
        """
        self._cleanup_old_requests(user_id)
        
        if user_id not in self._user_requests:
            self._user_requests[user_id] = []
        
        current_requests = len(self._user_requests[user_id])
        
        if endpoint_type == "execution":
            limit = self.RESEARCH_EXECUTION_LIMIT
        else:  # status
            limit = self.STATUS_CHECK_LIMIT
        
        if current_requests >= limit:
            logger.warning(f"Rate limit exceeded for user {user_id}, endpoint {endpoint_type}: {current_requests}/{limit}")
            return False
            
        # Record this request
        self._user_requests[user_id].append(datetime.utcnow())
        return True
    
    def get_remaining_requests(self, user_id: str, endpoint_type: str = "execution") -> int:
        """Get the number of remaining requests for a user."""
        self._cleanup_old_requests(user_id)
        
        if user_id not in self._user_requests:
            if endpoint_type == "execution":
                return self.RESEARCH_EXECUTION_LIMIT
            else:
                return self.STATUS_CHECK_LIMIT
        
        current_requests = len(self._user_requests[user_id])
        
        if endpoint_type == "execution":
            return max(0, self.RESEARCH_EXECUTION_LIMIT - current_requests)
        else:
            return max(0, self.STATUS_CHECK_LIMIT - current_requests)


# Global rate limiter instance
rate_limiter = SimpleRateLimiter()


def check_research_rate_limit(user_id: str, endpoint_type: str = "execution") -> None:
    """
    Dependency function to check rate limits for research endpoints.
    
    Args:
        user_id: The user identifier
        endpoint_type: "execution" or "status"
        
    Raises:
        HTTPException: If rate limit is exceeded
    """
    if not rate_limiter.check_rate_limit(user_id, endpoint_type):
        remaining = rate_limiter.get_remaining_requests(user_id, endpoint_type)
        
        if endpoint_type == "execution":
            message = f"Research execution rate limit exceeded. You can start {rate_limiter.RESEARCH_EXECUTION_LIMIT} research jobs per hour. Try again later."
        else:
            message = f"Status check rate limit exceeded. You can check status {rate_limiter.STATUS_CHECK_LIMIT} times per hour. Try again later."
        
        raise HTTPException(
            status_code=429,
            detail=message,
            headers={"X-RateLimit-Remaining": str(remaining)}
        )