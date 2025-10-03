from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.exception import AppwriteException
from core.config import get_settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class AppwriteUser:
    """
    User object from Appwrite session validation.
    """
    def __init__(self, user_data: dict):
        self.id = user_data.get('$id')
        self.email = user_data.get('email')
        self.name = user_data.get('name', '')
        self.email_verification = user_data.get('emailVerification', False)
        self.labels = user_data.get('labels', [])
        self.registration = user_data.get('registration')


async def verify_appwrite_session(session_token: str) -> Optional[AppwriteUser]:
    """
    Verify session token with Appwrite and return user info.
    This is what protects your backend from random access.
    
    Args:
        session_token: Session ID from Appwrite frontend
        
    Returns:
        AppwriteUser if session is valid, None if invalid
    """
    try:
        settings = get_settings()
        
        if not settings.appwrite_project_id:
            logger.error("Appwrite project ID not configured. Set CLARIQ_APPWRITE_PROJECT_ID in .env")
            return None
        
        if not session_token or session_token.strip() == "":
            logger.warning("Empty session token provided")
            return None
        
        # Connect to Appwrite with user's session
        client = Client()
        client.set_endpoint(settings.appwrite_endpoint)
        client.set_project(settings.appwrite_project_id)
        client.set_session(session_token)  # Use user's session
        
        # Try to get user info - this validates the session
        account = Account(client)
        user_data = account.get()  # If session is invalid, this throws exception
        
        logger.info(f"User authenticated: {user_data.get('email')}")
        return AppwriteUser(user_data)
        
    except AppwriteException as e:
        logger.warning(f"Invalid Appwrite session: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected auth error: {e}")
        return None