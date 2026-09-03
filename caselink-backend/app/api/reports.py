"""
Investigation Report & Dossier Endpoints
Compiles a complete structured investigation summary from all modules.
"""
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.auth import get_current_user
from app.mock_data.seed_data import (
    get_mock_cases, get_mock_entities, get_mock_evidence,
    get_mock_relationships, get_mock_timeline, get_mock_hypotheses
)
from app.services.hypothesis_engine import hypothesis_engine_service
from app.services.evidence_ranker import evidence_ranker_service

router = APIRouter(prefix="/reports", tags=["Report Generation"])


@router.get("/{case_id}", response_model=Dict[str, Any])
async def get_investigation_report(
    case_id: str,
    include_graph_stats: bool = Query(True),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    9. REPORT GENERATION API
    Generate a structured investigation summary dossier:
    - Case Summary & Metadata
    - Entity Intelligence Overview
    - Evidence Index
    - Knowledge Graph Snapshot Statistics
    - Top Hypotheses (ACH ranked)
    - Investigative Lead Rankings
    - Timeline Overview
    - Cross-Case Connection Summary
    - Investigator Assessment Notes Template
    """
    # Verify case exists
    cases = get_mock_cases()
    case = next((c for c in cases if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    # ── Gather all module outputs ─────────────────────────────────────────────
    entities = get_mock_entities(case_id)
    evidence = get_mock_evidence(case_id)
    relationships = get_mock_relationships(case_id)
    timeline = get_mock_timeline(case_id)
    hypotheses = hypothesis_engine_service.generate_competing_hypotheses(case_id)
    leads = evidence_ranker_service.rank_case_leads(case_id)

    # ── Entity summary ────────────────────────────────────────────────────────
    entity_type_counts = {}
    for e in entities:
        entity_type_counts[e["type"]] = entity_type_counts.get(e["type"], 0) + 1

    high_confidence_entities = [
        {"name": e["name"], "type": e["type"], "confidence": e.get("confidence_score", 1.0)}
        for e in entities if e.get("confidence_score", 0) >= 0.85
    ]
    high_confidence_entities.sort(key=lambda x: x["confidence"], reverse=True)

    # ── Primary suspects (persons sorted by confidence) ───────────────────────
    persons = sorted(
        [e for e in entities if e["type"] == "Person"],
        key=lambda x: x.get("confidence_score", 0),
        reverse=True,
    )

    # ── Key locations ─────────────────────────────────────────────────────────
    locations = [e for e in entities if e["type"] == "Location"]

    # ── Cross-case entity links ────────────────────────────────────────────────
    all_entities_all_cases = []
    for c in cases:
        if c["id"] != case_id:
            all_entities_all_cases.extend(get_mock_entities(c["id"]))

    case_entity_names = {e["name"] for e in entities}
    cross_case_links = []
    for e in all_entities_all_cases:
        if e["name"] in case_entity_names:
            cross_case_links.append({
                "entity_name": e["name"],
                "entity_type": e["type"],
                "linked_case": e.get("case_id"),
                "linked_case_entity_id": e["id"],
            })

    # ── Critical timeline events ──────────────────────────────────────────────
    critical_events = [ev for ev in timeline if ev.get("significance") in ("Critical", "High")]

    # ── Top hypothesis ────────────────────────────────────────────────────────
    top_hypothesis = hypotheses[0] if hypotheses else None

    # ── Top lead ──────────────────────────────────────────────────────────────
    top_lead = leads[0] if leads else None

    # ── Graph statistics ──────────────────────────────────────────────────────
    graph_stats = None
    if include_graph_stats:
        graph_stats = {
            "total_entity_nodes": len(entities),
            "total_relationships": len(relationships),
            "cross_case_connections": len(cross_case_links),
            "entity_type_distribution": entity_type_counts,
            "relationship_types": list({r["relationship_type"] for r in relationships}),
        }

    # ── Build full report ─────────────────────────────────────────────────────
    report = {
        "report_metadata": {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "generated_by": current_user.get("sub", "SYSTEM"),
            "case_id": case_id,
            "report_type": "Investigation Dossier",
            "classification": "RESTRICTED — FOR AUTHORIZED PERSONNEL ONLY",
        },

        "case_summary": {
            **case,
            "total_entities": len(entities),
            "total_evidence_records": len(evidence),
            "total_relationships": len(relationships),
            "total_timeline_events": len(timeline),
            "cross_case_connections": len(cross_case_links),
        },

        "entity_intelligence": {
            "total_entities": len(entities),
            "entity_type_distribution": entity_type_counts,
            "primary_suspects": [
                {
                    "name": p["name"],
                    "confidence": p.get("confidence_score", 1.0),
                    "aliases": p.get("extra_metadata", {}).get("aliases", []),
                    "phone": p.get("extra_metadata", {}).get("phone"),
                    "age": p.get("extra_metadata", {}).get("age"),
                }
                for p in persons[:5]
            ],
            "key_locations": [
                {
                    "name": l["name"],
                    "coordinates": {
                        "lat": l.get("extra_metadata", {}).get("lat"),
                        "lng": l.get("extra_metadata", {}).get("lng"),
                    },
                    "location_type": l.get("extra_metadata", {}).get("location_type"),
                }
                for l in locations[:5]
            ],
            "high_confidence_entities": high_confidence_entities[:10],
        },

        "evidence_index": {
            "total_records": len(evidence),
            "by_source_type": {
                src: len([ev for ev in evidence if ev.get("source_type") == src])
                for src in {ev.get("source_type", "Unknown") for ev in evidence}
            },
            "recent_evidence": [
                {
                    "id": ev["id"],
                    "source_type": ev["source_type"],
                    "summary": ev["content"][:150] + "..." if len(ev["content"]) > 150 else ev["content"],
                    "reliability": ev.get("reliability_score", 1.0),
                    "timestamp": ev.get("timestamp"),
                }
                for ev in sorted(evidence, key=lambda x: x.get("timestamp", ""), reverse=True)[:5]
            ],
        },

        "knowledge_graph": graph_stats,

        "competing_hypotheses": {
            "total_hypotheses": len(hypotheses),
            "top_hypothesis": {
                "description": top_hypothesis["description"] if top_hypothesis else None,
                "confidence": top_hypothesis.get("final_score") if top_hypothesis else None,
                "status": top_hypothesis.get("status") if top_hypothesis else None,
                "key_evidence": (top_hypothesis.get("supporting_evidence", [])[:3] if top_hypothesis else []),
                "contradictions": (top_hypothesis.get("contradicting_evidence", [])[:2] if top_hypothesis else []),
            },
            "all_hypotheses": [
                {
                    "id": h.get("id"),
                    "description_short": h["description"][:120] + "...",
                    "final_score": h.get("final_score", 0),
                    "status": h.get("status"),
                    "supporting_count": len(h.get("supporting_evidence", [])),
                    "contradicting_count": len(h.get("contradicting_evidence", [])),
                }
                for h in hypotheses
            ],
        },

        "lead_rankings": {
            "total_leads": len(leads),
            "top_lead": {
                "description": top_lead.get("hypothesis", "N/A")[:120] + "..." if top_lead else None,
                "priority": top_lead.get("lead_priority") if top_lead else None,
                "score": top_lead.get("score") if top_lead else None,
                "top_reasoning": (top_lead.get("reasoning", [])[:3] if top_lead else []),
            },
            "all_leads": [
                {
                    "priority": l["lead_priority"],
                    "score": l["score"],
                    "summary": l.get("hypothesis", "")[:100] + "...",
                }
                for l in leads
            ],
        },

        "timeline_overview": {
            "total_events": len(timeline),
            "critical_events": [
                {
                    "date": ev["date"],
                    "event": ev["event"],
                    "significance": ev["significance"],
                    "source": ev.get("source"),
                }
                for ev in critical_events[:5]
            ],
            "date_range": {
                "earliest": timeline[0]["date"] if timeline else None,
                "latest": timeline[-1]["date"] if timeline else None,
            },
        },

        "cross_case_connections": {
            "total_links": len(cross_case_links),
            "significance": "HIGH" if cross_case_links else "NONE",
            "linked_entities": cross_case_links[:8],
            "note": (
                f"This case shares {len(cross_case_links)} entity connections with other registered investigations. "
                "These cross-case links may indicate a larger organized criminal network."
                if cross_case_links else
                "No cross-case entity links detected at this time."
            ),
        },

        "investigator_assessment": {
            "template": "Investigator notes to be added after reviewing the above intelligence summary.",
            "recommended_next_steps": [
                f"Verify top hypothesis: '{top_hypothesis['description'][:80]}...'" if top_hypothesis else "Generate hypotheses",
                f"Pursue HIGH priority lead (score: {top_lead['score']}/100)" if top_lead and top_lead.get("lead_priority") == "HIGH" else "Review MEDIUM priority leads",
                f"Investigate {len(cross_case_links)} cross-case entity links" if cross_case_links else "Expand entity extraction to find cross-case connections",
                "Review critical timeline events for witness corroboration",
                "Submit entity resolution requests for alias matches",
            ],
            "caution": "All hypotheses require investigator verification. This system provides reasoning support only — the investigating officer is the final decision-maker.",
        },
    }

    return report


@router.get("/{case_id}/executive-summary", response_model=Dict[str, Any])
async def get_executive_summary(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Condensed single-page executive summary for senior officer briefing."""
    cases = get_mock_cases()
    case = next((c for c in cases if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    entities = get_mock_entities(case_id)
    hypotheses = hypothesis_engine_service.generate_competing_hypotheses(case_id)
    leads = evidence_ranker_service.rank_case_leads(case_id)
    timeline = get_mock_timeline(case_id)

    top_hypothesis = hypotheses[0] if hypotheses else None
    top_lead = leads[0] if leads else None

    return {
        "case_number": case["case_number"],
        "title": case["title"],
        "status": case["status"],
        "priority": case["priority"],
        "location": case["location"],
        "entity_count": len(entities),
        "primary_suspect": next(
            (e["name"] for e in entities if e["type"] == "Person"), "Unknown"
        ),
        "key_finding": top_hypothesis["description"][:200] + "..." if top_hypothesis and len(top_hypothesis["description"]) > 200 else (top_hypothesis["description"] if top_hypothesis else "Analysis pending"),
        "confidence": top_hypothesis.get("final_score", 0) if top_hypothesis else 0,
        "lead_priority": top_lead.get("lead_priority", "LOW") if top_lead else "LOW",
        "lead_score": top_lead.get("score", 0) if top_lead else 0,
        "critical_event_count": len([e for e in timeline if e.get("significance") == "Critical"]),
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }
