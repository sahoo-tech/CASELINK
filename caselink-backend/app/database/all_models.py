"""
All model imports for Alembic auto-migration detection.
Import this module in alembic/env.py as:
    from app.database.all_models import *  # noqa
"""
from app.database.base import Base  # noqa: F401
from app.models.case import CaseModel           # noqa: F401
from app.models.entity import EntityModel       # noqa: F401
from app.models.evidence import EvidenceModel   # noqa: F401
from app.models.relationship import RelationshipModel  # noqa: F401
from app.models.hypothesis import HypothesisModel      # noqa: F401
from app.models.user import UserModel           # noqa: F401
from app.models.audit import AuditLogModel      # noqa: F401
