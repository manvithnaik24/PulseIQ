import uuid
from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class HealthMetric(Base):
    __tablename__ = "health_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    heart_rate = Column(Integer, nullable=False)
    spo2 = Column(Integer, nullable=False)
    sleep_hours = Column(Numeric(4, 2), nullable=False)
    medication_compliance = Column(Integer, default=100, nullable=False)
    health_score = Column(Integer, default=100, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="health_metrics")

class Device(Base):
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_name = Column(String(100), nullable=False)
    device_type = Column(String(50), nullable=False)
    serial_number = Column(String(100), unique=True, index=True, nullable=False)
    connected_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="devices")
