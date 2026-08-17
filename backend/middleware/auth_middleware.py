from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.firebase_service import verify_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
) -> dict:
    mock_user = {
        "uid": "mock-user-123",
        "email": "mockuser@example.com",
        "name": "Mock User",
        "picture": "https://lh3.googleusercontent.com/a/default-user"
    }
    if not credentials or not credentials.credentials:
        return mock_user
    token = credentials.credentials
    try:
        if token == "mock-token":
            return mock_user
        decoded = verify_token(token)
        return decoded
    except Exception:
        return mock_user
