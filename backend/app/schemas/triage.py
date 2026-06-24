from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class SymptomTriageRequest(BaseModel):
    symptoms: str
    onset_date: datetime

class SymptomTriageResponse(BaseModel):
    id: str
    symptoms: str
    possible_conditions: List[str] = []
    recommendations: List[str] = []
    severity: str = "Low"

    class Config:
        from_attributes = True
