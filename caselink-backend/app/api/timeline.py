"""
Temporal Analysis & Timeline Endpoints
Provides chronologically ordered event sequences and spatial-temporal entity trajectories.
"""
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.auth import get_current_user
from app.mock_data.seed_data import (
    get_mock_timeline, get_mock_cases, get_mock_entities, get_mock_relationships
)

router = APIRouter(prefix="/timeline", tags=["Timeline Analysis"])


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/{case_id}", response_model=List[Dict[str, Any]])
async def get_case_timeline(
    case_id: str,
    significance: Optional[str] = Query(None, description="Filter by significance: Critical, High, Medium, Low"),
    entity_id: Optional[str] = Query(None, description="Filter events involving a specific entity"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    5. TEMPORAL ANALYSIS ENGINE API
    Return chronologically ordered investigation events for React timeline rendering.
    Format: [{"date": "2026-01-05", "event": "...", "location": "...", "significance": "Critical"}]
    """
    # Verify case exists
    cases = get_mock_cases()
    if not any(c["id"] == case_id for c in cases):
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    events = get_mock_timeline(case_id)

    # Apply filters
    if significance:
        events = [e for e in events if e.get("significance", "").lower() == significance.lower()]
    if entity_id:
        events = [e for e in events if e.get("entity_id") == entity_id]

    # Enrich events with index and color coding
    significance_colors = {
        "Critical": "#ef4444",
        "High": "#f59e0b",
        "Medium": "#3b82f6",
        "Low": "#6b7280",
    }

    enriched_events = []
    for i, event in enumerate(events):
        enriched_events.append({
            **event,
            "index": i,
            "color": significance_colors.get(event.get("significance", "Low"), "#94a3b8"),
            "formatted_date": event.get("date", "")[:10],
        })

    return enriched_events


@router.get("/{case_id}/trajectory/{entity_id}", response_model=Dict[str, Any])
async def get_entity_trajectory(
    case_id: str,
    entity_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Reconstruct spatial-temporal path trajectory for a suspect or vehicle.
    Returns ordered GPS waypoints compatible with Leaflet maps.
    """
    # Find the entity
    entities = get_mock_entities(case_id)
    entity = next((e for e in entities if e["id"] == entity_id), None)

    if not entity:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_id}' not found in case '{case_id}'.")

    # Get all timeline events for this entity
    all_events = get_mock_timeline(case_id)
    entity_events = [e for e in all_events if e.get("entity_id") == entity_id]

    # Get related location entities from relationships
    relationships = get_mock_relationships(case_id)
    location_ids = set()
    for rel in relationships:
        if rel["source_entity"] == entity_id and rel["relationship_type"] in (
            "SEEN_AT", "VISITED", "OPERATES_FROM", "REGISTERED_AT", "TRAVELLED_TO"
        ):
            location_ids.add(rel["target_entity"])
        elif rel["target_entity"] == entity_id and rel["relationship_type"] in ("LOCATED_AT",):
            location_ids.add(rel["source_entity"])

    # Build waypoints from location entities
    waypoints = []
    all_entities = get_mock_entities(case_id)
    for loc_id in location_ids:
        loc = next((e for e in all_entities if e["id"] == loc_id and e["type"] == "Location"), None)
        if loc and loc.get("extra_metadata", {}).get("lat"):
            meta = loc["extra_metadata"]
            # Find matching timeline event if any
            matching_event = next(
                (ev for ev in entity_events if loc["name"] in ev.get("event", "")), None
            )
            waypoints.append({
                "location_id": loc_id,
                "location_name": loc["name"],
                "lat": meta["lat"],
                "lng": meta["lng"],
                "date": matching_event["date"] if matching_event else None,
                "event_description": matching_event["event"] if matching_event else f"{entity['name']} linked to {loc['name']}",
                "source": matching_event.get("source", "Relationship Analysis") if matching_event else "Graph Relationship",
            })

    # Sort by date where available
    waypoints_with_date = sorted(
        [w for w in waypoints if w["date"]], key=lambda x: x["date"]
    )
    waypoints_no_date = [w for w in waypoints if not w["date"]]
    ordered_waypoints = waypoints_with_date + waypoints_no_date

    # Calculate total distances
    total_distance = 0.0
    if len(ordered_waypoints) >= 2:
        from app.services.relationship_analysis import relationship_analysis_service
        for i in range(len(ordered_waypoints) - 1):
            a = ordered_waypoints[i]
            b = ordered_waypoints[i + 1]
            d = relationship_analysis_service.calculate_distance(
                (a["lat"], a["lng"]), (b["lat"], b["lng"])
            )
            total_distance += d
            ordered_waypoints[i]["distance_to_next_km"] = d

    return {
        "entity": {
            "id": entity_id,
            "name": entity["name"],
            "type": entity["type"],
        },
        "case_id": case_id,
        "waypoints": ordered_waypoints,
        "total_distance_km": round(total_distance, 2),
        "waypoint_count": len(ordered_waypoints),
        "timeline_events": entity_events,
        "map_config": {
            "format": "leaflet",
            "center": [ordered_waypoints[0]["lat"], ordered_waypoints[0]["lng"]] if ordered_waypoints else [20.5937, 78.9629],
            "zoom": 6,
        },
    }


@router.get("/{case_id}/anomalies", response_model=Dict[str, Any])
async def detect_temporal_anomalies(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Detect temporal anomalies in the case timeline (unusual hours, tight windows, missing gaps).
    Highlights events that warrant further investigative attention.
    """
    events = get_mock_timeline(case_id)
    anomalies = []

    for event in events:
        flags = []
        event_str = event.get("event", "").lower()
        date_str = event.get("date", "")

        # Late-night activity detection
        if "T" in date_str:
            try:
                hour = int(date_str.split("T")[1][:2])
                if hour >= 22 or hour <= 4:
                    flags.append("Late-night / early-morning activity (22:00–04:00)")
            except Exception:
                pass

        # High value transactions
        if "crore" in event_str or "lakh" in event_str or "₹" in event_str:
            flags.append("Large financial transaction detected")

        # Border crossings
        if "border" in event_str or "airport" in event_str or "port" in event_str:
            flags.append("International movement checkpoint activity")

        # Significance override
        if event.get("significance") == "Critical":
            flags.append("Marked as Critical significance by intelligence source")

        if flags:
            anomalies.append({
                **event,
                "anomaly_flags": flags,
                "anomaly_count": len(flags),
            })

    return {
        "case_id": case_id,
        "total_events": len(events),
        "anomalous_events": len(anomalies),
        "anomalies": sorted(anomalies, key=lambda x: x["anomaly_count"], reverse=True),
    }
