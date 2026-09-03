"""
Knowledge Graph Relationship Model & Schemas Skeleton
Relationships: OWNS, SEEN_AT, TRAVELLED_TO, COMMUNICATED_WITH, TRANSACTION_LINK, RELATED_CASE
"""
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, String, Float, ForeignKey
from app.database.base import Base


# ─── SQLAlchemy ORM Model ───────────────────────────────────────────────────
class RelationshipModel(Base):
    __tablename__ = "relationships"

    id = Column(String, primary_key=True, index=True)
    source_entity = Column(String, ForeignKey("entities.id"), nullable=False, index=True)
    target_entity = Column(String, ForeignKey("entities.id"), nullable=False, index=True)
    relationship_type = Column(String, nullable=False)  # OWNS, SEEN_AT, TRAVELLED_TO, etc.
    confidence = Column(Float, default=1.0)
    evidence_reference = Column(String, nullable=True)


# ─── Pydantic Schemas ───────────────────────────────────────────────────────
class RelationshipBase(BaseModel):
    source_entity: str
    target_entity: str
    relationship_type: str
    confidence: float = 1.0
    evidence_reference: Optional[str] = None


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipResponse(RelationshipBase):
    id: str

    class Config:
        from_attributes = True
