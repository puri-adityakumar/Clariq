from core.config import get_settings


def verify_api_key(api_key: str) -> bool:
    """
    Verify if the provided API key is valid.
    Phase 1: Simple static key validation
    Phase 2: Database lookup with roles and permissions
    """
    settings = get_settings()
    return api_key in settings.api_keys


# Future: Appwrite integration
# async def verify_appwrite_session(session_token: str) -> dict:
#     """Verify Appwrite session and return user info"""
#     # TODO: Implement Appwrite SDK integration
#     pass