"""
Evidence Ranking Engine
Calculates transparent, explainable lead priority scores.
Formula: Final Score = (Entity_Sim×30 + Temporal_Compat×25 + Location_Compat×25 + Rel_Strength×20) - Contradiction_Penalty×15
No black-box prediction — every score factor is explained.
"""
from typing import Dict, Any, List, Optional


# Priority thresholds (out of 100)
HIGH_THRESHOLD = 70
MEDIUM_THRESHOLD = 45


class EvidenceRankerService:
    """
    Computes transparent lead priority scores without black-box predictive policing.
    All score factors are individually explained and auditable.
    """

    # Component weights (must sum to 100)
    WEIGHTS = {
        "entity_similarity":      30,
        "temporal_compatibility": 25,
        "location_compatibility": 25,
        "relationship_strength":  20,
    }
    CONTRADICTION_PENALTY_WEIGHT = 15  # Max deduction

    def calculate_lead_score(
        self,
        entity_similarity: float,        # 0.0–1.0
        temporal_compatibility: float,   # 0.0–1.0
        location_compatibility: float,   # 0.0–1.0
        relationship_strength: float,    # 0.0–1.0
        contradiction_penalty: float,    # 0.0–1.0  (higher = more contradictions)
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Compute lead priority with a fully explainable additive formula.

        Returns:
            lead_priority: HIGH | MEDIUM | LOW
            score: 0–100 integer
            reasoning: List[str] explaining why each factor contributes
            scores_breakdown: Individual component scores
        """
        # Clamp all inputs to [0, 1]
        es = max(0.0, min(1.0, entity_similarity))
        tc = max(0.0, min(1.0, temporal_compatibility))
        lc = max(0.0, min(1.0, location_compatibility))
        rs = max(0.0, min(1.0, relationship_strength))
        cp = max(0.0, min(1.0, contradiction_penalty))

        # Weighted additive score
        raw_score = (
            es * self.WEIGHTS["entity_similarity"]
            + tc * self.WEIGHTS["temporal_compatibility"]
            + lc * self.WEIGHTS["location_compatibility"]
            + rs * self.WEIGHTS["relationship_strength"]
        )

        # Subtract contradiction penalty
        penalty = cp * self.CONTRADICTION_PENALTY_WEIGHT
        final_score = max(0.0, raw_score - penalty)
        final_score_int = round(final_score)

        # Priority classification
        if final_score_int >= HIGH_THRESHOLD:
            lead_priority = "HIGH"
        elif final_score_int >= MEDIUM_THRESHOLD:
            lead_priority = "MEDIUM"
        else:
            lead_priority = "LOW"

        # Build human-readable reasoning
        reasoning = self._build_reasoning(es, tc, lc, rs, cp, penalty, context or {})

        return {
            "lead_priority": lead_priority,
            "score": final_score_int,
            "raw_score_before_penalty": round(raw_score),
            "contradiction_penalty_applied": round(penalty, 1),
            "reasoning": reasoning,
            "scores_breakdown": {
                "entity_similarity": round(es * self.WEIGHTS["entity_similarity"], 1),
                "temporal_compatibility": round(tc * self.WEIGHTS["temporal_compatibility"], 1),
                "location_compatibility": round(lc * self.WEIGHTS["location_compatibility"], 1),
                "relationship_strength": round(rs * self.WEIGHTS["relationship_strength"], 1),
                "contradiction_deduction": -round(penalty, 1),
            },
        }

    def _build_reasoning(
        self,
        es: float, tc: float, lc: float, rs: float, cp: float,
        penalty: float,
        context: Dict[str, Any],
    ) -> List[str]:
        """Generate per-factor explanation strings."""
        reasoning = []

        # Entity similarity
        if es >= 0.85:
            reasoning.append(f"Entity match is strong ({es:.0%}) — vehicle plate, name, or ID directly matches.")
        elif es >= 0.65:
            reasoning.append(f"Entity similarity is moderate ({es:.0%}) — partial alias or alias-name match.")
        elif es >= 0.40:
            reasoning.append(f"Entity similarity is weak ({es:.0%}) — based on circumstantial metadata overlap.")
        else:
            reasoning.append(f"Low entity similarity ({es:.0%}) — entity may not be the same individual.")

        # Temporal compatibility
        if tc >= 0.85:
            reasoning.append(f"Timeline is highly consistent ({tc:.0%}) — events align chronologically with no gaps.")
        elif tc >= 0.60:
            reasoning.append(f"Timeline partially consistent ({tc:.0%}) — minor temporal gaps exist but movement is feasible.")
        elif tc >= 0.35:
            reasoning.append(f"Temporal compatibility is marginal ({tc:.0%}) — tight time windows require further verification.")
        else:
            reasoning.append(f"Timeline largely inconsistent ({tc:.0%}) — alibi or timing discrepancy noted.")

        # Location compatibility
        if lc >= 0.85:
            reasoning.append(f"Location overlap confirmed ({lc:.0%}) — entity detected at or near crime scene location.")
        elif lc >= 0.60:
            reasoning.append(f"Locations compatible ({lc:.0%}) — entity within regional proximity of incident site.")
        elif lc >= 0.35:
            reasoning.append(f"Marginal location link ({lc:.0%}) — general area match but no precise co-location evidence.")
        else:
            reasoning.append(f"Poor location compatibility ({lc:.0%}) — entity appears to have been elsewhere.")

        # Relationship strength
        if rs >= 0.85:
            reasoning.append(f"Strong relationship network ({rs:.0%}) — multiple direct links to key suspects and locations.")
        elif rs >= 0.60:
            reasoning.append(f"Moderate relationship web ({rs:.0%}) — 2nd-degree connections to core network.")
        elif rs >= 0.35:
            reasoning.append(f"Thin relationship links ({rs:.0%}) — only indirect or speculative connections found.")
        else:
            reasoning.append(f"Weak relationship evidence ({rs:.0%}) — insufficient network links established.")

        # Contradiction penalty
        if penalty > 8:
            reasoning.append(f"⚠ Heavy contradiction deduction (-{penalty:.1f} pts) — significant disconfirming evidence present. Hypothesis needs re-evaluation.")
        elif penalty > 4:
            reasoning.append(f"Moderate contradictions found (-{penalty:.1f} pts) — some evidence argues against this lead.")
        elif penalty > 0:
            reasoning.append(f"Minor contradictions noted (-{penalty:.1f} pts) — minor inconsistencies that do not overturn the lead.")

        # Context-specific additions
        if context.get("cross_case"):
            reasoning.append("🔗 Cross-case link detected — entity appears in multiple independent investigations (high significance).")
        if context.get("vehicle_match"):
            reasoning.append("🚗 Vehicle registration cross-match confirmed across cases.")
        if context.get("financial_trail"):
            reasoning.append("💰 Financial transaction trail establishes pecuniary motive.")

        return reasoning

    def rank_case_leads(self, case_id: str) -> List[Dict[str, Any]]:
        """
        Generate a ranked list of investigative leads for a case
        using the pre-computed hypothesis scores from mock data.
        """
        from app.mock_data.seed_data import get_mock_hypotheses, get_mock_entities, get_mock_relationships

        hypotheses = get_mock_hypotheses(case_id)
        entities = get_mock_entities(case_id)
        relationships = get_mock_relationships(case_id)

        leads = []
        for i, hyp in enumerate(hypotheses):
            # Derive score components from hypothesis metadata
            es = min(1.0, hyp.get("support_score", 0.5) * 1.1)
            tc = min(1.0, (hyp.get("support_score", 0.5) + 0.05) * 0.95)
            lc = min(1.0, hyp.get("support_score", 0.5) * 1.05)
            rs = min(1.0, len(relationships) / max(len(entities) * 2, 1))
            cp = hyp.get("contradiction_score", 0.1)

            # Context flags
            context = {
                "cross_case": any("cross-case" in e.lower() or "SAME_VEHICLE" in e.upper() for e in hyp.get("supporting_evidence", [])),
                "vehicle_match": any("vehicle" in e.lower() for e in hyp.get("supporting_evidence", [])),
                "financial_trail": any("transfer" in e.lower() or "transaction" in e.lower() or "hawala" in e.lower() for e in hyp.get("supporting_evidence", [])),
            }

            lead_score = self.calculate_lead_score(es, tc, lc, rs, cp, context)

            leads.append({
                "hypothesis_id": hyp.get("id", f"h-{i}"),
                "hypothesis": hyp["description"],
                "lead_priority": lead_score["lead_priority"],
                "score": lead_score["score"],
                "reasoning": lead_score["reasoning"],
                "scores_breakdown": lead_score["scores_breakdown"],
                "supporting_evidence": hyp.get("supporting_evidence", []),
                "contradictions": hyp.get("contradicting_evidence", []),
                "status": hyp.get("status", "MEDIUM"),
            })

        # Sort by score descending
        leads.sort(key=lambda x: x["score"], reverse=True)
        return leads


evidence_ranker_service = EvidenceRankerService()
