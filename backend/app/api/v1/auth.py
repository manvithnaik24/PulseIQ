from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserProfileResponse, UserUpdate, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=UserProfileResponse)
def read_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieves user profile parameters from verified Clerk token payload reference."""
    return current_user

@router.put("/me", response_model=UserProfileResponse)
def update_user_profile(
    profile_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user demographic properties (weight, height, blood group) in PostgreSQL.
    Fixes frontend client-only localStorage updates.
    """
    update_data = profile_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_new_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers new user profiles from frontend registration intake."""
    existing_user = db.query(User).filter(
        (User.clerk_id == user_in.clerk_id) | (User.email == user_in.email.lower())
    ).first()
    
    if existing_user:
        # Avoid crashing, return existing credentials
        return existing_user

    new_user = User(
        clerk_id=user_in.clerk_id,
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        role=user_in.role,
        age=user_in.age,
        weight=user_in.weight,
        height=user_in.height,
        blood_group=user_in.blood_group
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
