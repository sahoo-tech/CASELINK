"""
Case Data Model & Pydantic Schemas Skeleton
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, Text, Integer
from app.database.base import Base


# ─── SQLAlchemy ORM Model ───────────────────────────────────────────────────
class CaseModel(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String, nullable=False)
    created_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Active")       # Active, Pending, Closed, Archived
    priority = Column(String, default="Medium")     # Critical, High, Medium, Low
    description = Column(Text, nullable=True)


# ─── Pydantic Schemas ───────────────────────────────────────────────────────
class CaseBase(BaseModel):
    title: str
    category: str
    location: str
    priority: str = "Medium"
    description: Optional[str] = None


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None


class CaseResponse(CaseBase):
    id: str
    case_number: str
    created_date: datetime
    status: str

    class Config:
        from_attributes = True
