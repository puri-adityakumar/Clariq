from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime


class ResponseMeta(BaseModel):
    """Metadata included in all API responses."""
    timestamp: datetime
    service: str
    version: str
    # request_id: str  # TODO: Add in Phase 2


class SuccessResponse(BaseModel):
    """Standard success response wrapper."""
    data: Any
    meta: ResponseMeta


class ErrorDetail(BaseModel):
    """Error detail structure."""
    code: str
    message: str
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Standard error response wrapper."""
    error: ErrorDetail
    meta: ResponseMeta