# Re-export Declarative Base from app.core.database for project-wide model imports
from app.core.database import Base

# Shared utilities for models can be imported here if needed
import uuid
from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func

class TimeStampedModel:
    """An abstract mixin class to add created_at and updated_at columns."""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
