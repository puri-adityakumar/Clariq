from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI


def add_cors_middleware(app: FastAPI) -> None:
    """
    Add CORS middleware to allow cross-origin requests from frontend.
    Currently configured for development environment - allows all origins.
    TODO: Restrict origins in production.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for development
        allow_credentials=True,  # For session cookies
        allow_methods=["*"],  # Allow all methods
        allow_headers=["*"],  # Allow all headers
    )