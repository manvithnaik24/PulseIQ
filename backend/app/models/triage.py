import uuid
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class SymptomTriageLog(Base):
    __tablename__ = "symptom_triage_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    symptoms = Column(Text, nullable=False)
    onset_date = Column(DateTime(timezone=True), nullable=False)
    severity = Column(String(50), nullable=False) # Low, Medium, High
    possible_conditions = Column(JSON, nullable=True) # Array of strings
    recommendations = Column(JSON, nullable=True)     # Array of strings
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="symptom_triage_logs")
class TriageRef:
    pass
