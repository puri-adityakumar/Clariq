from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from datetime import datetime
from core.auth import AppwriteUser, get_current_user
from core.config import get_settings
from schemas.responses import SuccessResponse, ResponseMeta

router = APIRouter(prefix="/v1/auth", tags=["authentication"])
settings = get_settings()


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    Returns user details from validated Appwrite session.
    
    This endpoint demonstrates that only authenticated users can access protected routes.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"User authenticated: {current_user['email']} (ID: {current_user['$id']})")
    
    return {
        "data": {
            "user_id": current_user["$id"],
            "email": current_user["email"],
            "name": current_user["name"],
            "email_verification": current_user["emailVerification"],
            "labels": current_user["labels"],
            "created_at": current_user["registration"],
        },
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": settings.service_name,
            "version": settings.service_version,
        },
        "message": f"Authenticated as {current_user['email']}"
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