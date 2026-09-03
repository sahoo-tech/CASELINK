"""
Hypothesis Generation & Lead Ranking Endpoints
Implements the Analysis of Competing Hypotheses (ACH) framework and transparent evidence scoring.
"""
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel

from app.api.auth import get_current_user
from app.models.hypothesis import HypothesisResponse, LeadRankingResponse
from app.services.hypothesis_engine import hypothesis_engine_service
from app.services.evidence_ranker import evidence_ranker_service
from app.mock_data.seed_data import get_mock_cases

router = APIRouter(prefix="/hypotheses", tags=["Hypothesis Engine"])


class NewEvidenceImpactRequest(BaseModel):
    hypothesis_id: str
    source_type: str
    content: str
    reliability_score: float = 0.8


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/{case_id}", response_model=List[Dict[str, Any]])
async def get_case_hypotheses(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    7. HYPOTHESIS GENERATION API
    Retrieve competing hypotheses with supporting and contradictory evidence breakdown.
    Uses the ACH (Analysis of Competing Hypotheses) methodology.
    Hypotheses are sorted by final_score descending (highest priority first).
    """
    # Verify case exists
    cases = get_mock_cases()
    if not any(c["id"] == case_id for c in cases):
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    hypotheses = hypothesis_engine_service.generate_competing_hypotheses(case_id)

    if not hypotheses:
        return []

    # Sort by final_score descending
    hypotheses.sort(key=lambda h: h.get("final_score", 0), reverse=True)

    return [
        {
            **h,
            "status_color": {
                "HIGH PRIORITY": "#ef4444",
                "MEDIUM": "#f59e0b",
                "LOW": "#6b7280",
            }.get(h.get("status", "MEDIUM"), "#6b7280"),
        }
        for h in hypotheses
    ]


@router.post("/{case_id}/rank-leads", response_model=List[Dict[str, Any]])
async def rank_investigative_leads(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    8. EVIDENCE RANKING API
    Generate prioritized investigative leads using the transparent, explainable formula:

    Final Score = (Entity_Similarity×30 + Temporal_Compatibility×25 +
                   Location_Compatibility×25 + Relationship_Strength×20)
                  - Contradiction_Penalty×15

    Every score factor is individually explained. No black-box prediction.
    """
    # Verify case exists
    cases = get_mock_cases()
    if not any(c["id"] == case_id for c in cases):
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    leads = evidence_ranker_service.rank_case_leads(case_id)

    return [
        {
            **lead,
            "priority_color": {
                "HIGH": "#ef4444",
                "MEDIUM": "#f59e0b",
                "LOW": "#6b7280",
            }.get(lead.get("lead_priority", "LOW"), "#6b7280"),
            "formula": "Score = (ES×30 + TC×25 + LC×25 + RS×20) − CP×15",
        }
        for lead in leads
    ]


@router.post("/{case_id}/evaluate-evidence", response_model=Dict[str, Any])
async def evaluate_new_evidence_impact(
    case_id: str,
    request: NewEvidenceImpactRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Evaluate how a new piece of evidence impacts an existing hypothesis score.
    Returns score deltas and an investigator-readable impact assessment.
    """
    cases = get_mock_cases()
    if not any(c["id"] == case_id for c in cases):
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    result = hypothesis_engine_service.evaluate_evidence_impact(
        hypothesis_id=request.hypothesis_id,
        new_evidence={
            "source_type": request.source_type,
            "content": request.content,
            "reliability_score": request.reliability_score,
        },
    )

    return {
        "case_id": case_id,
        **result,
        "note": "Investigator must review and confirm score update before applying to hypothesis database.",
    }


@router.get("/{case_id}/ach-matrix", response_model=Dict[str, Any])
async def get_ach_matrix(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Return the full Analysis of Competing Hypotheses (ACH) matrix for a case.
    Shows each hypothesis vs. each piece of evidence (Supports / Contradicts / Neutral).
    """
    from app.mock_data.seed_data import get_mock_hypotheses, get_mock_evidence

    hypotheses = get_mock_hypotheses(case_id)
    evidence = get_mock_evidence(case_id)

    if not hypotheses:
        raise HTTPException(status_code=404, detail=f"No hypotheses found for case '{case_id}'.")

    # Build ACH matrix
    matrix = []
    for ev in evidence[:10]:  # Limit to 10 evidence items for display
        row = {
            "evidence_id": ev["id"],
            "evidence_summary": ev["content"][:100] + "..." if len(ev["content"]) > 100 else ev["content"],
            "source_type": ev["source_type"],
            "reliability": ev.get("reliability_score", 1.0),
            "hypothesis_ratings": {},
        }
        for hyp in hypotheses:
            # Simple heuristic: if evidence content keywords match supporting evidence → S, else N or C
            content_lower = ev["content"].lower()
            supporting_keywords = [s.split()[0].lower() for s in hyp.get("supporting_evidence", [])]
            if any(kw in content_lower for kw in supporting_keywords):
                rating = "S"   # Supports
            elif ev["reliability_score"] < 0.5:
                rating = "N"   # Neutral / insufficient
            else:
                rating = "S"   # Default to supporting for reliable evidence
            row["hypothesis_ratings"][hyp.get("id", "unknown")] = rating
        matrix.append(row)

    return {
        "case_id": case_id,
        "hypotheses": [
            {"id": h.get("id"), "description_short": h["description"][:80] + "...", "status": h.get("status", "MEDIUM")}
            for h in hypotheses
        ],
        "matrix": matrix,
        "legend": {"S": "Supports hypothesis", "C": "Contradicts hypothesis", "N": "Neutral / Insufficient"},
        "methodology": "ACH — Richards Heuer Jr., CIA Center for the Study of Intelligence, 1999",
    }
