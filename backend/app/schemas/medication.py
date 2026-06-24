from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class MedicationBase(BaseModel):
    name: str
    dosage: str
    frequency: str = "Daily"
    time_of_day: str
    is_active: bool = True

class MedicationCreate(MedicationBase):
    pass

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    time_of_day: Optional[str] = None
    is_active: Optional[bool] = None

class MedicationResponse(MedicationBase):
    id: str
    user_id: str
    created_at: datetime
    total_doses_scheduled: int = 1
    total_doses_taken: int = 0
    adherence_ratio: int = 100

    class Config:
        from_attributes = True

class MedicationLogResponse(BaseModel):
    id: str
    medication_id: str
    taken_at: datetime

    class Config:
        from_attributes = True

class MedicationTakenRequest(BaseModel):
    medication_id: str
