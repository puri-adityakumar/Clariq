from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime

# Middleware imports
from middleware.cors import add_cors_middleware
from middleware.security import SecurityHeadersMiddleware
from middleware.auth import APIKeyMiddleware
from core.config import get_settings

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
    
    # Add middleware in execution order (first added = last executed)
    # 1. CORS - Handle preflight requests first
    add_cors_middleware(app)
    
    # 2. Security Headers - Add security headers to all responses
    app.add_middleware(SecurityHeadersMiddleware)
    
    # 3. Authentication - Validate API keys/sessions
    app.add_middleware(APIKeyMiddleware)
    
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
                "auth": True,
            },
        }
    )


@app.get("/", include_in_schema=False)
def root():
    return {"message": "CLARIQ API. See /health or /docs"}