"""
Evidence Record Data Model & Pydantic Schemas Skeleton
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, Float, Text, ForeignKey
from app.database.base import Base


# ─── SQLAlchemy ORM Model ───────────────────────────────────────────────────
class EvidenceModel(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)
    source_type = Column(String, nullable=False)     # FIR, Document, Vehicle Registry, CDR, Sensor
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    reliability_score = Column(Float, default=1.0)


# ─── Pydantic Schemas ───────────────────────────────────────────────────────
class EvidenceBase(BaseModel):
    case_id: str
    source_type: str
    content: str
    reliability_score: float = 1.0


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceResponse(EvidenceBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
