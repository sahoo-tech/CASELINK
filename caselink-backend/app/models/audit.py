"""
Audit Log Model for access tracking and compliance
Records every significant action taken by an officer.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, Text
from app.database.base import Base


# ─── SQLAlchemy ORM Model ───────────────────────────────────────────────────
class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)        # official_id of officer
    action = Column(String, nullable=False)                     # e.g. VIEW_CASE, EXTRACT_ENTITIES
    resource_type = Column(String, nullable=True)               # Case | Entity | Evidence | Graph
    resource_id = Column(String, nullable=True, index=True)     # case_id or entity_id
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)                       # JSON string of request details


# ─── Pydantic Schema ────────────────────────────────────────────────────────
class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    timestamp: datetime
    details: Optional[str] = None

    class Config:
        from_attributes = True
