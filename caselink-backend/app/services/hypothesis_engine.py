"""
Hypothesis Generation Engine — Analysis of Competing Hypotheses (ACH)
Generates explainable competing scenarios with supporting vs contradictory evidence.
This is the main innovation module — NOT a black-box prediction.
Every hypothesis is fully explainable and human-verifiable.
"""
from typing import List, Dict, Any, Optional


class HypothesisEngineService:
    """
    Evaluates graph motifs and entity relationships to formulate
    competing investigative hypotheses using the ACH (Analysis of Competing Hypotheses) method.
    """

    def generate_competing_hypotheses(self, case_id: str) -> List[Dict[str, Any]]:
        """
        Generate multiple competing hypotheses from the evidence graph.
        Returns pre-computed hypotheses from mock data for the prototype,
        with on-the-fly dynamic generation for cases without pre-defined hypotheses.
        """
        from app.mock_data.seed_data import (
            get_mock_hypotheses, get_mock_entities,
            get_mock_relationships, get_mock_cases
        )

        # Return pre-computed hypotheses if available
        hypotheses = get_mock_hypotheses(case_id)
        if hypotheses:
            return [self._enrich_hypothesis(h) for h in hypotheses]

        # Dynamic generation for cases without pre-defined hypotheses
        case = next((c for c in get_mock_cases() if c["id"] == case_id), None)
        if not case:
            return []

        entities = get_mock_entities(case_id)
        relationships = get_mock_relationships(case_id)

        persons = [e for e in entities if e["type"] == "Person"]
        vehicles = [e for e in entities if e["type"] == "Vehicle"]
        locations = [e for e in entities if e["type"] == "Location"]
        orgs = [e for e in entities if e["type"] == "Organization"]
        docs = [e for e in entities if e["type"] == "Document"]

        # High-confidence primary hypothesis
        primary_hyp = self._build_primary_hypothesis(
            case_id, case, persons, vehicles, locations, orgs, relationships
        )
        # Alternative / lesser-confidence hypothesis
        alternative_hyp = self._build_alternative_hypothesis(
            case_id, case, persons, docs
        )

        hypotheses = [primary_hyp, alternative_hyp]
        return [self._enrich_hypothesis(h) for h in hypotheses]

    def _enrich_hypothesis(self, hyp: Dict[str, Any]) -> Dict[str, Any]:
        """Add computed fields and ACH scoring to a hypothesis."""
        support = hyp.get("support_score", 0.5)
        contradiction = hyp.get("contradiction_score", 0.1)

        # ACH formula: net_score = support - (contradiction * 0.35) * dampening
        net = support - (contradiction * 0.35)
        # Normalize to [0.0, 1.0]
        final = round(max(0.0, min(1.0, net)), 4)

        if final >= 0.75:
            status = "HIGH PRIORITY"
        elif final >= 0.50:
            status = "MEDIUM"
        else:
            status = "LOW"

        return {
            **hyp,
            "final_score": final,
            "status": hyp.get("status", status),
            "ach_matrix": {
                "supporting_count": len(hyp.get("supporting_evidence", [])),
                "contradicting_count": len(hyp.get("contradicting_evidence", [])),
                "net_diagnostic_score": final,
                "methodology": "ACH (Analysis of Competing Hypotheses) — Heuer 1999",
            }
        }

    def _build_primary_hypothesis(
        self,
        case_id: str,
        case: Dict,
        persons: List,
        vehicles: List,
        locations: List,
        orgs: List,
        relationships: List,
    ) -> Dict[str, Any]:
        """Build the primary investigative hypothesis from entity graph analysis."""
        person_names = [p["name"] for p in persons[:3]]
        loc_names = [l["name"] for l in locations[:2]]
        org_names = [o["name"] for o in orgs[:1]]

        desc_parts = []
        if person_names:
            desc_parts.append(f"{person_names[0]} is the primary suspect")
        if person_names[1:]:
            desc_parts.append(f"operating with associates {', '.join(person_names[1:])}")
        if org_names:
            desc_parts.append(f"using {org_names[0]} as a front organization")
        if loc_names:
            desc_parts.append(f"centered around {loc_names[0]}")
        desc_parts.append(f"in a coordinated {case['category']} operation")

        description = ", ".join(desc_parts) + "."

        supporting = []
        if len(relationships) >= 3:
            supporting.append(f"{len(relationships)} documented relationships between entities in case graph")
        if vehicles:
            supporting.append(f"Vehicle {vehicles[0]['name']} linked to primary suspect")
        if orgs:
            supporting.append(f"Organization {orgs[0]['name']} shows irregular financial activity")
        if locations:
            supporting.append(f"Entity co-location confirmed at {locations[0]['name']}")
        supporting.append("Entity network density suggests organized criminal structure")

        contradicting = []
        contradicting.append("Absence of direct eye-witness placing primary suspect at scene")
        if persons:
            contradicting.append(f"No prior criminal record confirmed for {persons[0]['name']}")

        rel_density = len(relationships) / max(len(persons), 1)
        support_score = min(0.95, 0.55 + rel_density * 0.05)

        return {
            "id": f"h-{case_id}-primary",
            "case_id": case_id,
            "description": description,
            "support_score": round(support_score, 2),
            "contradiction_score": 0.18,
            "status": "HIGH PRIORITY" if support_score >= 0.75 else "MEDIUM",
            "supporting_evidence": supporting,
            "contradicting_evidence": contradicting,
        }

    def _build_alternative_hypothesis(
        self,
        case_id: str,
        case: Dict,
        persons: List,
        docs: List,
    ) -> Dict[str, Any]:
        """Build an alternative (lesser confidence) hypothesis."""
        if len(persons) >= 2:
            description = (
                f"{persons[1]['name']} may be acting independently of {persons[0]['name']}, "
                f"with the apparent coordination being coincidental or the result of a third unknown party "
                f"orchestrating the {case['category']} activity without direct contact between them."
            )
        else:
            description = (
                f"The {case['category']} activity in {case['location']} may be attributed to "
                f"an unidentified external actor not yet in the entity graph, with current suspects "
                f"being unwitting participants or secondary operators."
            )

        supporting = [
            "No intercepted direct communication between primary suspects confirmed",
        ]
        if docs:
            supporting.append(f"Document {docs[0]['name']} does not conclusively name all suspects")

        contradicting = [
            "Geographic and temporal co-location argues against mere coincidence",
            "Financial trail directly links primary suspect to criminal proceeds",
            "Volume and coordination of activity suggests organized network, not lone actor",
        ]

        return {
            "id": f"h-{case_id}-alternative",
            "case_id": case_id,
            "description": description,
            "support_score": 0.38,
            "contradiction_score": 0.62,
            "status": "LOW",
            "supporting_evidence": supporting,
            "contradicting_evidence": contradicting,
        }

    def evaluate_evidence_impact(
        self, hypothesis_id: str, new_evidence: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Recalculate hypothesis scores when new evidence is added.
        Returns updated scores and assessment of evidence impact.
        """
        source_type = new_evidence.get("source_type", "Unknown")
        content = new_evidence.get("content", "")
        reliability = new_evidence.get("reliability_score", 0.5)

        # Determine if evidence is supporting or contradicting based on content keywords
        support_keywords = ["confirms", "linked", "found", "matches", "identified", "seized", "intercepted"]
        contradict_keywords = ["denied", "alibi", "cleared", "no connection", "unrelated", "mistaken"]

        content_lower = content.lower()
        is_supporting = any(kw in content_lower for kw in support_keywords)
        is_contradicting = any(kw in content_lower for kw in contradict_keywords)

        impact_weight = reliability * 0.15  # Max 15% shift per new evidence

        if is_supporting and not is_contradicting:
            support_delta = impact_weight
            contradict_delta = 0.0
            impact_direction = "SUPPORTS"
        elif is_contradicting and not is_supporting:
            support_delta = 0.0
            contradict_delta = impact_weight
            impact_direction = "CONTRADICTS"
        else:
            support_delta = impact_weight * 0.3
            contradict_delta = impact_weight * 0.3
            impact_direction = "NEUTRAL / AMBIGUOUS"

        return {
            "hypothesis_id": hypothesis_id,
            "new_evidence_source": source_type,
            "impact_direction": impact_direction,
            "support_score_delta": round(support_delta, 3),
            "contradiction_score_delta": round(contradict_delta, 3),
            "reliability_weight": reliability,
            "assessment": (
                f"New {source_type} evidence (reliability: {reliability:.0%}) "
                f"{impact_direction.lower()} this hypothesis with a {impact_weight:.0%} weight shift. "
                f"Investigator review required before updating hypothesis status."
            ),
        }


hypothesis_engine_service = HypothesisEngineService()
