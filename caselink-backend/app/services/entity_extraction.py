"""
Entity Extraction Engine (NLP Pipeline)
Extracts Person, Location, Vehicle, Organization, Event entities from investigation text.
Uses spaCy for NER with regex fallback for Indian-specific patterns.
"""
import re
from typing import List, Dict, Any

# ─── Lazy-loaded NLP model ────────────────────────────────────────────────────
_nlp = None


def _get_nlp():
    """Lazily load spaCy model with graceful fallback."""
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("en_core_web_sm")
        except Exception:
            _nlp = None  # Fallback to regex-only mode
    return _nlp


# ─── Regex Patterns (India-specific) ─────────────────────────────────────────
# Indian vehicle registration: 2 letters + 2 digits + 1-2 letters + 4 digits
VEHICLE_PLATE_RE = re.compile(r"\b[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}\b")
# Indian phone numbers
PHONE_RE = re.compile(r"(?:\+91[-\s]?|0)?[6-9]\d{9}\b")
# Dates (various formats)
DATE_RE = re.compile(r"\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b", re.IGNORECASE)
# Currency amounts in crore/lakh
AMOUNT_RE = re.compile(r"₹\s*[\d,]+(?:\.\d+)?\s*(?:crore|lakh|cr|L)?|INR\s*[\d,]+", re.IGNORECASE)
# FIR / case references
FIR_RE = re.compile(r"\bFIR\s+(?:No\.?\s*)?\w+[\/\-]\d+[\/\-]\d+\b|\bCR[-\s]?\d+[\/\-]\d+\b", re.IGNORECASE)
# CIN number pattern
CIN_RE = re.compile(r"\b[UL]\d{5}[A-Z]{2}\d{4}(?:PTC|PLC|FTC|DFC|FLC|AAA|AAB|AAC|AAD|AAE|GOI|MHN|NPL|OTC|SGC|ULL)\d{6}\b")


class EntityExtractionService:
    """NLP Entity Extraction pipeline using spaCy and India-specific regex patterns."""

    # spaCy NER label → CASELINK entity type mapping
    SPACY_TYPE_MAP = {
        "PERSON": "Person",
        "ORG": "Organization",
        "GPE": "Location",          # Geo-political entity (city, state, country)
        "LOC": "Location",          # Physical location
        "FAC": "Location",          # Facility
        "EVENT": "Event",
        "PRODUCT": "Document",
    }

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract named entities from raw FIR narrative or witness transcript.
        Returns list of dicts with: name, type, confidence, span
        """
        results: List[Dict[str, Any]] = []
        seen_names = set()

        nlp = _get_nlp()

        # ── spaCy NER ──────────────────────────────────────────────────────────
        if nlp is not None:
            doc = nlp(text)
            for ent in doc.ents:
                entity_type = self.SPACY_TYPE_MAP.get(ent.label_, None)
                if entity_type is None:
                    continue
                name = ent.text.strip()
                if name in seen_names:
                    continue
                seen_names.add(name)
                results.append({
                    "name": name,
                    "type": entity_type,
                    "confidence": round(0.70 + min(len(name) / 50, 0.25), 2),
                    "span": [ent.start_char, ent.end_char],
                    "extraction_method": "spacy_ner",
                })
        else:
            # ── Fallback: basic capitalized word detection for persons ──────────
            person_re = re.compile(r"\b([A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+)\b")
            for match in person_re.finditer(text):
                name = match.group(1).strip()
                if name not in seen_names and len(name.split()) >= 2:
                    seen_names.add(name)
                    results.append({
                        "name": name,
                        "type": "Person",
                        "confidence": 0.65,
                        "span": [match.start(), match.end()],
                        "extraction_method": "regex_fallback",
                    })

        # ── Indian vehicle plates ──────────────────────────────────────────────
        vehicles = self.extract_vehicles(text)
        for v in vehicles:
            if v["name"] not in seen_names:
                seen_names.add(v["name"])
                results.append(v)

        # ── Phone numbers ──────────────────────────────────────────────────────
        for match in PHONE_RE.finditer(text):
            phone = match.group(0).strip()
            if phone not in seen_names:
                seen_names.add(phone)
                results.append({
                    "name": phone,
                    "type": "Contact",
                    "confidence": 0.95,
                    "span": [match.start(), match.end()],
                    "extraction_method": "regex_phone",
                })

        # ── Currency amounts ───────────────────────────────────────────────────
        for match in AMOUNT_RE.finditer(text):
            amount = match.group(0).strip()
            if amount not in seen_names:
                seen_names.add(amount)
                results.append({
                    "name": amount,
                    "type": "FinancialAmount",
                    "confidence": 0.97,
                    "span": [match.start(), match.end()],
                    "extraction_method": "regex_amount",
                })

        # ── FIR references ─────────────────────────────────────────────────────
        for match in FIR_RE.finditer(text):
            fir = match.group(0).strip()
            if fir not in seen_names:
                seen_names.add(fir)
                results.append({
                    "name": fir,
                    "type": "Document",
                    "confidence": 0.98,
                    "span": [match.start(), match.end()],
                    "extraction_method": "regex_fir",
                })

        return results

    def extract_vehicles(self, text: str) -> List[Dict[str, Any]]:
        """Extract Indian vehicle registration numbers (e.g. MH12AB4582)."""
        results = []
        for match in VEHICLE_PLATE_RE.finditer(text):
            plate = match.group(0).strip()
            results.append({
                "name": plate,
                "type": "Vehicle",
                "confidence": 0.97,
                "span": [match.start(), match.end()],
                "extraction_method": "regex_vehicle",
                "extra_metadata": {"state_code": plate[:2]},
            })
        return results

    def extract_dates(self, text: str) -> List[Dict[str, Any]]:
        """Extract date mentions from text."""
        results = []
        for match in DATE_RE.finditer(text):
            results.append({
                "name": match.group(0).strip(),
                "type": "Date",
                "confidence": 0.90,
                "span": [match.start(), match.end()],
                "extraction_method": "regex_date",
            })
        return results


entity_extraction_service = EntityExtractionService()
