from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class FamilyMemberBase(BaseModel):
    name: str
    relation: str
    age: Optional[int] = None
    photo: Optional[str] = None
    status: str = "Stable"
    health_score: Optional[int] = 90
    medication_adherence: Optional[int] = 85
    heart_rate: Optional[int] = 72
    spo2: Optional[int] = 98
    phone_number: Optional[str] = None
    email: Optional[str] = None

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relation: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    health_score: Optional[int] = None
    medication_adherence: Optional[int] = None
    heart_rate: Optional[int] = None
    spo2: Optional[int] = None

class FamilyMemberResponse(FamilyMemberBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
class FamilyRef:
    pass
