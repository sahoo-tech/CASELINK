"""
Entity Resolution Engine
Detects whether two records refer to the same real-world entity.
Uses string similarity + optional semantic embeddings.
IMPORTANT: Never automatically merges — always flags as "Requires Verification".
"""
import difflib
from typing import List, Dict, Any, Optional, Tuple

# ─── Lazy-loaded sentence-transformers ───────────────────────────────────────
_encoder = None


def _get_encoder():
    """Lazily load sentence-transformer model with graceful fallback."""
    global _encoder
    if _encoder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _encoder = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _encoder = None  # Fallback to string-only mode
    return _encoder


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


class EntityResolutionService:
    """
    Disambiguates and matches entities using:
    1. SequenceMatcher ratio (character overlap)
    2. Token sort ratio (handles reordered names like "Raj Kumar" vs "Kumar Raj")
    3. Levenshtein similarity
    4. Cosine similarity over sentence embeddings (when model available)
    """

    SIMILARITY_THRESHOLD = 0.55   # Candidates below this are not returned
    HIGH_CONFIDENCE = 0.85        # Above this → "Probable Match"
    MID_CONFIDENCE = 0.65         # Above this → "Possible Match"

    def calculate_string_similarity(self, name_a: str, name_b: str) -> float:
        """
        Compute blended string similarity using SequenceMatcher + token sort + Levenshtein.
        Returns float in [0.0, 1.0].
        """
        a, b = name_a.lower().strip(), name_b.lower().strip()

        # 1. SequenceMatcher ratio (character-level overlap)
        seq_ratio = difflib.SequenceMatcher(None, a, b).ratio()

        # 2. Token-sort ratio (handles "Raj Kumar" vs "Kumar Raj")
        tokens_a = " ".join(sorted(a.split()))
        tokens_b = " ".join(sorted(b.split()))
        token_sort_ratio = difflib.SequenceMatcher(None, tokens_a, tokens_b).ratio()

        # 3. Levenshtein normalized similarity
        max_len = max(len(a), len(b), 1)
        lev_sim = 1.0 - _levenshtein_distance(a, b) / max_len

        # Weighted blend (token-sort most important for names)
        blended = (0.30 * seq_ratio) + (0.50 * token_sort_ratio) + (0.20 * lev_sim)
        return round(blended, 4)

    def calculate_embedding_similarity(self, name_a: str, name_b: str) -> Optional[float]:
        """
        Compute cosine similarity over dense sentence embeddings.
        Returns float in [0.0, 1.0] or None if model is unavailable.
        """
        encoder = _get_encoder()
        if encoder is None:
            return None
        try:
            import numpy as np
            embeddings = encoder.encode([name_a, name_b], convert_to_numpy=True)
            # Cosine similarity
            a_norm = embeddings[0] / (np.linalg.norm(embeddings[0]) + 1e-10)
            b_norm = embeddings[1] / (np.linalg.norm(embeddings[1]) + 1e-10)
            cos_sim = float(np.dot(a_norm, b_norm))
            return round(max(0.0, cos_sim), 4)
        except Exception:
            return None

    def _build_rationale(
        self,
        query: str,
        candidate: str,
        str_sim: float,
        emb_sim: Optional[float],
        final_score: float,
    ) -> Tuple[str, List[str]]:
        """Build a human-readable confidence label and rationale list."""
        rationale = []

        if str_sim >= 0.90:
            rationale.append(f"Very high character-level overlap with '{candidate}' (similarity: {str_sim:.0%})")
        elif str_sim >= 0.70:
            rationale.append(f"High string similarity with '{candidate}' (similarity: {str_sim:.0%})")
        elif str_sim >= 0.50:
            rationale.append(f"Moderate name resemblance (similarity: {str_sim:.0%})")
        else:
            rationale.append(f"Low string similarity (similarity: {str_sim:.0%})")

        # Initials check: "R. Kumar" → "Raj Kumar"
        q_parts = query.lower().split()
        c_parts = candidate.lower().split()
        if len(q_parts) >= 1 and len(c_parts) >= 2:
            if q_parts[0].rstrip(".") == c_parts[0][0]:
                rationale.append("First-name initial matches expanded name")

        if emb_sim is not None:
            if emb_sim >= 0.80:
                rationale.append(f"Semantic embedding similarity is high ({emb_sim:.0%})")
            elif emb_sim >= 0.60:
                rationale.append(f"Moderate semantic similarity ({emb_sim:.0%})")
            else:
                rationale.append(f"Low semantic embedding similarity ({emb_sim:.0%})")
        else:
            rationale.append("Semantic model unavailable — string analysis only")

        if final_score >= self.HIGH_CONFIDENCE:
            label = "Probable Match"
        elif final_score >= self.MID_CONFIDENCE:
            label = "Possible Match"
        else:
            label = "Low Probability Match"

        return label, rationale

    def resolve_candidates(
        self, query_entity: str, candidate_entities: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Evaluate each candidate against the query entity.
        Always marks as 'Requires Verification' — never auto-merges.
        """
        results = []

        for candidate in candidate_entities:
            if candidate.strip().lower() == query_entity.strip().lower():
                # Exact match
                results.append({
                    "matched_entity": candidate,
                    "confidence": 1.0,
                    "status": "Requires Verification",
                    "match_label": "Exact Match",
                    "rationale": ["Exact string match detected"],
                    "scores": {"string_similarity": 1.0, "embedding_similarity": None},
                })
                continue

            str_sim = self.calculate_string_similarity(query_entity, candidate)
            emb_sim = self.calculate_embedding_similarity(query_entity, candidate)

            # Weighted final score
            if emb_sim is not None:
                final_score = 0.45 * str_sim + 0.55 * emb_sim
            else:
                final_score = str_sim

            if final_score < self.SIMILARITY_THRESHOLD:
                continue  # Skip unlikely matches

            match_label, rationale = self._build_rationale(
                query_entity, candidate, str_sim, emb_sim, final_score
            )

            results.append({
                "matched_entity": candidate,
                "confidence": round(final_score, 4),
                "status": "Requires Verification",    # NEVER auto-merge
                "match_label": match_label,
                "rationale": rationale,
                "scores": {
                    "string_similarity": str_sim,
                    "embedding_similarity": emb_sim,
                },
            })

        # Sort by confidence descending
        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results


entity_resolution_service = EntityResolutionService()
