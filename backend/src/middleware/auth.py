from fastapi import HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from core.security import verify_api_key
from core.auth import verify_appwrite_session
from core.config import get_settings


class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Hybrid authentication middleware supporting:
    1. API keys for service-to-service communication
    2. Appwrite session tokens for user authentication
    """
    
    def __init__(self, app, skip_paths: list[str] = None):
        super().__init__(app)
        self.skip_paths = skip_paths or [
            "/",
            "/health",  # Only /health, not /v1/health
            "/v1/auth/test-connection",  # Public test endpoint
            "/docs", 
            "/redoc",
            "/openapi.json"
        ]
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip authentication for public endpoints
        if request.url.path in self.skip_paths:
            return await call_next(request)
        
        # Option 1: API key (for internal services only)
        api_key = request.headers.get("X-API-Key")
        if api_key and verify_api_key(api_key):
            request.state.auth_type = "api_key"
            request.state.authenticated = True
            return await call_next(request)
        
        # Option 2: User session (for frontend users)
        auth_header = request.headers.get("Authorization")
        if auth_header:
            # Extract session token (remove "Bearer " if present)
            session_token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
            
            # Validate with Appwrite
            user = await verify_appwrite_session(session_token)
            if user:
                request.state.auth_type = "user_session"
                request.state.authenticated = True
                request.state.user = user  # Store user info for routes
                return await call_next(request)
        
        # Reject if neither API key nor valid session
        raise HTTPException(
            status_code=401, 
            detail="Authentication required. Please sign in or provide valid API key."
        )