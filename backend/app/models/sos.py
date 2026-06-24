import uuid
from sqlalchemy import Column, String, Boolean, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship as orm_relationship
from sqlalchemy.sql import func
from app.models.base import Base

class SosAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="Active", nullable=False) # Active, Resolved, Test Trigger
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    resolved_address = Column(String(512), nullable=True)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = orm_relationship("User", back_populates="sos_alerts")

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = orm_relationship("User", back_populates="emergency_contacts")
class EmergencyContactRef:
    pass
