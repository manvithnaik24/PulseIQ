from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.family import FamilyMember
from app.schemas.family import FamilyMemberResponse, FamilyMemberCreate, FamilyMemberUpdate

router = APIRouter(prefix="/family", tags=["family"])

@router.get("/list", response_model=List[FamilyMemberResponse])
def list_family_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves list of linked family members inside the caregiver circle."""
    members = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    return members

@router.post("/add", response_model=FamilyMemberResponse)
def add_family_member(
    member_in: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Links a family member status tracking node."""
    new_member = FamilyMember(
        user_id=current_user.id,
        name=member_in.name,
        relation=member_in.relation,
        age=member_in.age,
        photo=member_in.photo,
        status=member_in.status,
        health_score=member_in.health_score,
        medication_adherence=member_in.medication_adherence,
        heart_rate=member_in.heart_rate,
        spo2=member_in.spo2,
        phone_number=member_in.phone_number,
        email=member_in.email
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

@router.put("/{id}", response_model=FamilyMemberResponse)
def update_family_member(
    id: str,
    member_in: FamilyMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates a family member tracking node."""
    member = db.query(FamilyMember).filter(
        FamilyMember.id == id,
        FamilyMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member tracking node not found or access denied."
        )
        
    update_data = member_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
        
    db.commit()
    db.refresh(member)
    return member

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_family_member(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Removes a family member tracking node from patient circle."""
    member = db.query(FamilyMember).filter(
        FamilyMember.id == id,
        FamilyMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member tracking node not found or access denied."
        )
        
    db.delete(member)
    db.commit()
    return
