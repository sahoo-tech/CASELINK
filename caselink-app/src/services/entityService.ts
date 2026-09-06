/**
 * Entity Intelligence Service for CASELINK Platform
 * Provides Live NLP Named Entity Recognition (NER), RTO vehicle detection,
 * and ACH Entity Disambiguation & Alias Resolution.
 * Includes intelligent local fallback engine when remote backend is in cold-start/offline.
 */

import { apiRequest } from './apiClient';
import type { Entity, EntityType } from '../data/mockData';

export interface ExtractedEntity {
  name: string;
  type: EntityType;
  confidence: number;
  span?: [number, number];
  extraction_method: string;
}

export interface ExtractionResult {
  case_id: string;
  source_type: string;
  input_length: number;
  source: 'backend_spacy' | 'client_nlp';
  entities: ExtractedEntity[];
  dates_detected: string[];
  extraction_summary: {
    total_entities: number;
    by_type: Record<string, number>;
    vehicles_found: number;
    dates_found: number;
  };
  next_step: string;
}

export interface ResolutionCandidateResult {
  matched_entity: string;
  confidence: number;
  status: 'High Confidence Match (Verify)' | 'Potential Alias (Investigate)' | 'Low Probability / Unrelated';
  statusColor: 'emerald' | 'amber' | 'slate';
  rationale: string[];
  source: 'backend' | 'client_ach';
  human_action_required: boolean;
}

// ─── Client-side High-Precision NLP & Regex Patterns (India Specialized) ───────────
const VEHICLE_PLATE_REGEX = /\b([A-Z]{2}\s*[-]?\s*\d{1,2}\s*[-]?\s*[A-Z]{1,3}\s*[-]?\s*\d{4})\b/gi;
const INDIAN_PHONE_REGEX = /\b(?:\+91[-\s]?|0)?[6-9]\d{9}\b/g;
const CURRENCY_REGEX = /(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?\s*(?:crore|lakh|cr|L)?/gi;
const DATE_REGEX = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi;

// Known location gazetteer for rapid Indian intelligence extraction
const KNOWN_LOCATIONS = [
  'Delhi', 'New Delhi', 'Mumbai', 'Dharavi', 'Dharavi Warehouse', 'Attari', 'Attari Border',
  'Amritsar', 'Kolkata', 'Chennai', 'Bengaluru', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Jammu',
  'Goa', 'Chandigarh', 'Coimbatore', 'Kochi', 'Surat', 'Guwahati', 'Bhubaneswar', 'Dehradun',
  'Bandra', 'Andheri', 'Connaught Place', 'Tihar', 'Rohini', 'Dwarka', 'Noida', 'Gurugram', 'Gurgaon'
];

// Known organizations & units
const KNOWN_ORGS = [
  'BSF', 'CBI', 'NIA', 'RAW', 'IB', 'ED', 'NCB', 'DRI', 'RTO', 'State Police',
  'Crime Branch', 'Special Cell', 'ATS', 'CID', 'Interpol', 'Hawala Syndicate', 'D-Company'
];

// Common Indian person first and last names for pattern matching
const INDIAN_SURNAMES = new Set([
  'kumar', 'sharma', 'mehta', 'singh', 'verma', 'das', 'rao', 'nair', 'patel', 'shah', 'gupta',
  'yadav', 'khan', 'ali', 'reddy', 'mishra', 'joshi', 'menon', 'bose', 'sen', 'roy', 'choudhury',
  'saxena', 'deshmukh', 'kulkarni', 'iyer', 'pillai', 'malhotra', 'kapoor', 'bhatia', 'khanna'
]);

/**
 * Client-Side NLP Named Entity Recognition Engine
 */
function extractEntitiesLocally(text: string, caseId: string = 'case-001'): ExtractionResult {
  const extracted: ExtractedEntity[] = [];
  const seen = new Set<string>();

  const addEntity = (name: string, type: EntityType, confidence: number, method: string) => {
    const cleanName = name.trim().replace(/^[,.:;\s]+|[,.:;\s]+$/g, '');
    const key = `${type.toLowerCase()}:${cleanName.toLowerCase()}`;
    if (!cleanName || cleanName.length < 2 || seen.has(key)) return;
    seen.add(key);
    extracted.push({
      name: cleanName,
      type,
      confidence: Math.round(confidence * 100) / 100,
      extraction_method: method,
    });
  };

  // 1. Vehicle Detection (Indian MoRTH RTO Formats)
  const vehicleMatches = text.match(VEHICLE_PLATE_REGEX) || [];
  for (const v of vehicleMatches) {
    const norm = v.replace(/[\s-]+/g, '').toUpperCase();
    addEntity(norm, 'Vehicle', 0.98, 'MoRTH RTO Registration Plate Regex');
  }

  // 2. Phone / Telecom Surveillance Identifiers
  const phoneMatches = text.match(INDIAN_PHONE_REGEX) || [];
  for (const p of phoneMatches) {
    addEntity(p, 'Document', 0.94, 'Telecom CDR Surveillance Pattern');
  }

  // 3. Financial Currency Transfers
  const currencyMatches = text.match(CURRENCY_REGEX) || [];
  for (const c of currencyMatches) {
    addEntity(c, 'Document', 0.92, 'Hawala / Banking Transaction Pattern');
  }

  // 4. Known Location Matcher
  for (const loc of KNOWN_LOCATIONS) {
    const locRegex = new RegExp(`\\b${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (locRegex.test(text)) {
      addEntity(loc, 'Location', 0.91, 'National Geospatial Gazetteer');
    }
  }

  // 5. Known Organizations Matcher
  for (const org of KNOWN_ORGS) {
    const orgRegex = new RegExp(`\\b${org.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (orgRegex.test(text)) {
      addEntity(org, 'Organization', 0.95, 'Federal Agency & Syndicate Registry');
    }
  }

  // 6. Person Name Extraction (Title/Capitalized Multi-word Pattern)
  const personPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  let match: RegExpExecArray | null;
  while ((match = personPattern.exec(text)) !== null) {
    const candidate = match[1];
    // Exclude if already recognized as a location or org
    const candidateLower = candidate.toLowerCase();
    const isLoc = KNOWN_LOCATIONS.some((l) => l.toLowerCase() === candidateLower);
    const isOrg = KNOWN_ORGS.some((o) => o.toLowerCase() === candidateLower);

    if (!isLoc && !isOrg) {
      const parts = candidate.split(/\s+/);
      const lastName = parts[parts.length - 1].toLowerCase();
      const hasIndianSurname = INDIAN_SURNAMES.has(lastName);
      const confidence = hasIndianSurname ? 0.95 : 0.85;
      addEntity(candidate, 'Person', confidence, 'Capitalized Multi-Token NER Pipeline');
    }
  }

  // 7. Dates
  const dates = text.match(DATE_REGEX) || [];

  // Summary calculation
  const byType: Record<string, number> = {};
  for (const ent of extracted) {
    byType[ent.type] = (byType[ent.type] || 0) + 1;
  }

  return {
    case_id: caseId,
    source_type: 'FIR Narrative / Surveillance Transcript',
    input_length: text.length,
    source: 'client_nlp',
    entities: extracted,
    dates_detected: dates,
    extraction_summary: {
      total_entities: extracted.length,
      by_type: byType,
      vehicles_found: vehicleMatches.length,
      dates_found: dates.length,
    },
    next_step: 'Extracted entities ingested. Ready for cross-case correlation or alias matching.',
  };
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(s1: string, s2: string): number {
  if (s1.length < s2.length) return levenshteinDistance(s2, s1);
  if (s2.length === 0) return s1.length;
  let prevRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
  for (let i = 0; i < s1.length; i++) {
    const currRow = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      const insertions = prevRow[j + 1] + 1;
      const deletions = currRow[j] + 1;
      const substitutions = prevRow[j] + (s1[i] !== s2[j] ? 1 : 0);
      currRow.push(Math.min(insertions, deletions, substitutions));
    }
    prevRow = currRow;
  }
  return prevRow[prevRow.length - 1];
}

/**
 * Character Sequence Overlap (Dice / Bigram coefficient)
 */
function sequenceSimilarity(s1: string, s2: string): number {
  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  if (a === b) return 1.0;
  if (a.length < 2 || b.length < 2) {
    return a === b ? 1.0 : 0.0;
  }

  const bigramsA = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bi = a.substring(i, i + 2);
    bigramsA.set(bi, (bigramsA.get(bi) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bi = b.substring(i, i + 2);
    const count = bigramsA.get(bi) || 0;
    if (count > 0) {
      bigramsA.set(bi, count - 1);
      intersection++;
    }
  }

  return (2.0 * intersection) / (a.length - 1 + b.length - 1);
}

/**
 * Client-Side ACH Entity Disambiguation & Alias Matching Engine
 */
function resolveCandidatesLocally(queryName: string, candidates: string[]): ResolutionCandidateResult[] {
  const qClean = queryName.trim().toLowerCase();
  const qTokens = qClean.split(/[\s,.-]+/).filter(Boolean);

  return candidates.map((cand) => {
    const cClean = cand.trim().toLowerCase();
    const cTokens = cClean.split(/[\s,.-]+/).filter(Boolean);

    let score = 0;
    const rationale: string[] = [];

    // 1. Exact Match
    if (qClean === cClean) {
      score = 1.0;
      rationale.push('Identical full string match (100% precision).');
    } else {
      // 2. Token Sort Overlap
      const qSorted = [...qTokens].sort().join(' ');
      const cSorted = [...cTokens].sort().join(' ');
      const tokenSortSim = sequenceSimilarity(qSorted, cSorted);

      // 3. Levenshtein Normalization
      const maxLen = Math.max(qClean.length, cClean.length, 1);
      const levDist = levenshteinDistance(qClean, cClean);
      const levSim = Math.max(0, 1.0 - levDist / maxLen);

      // 4. Initial Matching (e.g. "R. Kumar" vs "Raj Kumar")
      let initialBonus = 0;
      if (qTokens.length >= 2 && cTokens.length >= 2) {
        const qFirst = qTokens[0];
        const cFirst = cTokens[0];
        const qLast = qTokens[qTokens.length - 1];
        const cLast = cTokens[cTokens.length - 1];

        // Shared surname
        if (qLast === cLast) {
          rationale.push(`Shared surname token "${cLast.toUpperCase()}" matches with high weight.`);
          // Single character initial
          if (qFirst.length === 1 && cFirst.startsWith(qFirst)) {
            initialBonus = 0.35;
            rationale.push(`Query initial "${qFirst.toUpperCase()}." corresponds to given name "${cTokens[0]}".`);
          } else if (cFirst.length === 1 && qFirst.startsWith(cFirst)) {
            initialBonus = 0.35;
            rationale.push(`Candidate initial "${cFirst.toUpperCase()}." corresponds to query given name "${qTokens[0]}".`);
          }
        }
      }

      // 5. Common Diminutive / Prefix Match (e.g. Raj vs Rajesh)
      let prefixBonus = 0;
      if (qTokens[0] && cTokens[0] && (qTokens[0].startsWith(cTokens[0]) || cTokens[0].startsWith(qTokens[0]))) {
        prefixBonus = 0.15;
        rationale.push(`Given name prefix alignment between "${qTokens[0]}" and "${cTokens[0]}".`);
      }

      // Blend metrics
      const blended = 0.35 * tokenSortSim + 0.30 * levSim + initialBonus + prefixBonus;
      score = Math.min(0.98, Math.max(0.05, blended));

      rationale.push(`Token-sort & bi-gram sequence overlap computed at ${Math.round(tokenSortSim * 100)}%.`);
      rationale.push(`Normalized edit distance: ${levDist} character discrepancy.`);
    }

    // Determine Status
    let status: ResolutionCandidateResult['status'] = 'Low Probability / Unrelated';
    let statusColor: ResolutionCandidateResult['statusColor'] = 'slate';

    if (score >= 0.75) {
      status = 'High Confidence Match (Verify)';
      statusColor = 'emerald';
      rationale.push('HIGH PROBABILITY: Strong corroboration indicates shared real-world identity.');
    } else if (score >= 0.50) {
      status = 'Potential Alias (Investigate)';
      statusColor = 'amber';
      rationale.push('MEDIUM PROBABILITY: Substantial phonetic/character overlap warrants human investigator verification.');
    } else {
      status = 'Low Probability / Unrelated';
      statusColor = 'slate';
      rationale.push('LOW PROBABILITY: Significant phonological and lexical divergence.');
    }

    return {
      matched_entity: cand.trim(),
      confidence: Math.round(score * 100) / 100,
      status,
      statusColor,
      rationale,
      source: 'client_ach',
      human_action_required: true,
    };
  });
}

// ─── Exported Entity Service ────────────────────────────────────────────────
export const entityService = {
  /**
   * Extract Named Entities from narrative text using Live Backend with instant NLP fallback
   */
  extractEntities: async (text: string, caseId: string = 'case-001'): Promise<ExtractionResult> => {
    if (!text || !text.trim()) {
      return {
        case_id: caseId,
        source_type: 'FIR',
        input_length: 0,
        source: 'client_nlp',
        entities: [],
        dates_detected: [],
        extraction_summary: { total_entities: 0, by_type: {}, vehicles_found: 0, dates_found: 0 },
        next_step: 'Provide non-empty narrative text.',
      };
    }

    try {
      // Call backend with a responsive 2200ms timeout
      const res = await apiRequest<any>('/entities/extract', {
        method: 'POST',
        timeoutMs: 2200,
        body: JSON.stringify({
          case_id: caseId,
          text,
          source_type: 'FIR Narrative',
        }),
      });

      if (res && Array.isArray(res.entities) && res.entities.length > 0) {
        return {
          case_id: res.case_id || caseId,
          source_type: res.source_type || 'FIR Narrative',
          input_length: res.input_length || text.length,
          source: 'backend_spacy',
          entities: res.entities.map((e: any) => ({
            name: e.name,
            type: (e.type as EntityType) || 'Person',
            confidence: e.confidence || 0.90,
            span: e.span,
            extraction_method: e.extraction_method || 'spaCy NER (Backend)',
          })),
          dates_detected: res.dates_detected || [],
          extraction_summary: res.extraction_summary || {
            total_entities: res.entities.length,
            by_type: {},
            vehicles_found: 0,
            dates_found: 0,
          },
          next_step: res.next_step || 'Review and map to workspace.',
        };
      }

      // If backend returns empty or non-standard format, supplement with client engine
      const localFallback = extractEntitiesLocally(text, caseId);
      return localFallback;
    } catch (err) {
      console.info('Backend /entities/extract unavailable or timed out. Utilizing tactical client NLP engine...');
      return extractEntitiesLocally(text, caseId);
    }
  },

  /**
   * Resolve and disambiguate query name against candidates using Live Backend with instant ACH fallback
   */
  resolveEntities: async (queryName: string, candidates: string[]): Promise<ResolutionCandidateResult[]> => {
    if (!queryName.trim() || candidates.length === 0) {
      return [];
    }

    try {
      // Attempt backend resolution
      const res = await apiRequest<any[]>('/entities/resolve', {
        method: 'POST',
        timeoutMs: 2200,
        body: JSON.stringify({
          query_name: queryName.trim(),
          candidates,
          entity_type: 'Person',
        }),
      });

      if (Array.isArray(res) && res.length > 0) {
        return res.map((r: any) => ({
          matched_entity: r.matched_entity || r.candidate,
          confidence: r.confidence || 0.8,
          status: (r.confidence >= 0.75
            ? 'High Confidence Match (Verify)'
            : r.confidence >= 0.50
            ? 'Potential Alias (Investigate)'
            : 'Low Probability / Unrelated') as ResolutionCandidateResult['status'],
          statusColor: (r.confidence >= 0.75 ? 'emerald' : r.confidence >= 0.50 ? 'amber' : 'slate') as ResolutionCandidateResult['statusColor'],
          rationale: Array.isArray(r.rationale) ? r.rationale : [r.note || 'Resolved via backend similarity index.'],
          source: 'backend',
          human_action_required: true,
        }));
      }

      return resolveCandidatesLocally(queryName, candidates);
    } catch (err) {
      console.info('Backend /entities/resolve unavailable or timed out. Utilizing tactical client ACH matching engine...');
      return resolveCandidatesLocally(queryName, candidates);
    }
  },
};

export default entityService;
