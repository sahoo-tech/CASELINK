"""
Officer / User Account Model & Pydantic Schemas
Roles: Investigator, Analyst, Admin
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel
from sqlalchemy import Column, String, Boolean
from app.database.base import Base


# ─── SQLAlchemy ORM Model ───────────────────────────────────────────────────
class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    official_id = Column(String, unique=True, index=True, nullable=False)   # e.g. INV001
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)           # Investigator | Analyst | Admin
    department = Column(String, nullable=False)     # CBI, IB, ED, NIA, etc.
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)


# ─── Pydantic Schemas ───────────────────────────────────────────────────────
class UserCreate(BaseModel):
    official_id: str
    full_name: str
    role: str
    department: str
    password: str


class UserResponse(BaseModel):
    id: str
    official_id: str
    full_name: str
    role: str
    department: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    sub: str
    role: Optional[str] = None
    department: Optional[str] = None
