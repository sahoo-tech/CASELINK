"""
SQLAlchemy Declarative Base
Models import Base from here. Alembic env.py imports this module to auto-detect all tables.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()
