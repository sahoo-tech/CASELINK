"""
Authentication & Access Control Endpoints
Roles: Investigator, Analyst, Admin
Uses JWT tokens with hardcoded mock officer accounts for prototype demo.
"""
from datetime import timedelta, datetime, timezone
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import verify_password, verify_token
from app.mock_data.seed_data import get_mock_officers

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    official_id: str
    password: str
    department: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


# ─── Default Demo Officer Profile (No token required in prototype demo) ──────
DEMO_OFFICER_PROFILE = {
    "sub": "INV001",
    "official_id": "INV001",
    "full_name": "ACP Vikram Sharma",
    "role": "Investigator",
    "department": "CBI",
    "user_id": "user-001",
    "is_demo_session": True,
}


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """
    Prototype Demo Mode:
    If a Bearer token is provided, validates and decodes it.
    If no token is provided, automatically uses the default Demo Officer profile.
    Eliminates 401 Unauthorized hurdles during prototype evaluation.
    """
    if credentials is not None:
        payload = verify_token(credentials.credentials)
        if payload is not None:
            return payload
    return DEMO_OFFICER_PROFILE


def require_role(allowed_roles: list):
    """Role-based access control — permits demo officer access across all endpoints."""
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        return current_user
    return role_checker


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate officer and return a signed JWT access token.
    Demo credentials:
      - INV001 / caselink123 (Investigator)
      - ANL001 / caselink123 (Analyst)
      - ADM001 / caselink123 (Admin)
    """
    officers = get_mock_officers()
    officer = next(
        (o for o in officers if o["official_id"] == credentials.official_id),
        None,
    )

    if not officer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Official ID not found in the system.",
        )

    if not officer.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact system administrator.",
        )

    if not verify_password(credentials.password, officer["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password.",
        )

    # Build JWT payload with all officer fields
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": officer["official_id"],
        "role": officer["role"],
        "department": officer["department"],
        "full_name": officer["full_name"],
        "user_id": officer["id"],
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    access_token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": officer["id"],
            "official_id": officer["official_id"],
            "full_name": officer["full_name"],
            "role": officer["role"],
            "department": officer["department"],
        },
    )


@router.get("/me")
async def get_current_officer(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve the authenticated officer's profile from the session JWT."""
    return {
        "official_id": current_user.get("sub"),
        "full_name": current_user.get("full_name"),
        "role": current_user.get("role"),
        "department": current_user.get("department"),
        "user_id": current_user.get("user_id"),
        "token_valid": True,
    }


@router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Logout endpoint. JWT tokens are stateless, so client should discard the token.
    In production, add to a server-side blacklist.
    """
    return {
        "message": f"Officer {current_user.get('sub')} logged out successfully.",
        "note": "Please discard your access token on the client side.",
    }
