from fastapi import HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from core.auth import verify_appwrite_session
from core.config import get_settings


class UserSessionMiddleware(BaseHTTPMiddleware):
    """
    User session authentication middleware supporting only Appwrite session tokens.
    """
    
    def __init__(self, app, skip_paths: list[str] = None):
        super().__init__(app)
        self.skip_paths = skip_paths or [
            "/",
            "/health",
            "/v1/auth/test-connection",
            "/v1/research/health",  # Research service health check
            "/favicon.ico",
        ]
        # Skip patterns for documentation and static resources
        self.skip_patterns = [
            "/docs",
            "/redoc", 
            "/openapi.json",
            "/static/",  # Static files for docs
        ]
    
    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        
        # Always allow OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)
        
        # Skip authentication for exact match paths
        if path in self.skip_paths:
            return await call_next(request)
        
        # Skip authentication for pattern matches (docs and static files)
        if any(path.startswith(pattern) for pattern in self.skip_patterns):
            return await call_next(request)
        
        # User session authentication only
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"No Authorization header for {path}")
            raise HTTPException(
                status_code=401, 
                detail="Authorization header required. Please sign in."
            )
        
        # Extract session token (remove "Bearer " if present)
        session_token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
        
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Attempting to validate session: {session_token[:20]}... for {path}")
        
        # Validate with Appwrite
        user = await verify_appwrite_session(session_token)
        if not user:
            logger.warning(f"Session validation failed for token: {session_token[:20]}...")
            raise HTTPException(
                status_code=401, 
                detail="Invalid session token. Please sign in again."
            )
        
        request.state.authenticated = True
        request.state.user = user  # Store user info for routes
        return await call_next(request)