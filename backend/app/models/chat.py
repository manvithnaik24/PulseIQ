import uuid
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    thread_id = Column(String(100), default="default_thread", nullable=False, index=True)
    sender = Column(String(10), nullable=False) # 'user' or 'bot'
    message = Column(Text, nullable=False)
    structured_data = Column(JSON, nullable=True) # recommended_actions, potential_conditions, severity
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="chat_messages")
class ChatRef:
    pass
