import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="patient", nullable=False)
    age = Column(Integer, nullable=True)
    weight = Column(Numeric(5, 2), nullable=True)
    height = Column(Numeric(5, 2), nullable=True)
    blood_group = Column(String(20), nullable=True)
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    gps_accuracy = Column(Float, nullable=True)
    gps_timestamp = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    medications = relationship("Medication", back_populates="user", cascade="all, delete-orphan")
    health_metrics = relationship("HealthMetric", back_populates="user", cascade="all, delete-orphan")
    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    family_members = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    emergency_contacts = relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
    sos_alerts = relationship("SosAlert", back_populates="user", cascade="all, delete-orphan")
    symptom_triage_logs = relationship("SymptomTriageLog", back_populates="user", cascade="all, delete-orphan")
