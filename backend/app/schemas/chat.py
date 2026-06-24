from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ChatStructuredData(BaseModel):
    recommended_actions: List[str] = []
    potential_conditions: List[str] = []
    severity: str = "Low"

class ChatPromptRequest(BaseModel):
    message: str

class ChatPromptResponse(BaseModel):
    response: str
    structured_data: Optional[ChatStructuredData] = None

class ChatMessageResponse(BaseModel):
    id: str
    sender: str  # 'user' or 'bot' (which the backend endpoint maps to 'user' or 'bot' directly)
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

