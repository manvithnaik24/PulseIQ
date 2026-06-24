import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    relation = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    photo = Column(String(512), nullable=True)
    status = Column(String(50), default="Stable", nullable=False)
    health_score = Column(Integer, default=90, nullable=True)
    medication_adherence = Column(Integer, default=85, nullable=True)
    heart_rate = Column(Integer, default=72, nullable=True)
    spo2 = Column(Integer, default=98, nullable=True)
    phone_number = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="family_members")
class FamilyRef:
    pass
