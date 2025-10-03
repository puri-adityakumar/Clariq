from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from datetime import datetime
from core.auth import AppwriteUser
from core.config import get_settings
from schemas.responses import SuccessResponse, ResponseMeta

router = APIRouter(prefix="/v1/auth", tags=["authentication"])
settings = get_settings()


def get_current_user(request: Request) -> AppwriteUser:
    """
    Dependency to extract authenticated user from request state.
    """
    if not hasattr(request.state, 'user'):
        raise HTTPException(
            status_code=401, 
            detail="User information not found in request"
        )
    
    return request.state.user


@router.get("/me")
async def get_current_user_info(user: AppwriteUser = Depends(get_current_user)):
    """
    Get current authenticated user information.
    Returns user details from validated Appwrite session.
    
    This endpoint demonstrates that only authenticated users can access protected routes.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"User authenticated: {user.email} (ID: {user.id})")
    
    return {
        "data": {
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "email_verification": user.email_verification,
            "labels": user.labels,
            "created_at": user.registration,
        },
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": settings.service_name,
            "version": settings.service_version,
        },
        "message": f"Authenticated as {user.email}"
    }


@router.get("/test-connection")
async def test_backend_connection():
    """
    Public test route to verify backend is accessible.
    No authentication required - this is in skip_paths.
    """
    return {
        "data": {
            "backend_status": "connected",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "auth_required": False,
        },
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": settings.service_name,
            "version": settings.service_version,
        },
        "message": "Backend connection successful"
    }