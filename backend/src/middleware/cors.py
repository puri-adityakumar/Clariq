from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI


def add_cors_middleware(app: FastAPI) -> None:
    """
    Add CORS middleware to allow cross-origin requests from frontend.
    Currently configured for development environment.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # Next.js dev server
            "http://127.0.0.1:3000",  # Alternative localhost
        ],
        allow_credentials=True,  # For session cookies
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "X-API-Key", "Content-Type"],
    )