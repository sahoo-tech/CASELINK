"""
Analysis of Competing Hypotheses (ACH) Model & Schemas Skeleton
"""
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import Column, String, Float, Text, ForeignKey, JSON
from app.database.base import Base


# ─── SQLAlchemy ORM Model ───────────────────────────────────────────────────
class HypothesisModel(Base):
    __tablename__ = "hypotheses"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    support_score = Column(Float, default=0.0)
    contradiction_score = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    status = Column(String, default="MEDIUM")           # HIGH PRIORITY, MEDIUM, LOW
    supporting_evidence = Column(JSON, nullable=True)   # List of supporting evidence strings
    contradicting_evidence = Column(JSON, nullable=True)# List of disconfirming evidence strings


# ─── Pydantic Schemas ───────────────────────────────────────────────────────
class HypothesisBase(BaseModel):
    case_id: str
    description: str
    support_score: float = 0.0
    contradiction_score: float = 0.0
    final_score: float = 0.0
    status: str = "MEDIUM"
    supporting_evidence: List[str] = []
    contradicting_evidence: List[str] = []


class HypothesisCreate(BaseModel):
    case_id: str
    description: str


class HypothesisResponse(HypothesisBase):
    id: str

    class Config:
        from_attributes = True


class LeadRankingResponse(BaseModel):
    lead_priority: str
    score: float
    reasoning: List[str]
    supporting_evidence: List[str]
    contradictions: List[str]
