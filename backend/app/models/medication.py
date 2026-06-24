import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Medication(Base):
    __tablename__ = "medications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(50), default="Daily", nullable=False)
    time_of_day = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="medications")
    logs = relationship("MedicationLog", back_populates="medication", cascade="all, delete-orphan")

class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medication_id = Column(String(36), ForeignKey("medications.id", ondelete="CASCADE"), nullable=False)
    taken_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    medication = relationship("Medication", back_populates="logs")
