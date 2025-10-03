from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime
import os

SERVICE_NAME = "clariq-backend"
SERVICE_VERSION = os.getenv("CLARIQ_VERSION", "0.1.0")

app = FastAPI(
    title="CLARIQ Backend",
    version=SERVICE_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

@app.get("/health", tags=["system"])
def get_health():
    """
    Basic liveness & readiness style probe.
    Extend later with checks (DB, Redis, external APIs).
    """
    return JSONResponse(
        {
            "status": "ok",
            "service": SERVICE_NAME,
            "version": SERVICE_VERSION,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
    )

@app.get("/", include_in_schema=False)
def root():
    return {"message": "CLARIQ API. See /health or /docs"}