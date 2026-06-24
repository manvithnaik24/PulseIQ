import jwt
import requests
from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

reusable_oauth2 = HTTPBearer(scheme_name="ClerkJWT", auto_error=True)

# Global JWKS Cache
_jwks_cache: Optional[Dict[str, Any]] = None

def get_jwks() -> Dict[str, Any]:
    """Retrieves and caches Clerk JWKS keys."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache
    
    try:
        response = requests.get(settings.CLERK_JWKS_URL, timeout=10)
        response.raise_for_status()
        _jwks_cache = response.json()
        return _jwks_cache
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch Clerk JWKS keys for token verification: {str(e)}"
        )

def verify_clerk_token(token: str) -> Dict[str, Any]:
    """Verifies Clerk session JWT token against cached JWKS public keys."""
    try:
        # 1. Decode header without verification to extract key ID (kid)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise jwt.InvalidTokenError("Token header is missing 'kid'.")
        
        # 2. Match kid in JWKS
        jwks = get_jwks()
        public_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
                
        if not public_key:
            # If kid not found, invalidate cache and reload once
            global _jwks_cache
            _jwks_cache = None
            jwks = get_jwks()
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                    break
            
            if not public_key:
                raise jwt.InvalidTokenError("Matching public key (kid) not found in JWKS.")
        
        # 3. Decode and verify JWT claims
        # verify_aud is disabled by default to prevent client configuration errors
        # unless an explicit audience requirement is added
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please log in again."
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials."
        )

def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(reusable_oauth2)
) -> User:
    """Dependency that verifies Clerk JWT token and retrieves the user.
    Uses a lazy creation fallback if user doesn't exist yet.
    """
    token = credentials.credentials
    payload = verify_clerk_token(token)
    
    clerk_id = payload.get("sub")
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject ID (sub)."
        )
    
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    
    if not user:
        # Fallback Lazy Creation: Sync basic profile info from JWT claims if not yet created via webhook
        email = payload.get("email") or payload.get("primary_email_address")
        if not email:
            # Extract from claims payload nested properties if available
            emails = payload.get("emails", [])
            if emails:
                email = emails[0]
            else:
                email = f"clerk_{clerk_id}@example.com"
        
        full_name = payload.get("name") or payload.get("full_name") or email.split("@")[0]
        
        # Create user record
        user = User(
            clerk_id=clerk_id,
            email=email.lower(),
            full_name=full_name,
            role="patient",
            age=28,  # Default baseline metrics
            weight=70.0,
            height=175.0,
            blood_group="O+"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user
