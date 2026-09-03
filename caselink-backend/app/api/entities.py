"""
Entity Extraction & Resolution Endpoints
Calls NLP pipeline to extract entities from text and resolves entity identity matches.
"""
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.api.auth import get_current_user
from app.models.entity import EntityResponse, EntityResolutionResult
from app.services.entity_extraction import entity_extraction_service
from app.services.entity_resolution import entity_resolution_service
from app.mock_data.seed_data import get_mock_entities, get_mock_evidence, MOCK_ENTITIES

router = APIRouter(prefix="/entities", tags=["Entity Intelligence"])


class TextExtractionRequest(BaseModel):
    case_id: str
    text: str
    source_type: str = "FIR"  # FIR, Witness Statement, CDR, Transaction, Intelligence Report


class ResolutionQuery(BaseModel):
    query_name: str
    candidates: List[str]
    entity_type: str = "Person"   # Person | Vehicle | Organization


class GeospatialQuery(BaseModel):
    entity_a_id: str
    entity_b_id: str
    time_delta_hours: float = 6.0


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/extract", response_model=Dict[str, Any])
async def extract_entities(
    payload: TextExtractionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    2. ENTITY EXTRACTION API
    Extract Person, Location, Vehicle, Organization, and Event entities from raw narrative text.
    Uses spaCy NER + India-specific regex patterns.
    """
    if not payload.text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty.")

    if len(payload.text) > 50000:
        raise HTTPException(status_code=422, detail="Text exceeds maximum length of 50,000 characters.")

    # Run NLP extraction
    extracted = entity_extraction_service.extract_entities(payload.text)
    vehicles = entity_extraction_service.extract_vehicles(payload.text)
    dates = entity_extraction_service.extract_dates(payload.text)

    # Count by type
    type_counts = {}
    for entity in extracted:
        t = entity["type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    return {
        "case_id": payload.case_id,
        "source_type": payload.source_type,
        "input_length": len(payload.text),
        "entities": extracted,
        "dates_detected": dates,
        "extraction_summary": {
            "total_entities": len(extracted),
            "by_type": type_counts,
            "vehicles_found": len(vehicles),
            "dates_found": len(dates),
        },
        "next_step": "Review extracted entities and POST to /entities/resolve to check for duplicates.",
    }


@router.post("/resolve", response_model=List[Dict[str, Any]])
async def resolve_entities(
    payload: ResolutionQuery,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    3. ENTITY RESOLUTION API
    Detect whether query entity matches any candidate — flagged for human verification.
    IMPORTANT: Results always require investigator approval. No automatic merging.
    """
    if not payload.query_name.strip():
        raise HTTPException(status_code=422, detail="query_name cannot be empty.")
    if not payload.candidates:
        raise HTTPException(status_code=422, detail="candidates list cannot be empty.")
    if len(payload.candidates) > 100:
        raise HTTPException(status_code=422, detail="Maximum 100 candidates per request.")

    results = entity_resolution_service.resolve_candidates(
        query_entity=payload.query_name,
        candidate_entities=payload.candidates,
    )

    return [
        {
            **r,
            "entity_type": payload.entity_type,
            "query_entity": payload.query_name,
            "human_action_required": True,
            "note": "Investigator must verify and approve before any database merge.",
        }
        for r in results
    ]


@router.get("/{case_id}", response_model=List[Dict[str, Any]])
async def get_case_entities(
    case_id: str,
    entity_type: str = Query(None, description="Filter by type: Person, Vehicle, Location, Organization, Event, Document"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """List all entities linked to a specific case, optionally filtered by type."""
    entities = get_mock_entities(case_id)
    if not entities:
        # Check if case exists
        from app.mock_data.seed_data import get_mock_cases
        cases = get_mock_cases()
        if not any(c["id"] == case_id for c in cases):
            raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")
        return []

    if entity_type:
        entities = [e for e in entities if e.get("type", "").lower() == entity_type.lower()]

    return sorted(entities, key=lambda x: x.get("confidence_score", 0), reverse=True)


@router.get("/{case_id}/cross-links")
async def find_cross_case_entities(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Identify entities from this case that appear in other cases (cross-case link discovery)."""
    case_entities = get_mock_entities(case_id)
    case_names = {e["name"] for e in case_entities}

    all_entities = MOCK_ENTITIES
    cross_links = []

    for entity in all_entities:
        if entity.get("case_id") == case_id:
            continue
        if entity["name"] in case_names:
            cross_links.append({
                "entity_name": entity["name"],
                "entity_type": entity["type"],
                "found_in_case": entity.get("case_id"),
                "entity_id_current_case": next(
                    (e["id"] for e in case_entities if e["name"] == entity["name"]), None
                ),
                "entity_id_other_case": entity["id"],
                "significance": "HIGH — same entity appears in multiple independent cases",
            })

    return {
        "case_id": case_id,
        "cross_case_links": cross_links,
        "total_links": len(cross_links),
        "summary": f"Found {len(cross_links)} entity cross-references with other cases.",
    }


@router.post("/movement/check")
async def check_movement_feasibility(
    payload: GeospatialQuery,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    6. GEOSPATIAL ANALYSIS API
    Evaluate whether an entity could physically travel between two locations within the time window.
    """
    # Get entity locations from mock data
    all_entities = MOCK_ENTITIES
    entity_a = next((e for e in all_entities if e["id"] == payload.entity_a_id), None)
    entity_b = next((e for e in all_entities if e["id"] == payload.entity_b_id), None)

    if not entity_a or not entity_b:
        raise HTTPException(status_code=404, detail="One or both entity IDs not found.")

    coord_a = (
        entity_a.get("extra_metadata", {}).get("lat"),
        entity_a.get("extra_metadata", {}).get("lng"),
    )
    coord_b = (
        entity_b.get("extra_metadata", {}).get("lat"),
        entity_b.get("extra_metadata", {}).get("lng"),
    )

    if not all(coord_a) or not all(coord_b):
        raise HTTPException(
            status_code=422,
            detail="One or both entities do not have GPS coordinates in metadata.",
        )

    from app.services.relationship_analysis import relationship_analysis_service
    result = relationship_analysis_service.evaluate_movement_compatibility(
        origin_coord=coord_a,
        dest_coord=coord_b,
        time_delta_hours=payload.time_delta_hours,
    )

    return {
        "entity_a": {"id": payload.entity_a_id, "name": entity_a["name"], "location": coord_a},
        "entity_b": {"id": payload.entity_b_id, "name": entity_b["name"], "location": coord_b},
        "time_window_hours": payload.time_delta_hours,
        **result,
    }
