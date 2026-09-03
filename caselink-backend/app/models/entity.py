"""
Entity Data Model & Pydantic Schemas Skeleton
Types: Person, Vehicle, Location, Organization, Event, Document
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from sqlalchemy import Column, String, Float, JSON
from app.database.base import Base


# ─── SQLAlchemy ORM Model ───────────────────────────────────────────────────
class EntityModel(Base):
    __tablename__ = "entities"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)           # Person, Vehicle, Location, Organization, Event, Document
    confidence_score = Column(Float, default=1.0)
    extra_metadata = Column(JSON, nullable=True)    # JSON metadata (aliases, phone, registration, etc.)


# ─── Pydantic Schemas ───────────────────────────────────────────────────────
class EntityBase(BaseModel):
    name: str
    type: str
    confidence_score: float = 1.0
    extra_metadata: Optional[Dict[str, Any]] = None


class EntityCreate(EntityBase):
    pass


class EntityResponse(EntityBase):
    id: str

    class Config:
        from_attributes = True


class EntityResolutionResult(BaseModel):
    matched_entity: str
    confidence: float
    status: str = "Requires Verification"   # Never automatically merge
    rationale: List[str] = []
