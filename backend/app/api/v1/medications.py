from datetime import datetime, time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.medication import Medication, MedicationLog
from app.schemas.medication import MedicationResponse, MedicationCreate, MedicationTakenRequest, MedicationLogResponse

router = APIRouter(prefix="/medications", tags=["medications"])

@router.get("/", response_model=List[MedicationResponse])
def list_medications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists user medications with calculated adherence metrics."""
    meds = db.query(Medication).filter(Medication.user_id == current_user.id).all()
    
    # Calculate today's dose events
    today_start = datetime.combine(datetime.now().date(), time.min)
    
    response_data = []
    for med in meds:
        # Check if there is a dose logged today
        today_log_count = db.query(MedicationLog).filter(
            MedicationLog.medication_id == med.id,
            MedicationLog.taken_at >= today_start
        ).count()
        
        # Simple compliance calculation
        scheduled = 1
        taken = min(today_log_count, scheduled)
        ratio = 100 if taken >= scheduled else 0
        
        response_data.append(
            MedicationResponse(
                id=med.id,
                user_id=med.user_id,
                name=med.name,
                dosage=med.dosage,
                frequency=med.frequency,
                time_of_day=med.time_of_day,
                is_active=med.is_active,
                created_at=med.created_at,
                total_doses_scheduled=scheduled,
                total_doses_taken=taken,
                adherence_ratio=ratio
            )
        )
        
    return response_data

@router.post("/", response_model=MedicationResponse)
def create_medication(
    med_in: MedicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new medication schedule entry."""
    new_med = Medication(
        user_id=current_user.id,
        name=med_in.name,
        dosage=med_in.dosage,
        frequency=med_in.frequency,
        time_of_day=med_in.time_of_day,
        is_active=med_in.is_active
    )
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    
    return MedicationResponse(
        id=new_med.id,
        user_id=new_med.user_id,
        name=new_med.name,
        dosage=new_med.dosage,
        frequency=new_med.frequency,
        time_of_day=new_med.time_of_day,
        is_active=new_med.is_active,
        created_at=new_med.created_at,
        total_doses_scheduled=1,
        total_doses_taken=0,
        adherence_ratio=0
    )

@router.post("/taken", response_model=MedicationLogResponse)
def log_medication_dose(
    log_in: MedicationTakenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logs a dose intake event for a specific medication schedule."""
    # Verify medication belongs to user
    med = db.query(Medication).filter(
        Medication.id == log_in.medication_id,
        Medication.user_id == current_user.id
    ).first()
    
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication schedule not found or access denied."
        )
        
    new_log = MedicationLog(medication_id=med.id)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    return new_log

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medication(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Removes a medication schedule."""
    med = db.query(Medication).filter(
        Medication.id == id,
        Medication.user_id == current_user.id
    ).first()
    
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication schedule not found or access denied."
        )
        
    db.delete(med)
    db.commit()
    return
