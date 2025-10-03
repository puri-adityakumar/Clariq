from fastapi import HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from core.security import verify_api_key
from core.config import get_settings


class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Hybrid authentication middleware supporting:
    1. API keys for service-to-service communication
    2. Future: Appwrite session tokens for user authentication
    """
    
    def __init__(self, app, skip_paths: list[str] = None):
        super().__init__(app)
        self.skip_paths = skip_paths or [
            "/",
            "/health", 
            "/v1/health",
            "/docs", 
            "/redoc",
            "/openapi.json"
        ]
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip authentication for public endpoints
        if request.url.path in self.skip_paths:
            return await call_next(request)
        
        # Check for API key (service-to-service)
        api_key = request.headers.get("X-API-Key")
        if api_key and verify_api_key(api_key):
            request.state.auth_type = "api_key"
            request.state.authenticated = True
            return await call_next(request)
        
        # TODO Phase 2: Check for Appwrite session token
        # session_token = request.headers.get("Authorization")
        # if session_token and await self.verify_appwrite_session(session_token):
        #     request.state.auth_type = "user_session"
        #     request.state.authenticated = True
        #     request.state.user_id = user_id  # From Appwrite
        #     return await call_next(request)
        
        raise HTTPException(
            status_code=401, 
            detail="Missing or invalid authentication. Provide X-API-Key header."
        )
    
    # async def verify_appwrite_session(self, session_token: str) -> bool:
    #     """Future: Verify Appwrite session token"""
    #     # TODO: Implement Appwrite session validation
    #     pass