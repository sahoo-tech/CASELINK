"""
Case Ingestion & Management Endpoints
Provides full CRUD operations for investigation cases backed by the in-memory mock store.
"""
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.auth import get_current_user
from app.models.case import CaseCreate, CaseResponse, CaseUpdate
from app.mock_data.seed_data import (
    get_mock_cases, get_mock_entities, get_mock_evidence, MOCK_CASES
)

router = APIRouter(prefix="/cases", tags=["Case Management"])

# ─── In-memory mutable case store (wraps the seed data list) ─────────────────
# We use a dict for O(1) lookup
_case_store: Dict[str, Dict[str, Any]] = {}


def _init_store():
    """Lazily initialise the in-memory store from seed data."""
    if not _case_store:
        for c in get_mock_cases():
            _case_store[c["id"]] = dict(c)


def _get_case_or_404(case_id: str) -> Dict[str, Any]:
    _init_store()
    if case_id not in _case_store:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")
    return _case_store[case_id]


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/create", response_model=Dict[str, Any], status_code=201)
async def create_case(
    case_data: CaseCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    1. CASE INGESTION API
    Ingest a new investigation file and return the created case identifier.
    Automatically generates a CASE number and triggers entity extraction pipeline.
    """
    _init_store()

    # Generate unique identifiers
    new_id = f"case-{str(uuid.uuid4())[:8]}"
    case_count = len(_case_store) + 1
    year = datetime.utcnow().year
    case_number = f"CASE-{year}-{case_count:05d}"

    new_case = {
        "id": new_id,
        "case_number": case_number,
        "title": case_data.title,
        "category": case_data.category,
        "location": case_data.location,
        "priority": case_data.priority,
        "description": case_data.description,
        "created_date": datetime.utcnow().isoformat(),
        "status": "Active",
        "created_by": current_user.get("sub", "SYSTEM"),
    }

    _case_store[new_id] = new_case

    return {
        "case_id": new_id,
        "case_number": case_number,
        "message": "Case created successfully. Entity extraction pipeline triggered.",
        "status": "Active",
        "next_step": f"POST /api/v1/entities/extract with case_id='{new_id}' to begin NLP processing.",
    }


@router.get("", response_model=List[Dict[str, Any]])
async def list_cases(
    status: Optional[str] = Query(None, description="Filter by status: Active, Pending, Closed, Archived"),
    priority: Optional[str] = Query(None, description="Filter by priority: Critical, High, Medium, Low"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=200),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """List all registered investigation cases with optional filters and entity/evidence counts."""
    _init_store()
    cases = list(_case_store.values())

    # Apply filters
    if status:
        cases = [c for c in cases if c.get("status", "").lower() == status.lower()]
    if priority:
        cases = [c for c in cases if c.get("priority", "").lower() == priority.lower()]
    if category:
        cases = [c for c in cases if category.lower() in c.get("category", "").lower()]

    # Enrich with quick stats
    enriched = []
    for c in cases[:limit]:
        entities = get_mock_entities(c["id"])
        evidence = get_mock_evidence(c["id"])
        enriched.append({
            **c,
            "entity_count": len(entities),
            "evidence_count": len(evidence),
        })

    # Sort by priority weight then creation date
    priority_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    enriched.sort(key=lambda x: (priority_order.get(x.get("priority", "Low"), 4), x.get("created_date", "")))

    return enriched


@router.get("/{case_id}", response_model=Dict[str, Any])
async def get_case_by_id(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Fetch complete case dossier details including entity and evidence counts."""
    case = _get_case_or_404(case_id)
    entities = get_mock_entities(case_id)
    evidence = get_mock_evidence(case_id)

    entity_type_summary = {}
    for e in entities:
        entity_type_summary[e["type"]] = entity_type_summary.get(e["type"], 0) + 1

    return {
        **case,
        "entity_count": len(entities),
        "evidence_count": len(evidence),
        "entity_type_summary": entity_type_summary,
        "top_entities": [
            {"id": e["id"], "name": e["name"], "type": e["type"], "confidence_score": e.get("confidence_score", 1.0)}
            for e in sorted(entities, key=lambda x: x.get("confidence_score", 0), reverse=True)[:5]
        ],
    }


@router.put("/{case_id}", response_model=Dict[str, Any])
async def update_case(
    case_id: str,
    updates: CaseUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update case status or priority. Changes are logged for audit trail."""
    case = _get_case_or_404(case_id)

    # Validate allowed transitions
    valid_statuses = {"Active", "Pending", "Closed", "Archived"}
    valid_priorities = {"Critical", "High", "Medium", "Low"}

    if updates.status and updates.status not in valid_statuses:
        raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {valid_statuses}")
    if updates.priority and updates.priority not in valid_priorities:
        raise HTTPException(status_code=422, detail=f"Invalid priority. Must be one of: {valid_priorities}")

    if updates.status:
        case["status"] = updates.status
    if updates.priority:
        case["priority"] = updates.priority
    if updates.title:
        case["title"] = updates.title
    if updates.description is not None:
        case["description"] = updates.description

    case["last_updated"] = datetime.utcnow().isoformat()
    case["last_updated_by"] = current_user.get("sub", "SYSTEM")

    _case_store[case_id] = case
    return {"message": "Case updated successfully.", **case}


@router.delete("/{case_id}", status_code=200)
async def archive_case(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Archive a case (soft delete — status set to Archived)."""
    case = _get_case_or_404(case_id)
    case["status"] = "Archived"
    case["archived_at"] = datetime.utcnow().isoformat()
    case["archived_by"] = current_user.get("sub", "SYSTEM")
    _case_store[case_id] = case
    return {"message": f"Case {case_id} archived successfully."}
