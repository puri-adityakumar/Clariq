from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.exceptions import RequestValidationError
from datetime import datetime
import sys
from pathlib import Path

# Add src directory to Python path
src_path = Path(__file__).parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

# Middleware imports
from middleware.cors import add_cors_middleware
from middleware.security import SecurityHeadersMiddleware
from middleware.auth import UserSessionMiddleware
from core.config import get_settings

# API router imports
from api.auth import router as auth_router
from api.research import router as research_router

settings = get_settings()


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application with middleware stack.
    """
    app = FastAPI(
        title="CLARIQ Backend",
        version=settings.service_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    
    # Add exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.status_code,
                    "message": exc.detail,
                },
                "meta": {
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "service": settings.service_name,
                    "version": settings.service_version,
                }
            }
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": 422,
                    "message": "Validation error",
                    "details": exc.errors()
                },
                "meta": {
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "service": settings.service_name,
                    "version": settings.service_version,
                }
            }
        )
    
    # Add middleware in execution order (first added = last executed)
    # 1. CORS - Handle preflight requests first
    add_cors_middleware(app)
    
    # 2. Security Headers - Add security headers to all responses
    app.add_middleware(SecurityHeadersMiddleware)
    
    # 3. Authentication - Validate user sessions only
    app.add_middleware(UserSessionMiddleware)
    
    # Register API routes
    app.include_router(auth_router)
    app.include_router(research_router)
    
    return app


app = create_app()


@app.get("/health", tags=["system"])
def get_health():
    """
    Basic liveness & readiness style probe.
    Extend later with checks (DB, Redis, external APIs).
    """
    return JSONResponse(
        {
            "status": "ok",
            "service": settings.service_name,
            "version": settings.service_version,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "middleware": {
                "cors": True,
                "security_headers": True,
                "user_session_auth": True,
            },
        }
    )


@app.get("/", include_in_schema=False)
def root():
    return {"message": "CLARIQ API. See /health or /docs"}