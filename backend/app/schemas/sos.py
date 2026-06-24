from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class SosAlertBase(BaseModel):
    latitude: float
    longitude: float
    resolved_address: Optional[str] = None

class SosAlertCreate(SosAlertBase):
    pass

class NotifiedContact(BaseModel):
    name: str
    relation: str
    type: str
    contact: str

class SosAlertResponse(SosAlertBase):
    id: str
    user_id: str
    status: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
    notified_contacts: Optional[List[NotifiedContact]] = None

    class Config:
        from_attributes = True

class EmergencyContactBase(BaseModel):
    name: str
    relationship: str
    phone: str
    is_primary: bool = False

class EmergencyContactCreate(EmergencyContactBase):
    pass

class EmergencyContactResponse(EmergencyContactBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
class SosRef:
    pass
