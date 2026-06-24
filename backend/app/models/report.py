import uuid
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Report(Base):
    __tablename__ = "health_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_name = Column(String(255), nullable=False)
    practitioner_name = Column(String(255), nullable=True)
    facility_name = Column(String(255), nullable=True)
    extracted_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    key_findings = Column(JSON, nullable=True)     # Maps to JSONB on PG, Text on SQLite
    abnormal_values = Column(JSON, nullable=True)  # Maps to JSONB on PG, Text on SQLite
    risk_level = Column(String(50), default="Low", nullable=False)
    recommendations = Column(JSON, nullable=True)   # Maps to JSONB on PG, Text on SQLite
    file_path = Column(String(512), nullable=True)  # URL or local filesystem path
    report_type = Column(String(100), nullable=True)
    file_size = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
class ReportRef:
    pass
