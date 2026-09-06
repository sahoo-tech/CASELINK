import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  Layers,
  MapPin,
  Car,
  Building2,
  Calendar,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileText,
  Send,
  RefreshCw,
  Phone,
  DollarSign,
  User,
  Check,
  X,
} from 'lucide-react';
import { MOCK_ENTITIES, type Entity, type EntityType } from '../data/mockData';
import EntityBadge from '../components/ui/EntityBadge';
import ConfidenceBar from '../components/ui/ConfidenceBar';
import entityService, { type ExtractionResult, type ResolutionCandidateResult } from '../services/entityService';

export const EntitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>(MOCK_ENTITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Interactive Extractor State
  const [showExtractor, setShowExtractor] = useState(false);
  const [rawText, setRawText] = useState(
    'Raj Kumar travelled from Delhi to Mumbai using vehicle MH12AB4582. He met Arjun Mehta at Dharavi Warehouse to coordinate a ₹50 crore transfer via phone 9876543210.'
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [extractorFeedback, setExtractorFeedback] = useState('');
  const [extractorError, setExtractorError] = useState('');

  // Interactive Resolver State
  const [showResolver, setShowResolver] = useState(false);
  const [resolveQuery, setResolveQuery] = useState('R. Kumar');
  const [resolveCandidates, setResolveCandidates] = useState('Raj Kumar, Rajesh Kumar, Arjun Mehta, Sanjay Das');
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionResults, setResolutionResults] = useState<ResolutionCandidateResult[]>([]);
  const [resolverFeedback, setResolverFeedback] = useState('');
  const [resolverError, setResolverError] = useState('');

  // Filtered entities
  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const matchesSearch =
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entity.roleOrDesignation && entity.roleOrDesignation.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'ALL' || entity.type.toUpperCase() === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [entities, searchQuery, typeFilter]);

  // Execute Live NLP Extraction via Backend with Tactical Client NLP Fallback
  const handleExtract = async (textToExtract?: string) => {
    const text = (textToExtract || rawText).trim();
    setExtractorError('');
    setExtractorFeedback('');

    if (!text) {
      setExtractorError('Please provide FIR narrative or surveillance transcript text before running extraction.');
      return;
    }

    setIsExtracting(true);
    try {
      const res = await entityService.extractEntities(text, 'case-001');
      setExtractionResult(res);

      // Add newly extracted entities to viewable list
      if (res.entities && res.entities.length > 0) {
        const newEntities: Entity[] = res.entities.map((e, idx) => ({
          id: `ext-${Date.now()}-${idx}`,
          name: e.name,
          type: (e.type as EntityType) || 'Person',
          confidence: Math.round((e.confidence || 0.85) * 100),
          aliases: [],
          relatedCases: 1,
          locations: 1,
          evidenceLinks: 1,
          details: { extraction_method: e.extraction_method },
          roleOrDesignation: `Extracted via ${e.extraction_method}`,
        }));

        setEntities((prev) => {
          const names = new Set(prev.map((p) => p.name.toLowerCase()));
          const uniqueNew = newEntities.filter((ne) => !names.has(ne.name.toLowerCase()));
          return [...uniqueNew, ...prev];
        });

        setExtractorFeedback(
          `Extracted ${res.entities.length} entities (${
            res.source === 'backend_spacy' ? 'Live spaCy NER' : 'Tactical Client NLP Engine'
          }). Ingested into active entity registry.`
        );
      } else {
        setExtractorError('No distinct entities detected in this snippet. Try including names, vehicle numbers, or phone numbers.');
      }
    } catch (err: any) {
      setExtractorError(`Extraction failed: ${err.message || 'Unable to parse text.'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Execute Live Entity Resolution via Backend with Tactical Client ACH Fallback
  const handleResolve = async () => {
    setResolverError('');
    setResolverFeedback('');

    if (!resolveQuery.trim()) {
      setResolverError('Please enter an alias query name (e.g. "R. Kumar") to evaluate.');
      return;
    }

    const candidates = resolveCandidates
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    if (candidates.length === 0) {
      setResolverError('Please provide at least one candidate name separated by commas.');
      return;
    }

    setIsResolving(true);
    try {
      const res = await entityService.resolveEntities(resolveQuery.trim(), candidates);
      setResolutionResults(res || []);

      if (res && res.length > 0) {
        const top = res.reduce((p, c) => (c.confidence > p.confidence ? c : p), res[0]);
        setResolverFeedback(
          `Evaluated ${res.length} candidate identities. Top candidate: "${top.matched_entity}" (${Math.round(
            top.confidence * 100
          )}% confidence - ${top.status}).`
        );
      } else {
        setResolverError('No candidates could be evaluated. Please verify the candidate names.');
      }
    } catch (err: any) {
      setResolverError(`Resolution failed: ${err.message || 'Unable to evaluate candidates.'}`);
    } finally {
      setIsResolving(false);
    }
  };

  // Confirm an Alias Link directly into the active entity list
  const handleConfirmAlias = (candidateName: string) => {
    const aliasToAdd = resolveQuery.trim();
    if (!aliasToAdd) return;

    setEntities((prev) =>
      prev.map((ent) => {
        if (ent.name.toLowerCase() === candidateName.toLowerCase()) {
          const existing = ent.aliases || [];
          if (!existing.some((a) => a.toLowerCase() === aliasToAdd.toLowerCase())) {
            return {
              ...ent,
              aliases: [...existing, aliasToAdd],
            };
          }
        }
        return ent;
      })
    );

    setResolverFeedback(
      `✓ Confirmed "${aliasToAdd}" as an authenticated investigative alias for "${candidateName}". Registry updated.`
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Entity Intelligence Explorer
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
              CROSS-CASE LINKAGE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal entity resolution resolving persons, vehicles, facilities, front corporations, and transaction hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExtractor(!showExtractor)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              showExtractor
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-[#152A46] hover:bg-[#1E3A5F] text-blue-400 border border-blue-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Text Extractor (NLP)
          </button>

          <button
            onClick={() => setShowResolver(!showResolver)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              showResolver
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-[#152A46] hover:bg-[#1E3A5F] text-amber-400 border border-amber-500/30'
            }`}
          >
            <Shield className="w-4 h-4" />
            Alias Resolver (ACH)
          </button>

          <button
            onClick={() => navigate('/workspace')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-600/25"
          >
            <Layers className="w-4 h-4" />
            Full Knowledge Graph
          </button>
        </div>
      </div>

      {/* ── INTERACTIVE PANEL 1: AI NLP Entity Extraction ──── */}
      <AnimatePresence>
        {showExtractor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0B1F3A] border border-blue-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E3A5F] pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Live AI Evidence Ingestion & NLP Parser</h3>
                    <p className="text-[11px] text-slate-400">
                      Parses raw FIR narrative, phone transcripts, and vehicle plates via spaCy & India RTO regex
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 hidden md:inline">Presets:</span>
                  <button
                    onClick={() => {
                      setRawText(
                        'FIR No. 89/2026: Suspect Sanjay Das was observed meeting Deepak Rao in Delhi using vehicle DL8CAA2301. BSF intercepted 45 kg narcotics at Attari Border. An illegal transaction of ₹25 crore was routed via phone 9765432109.'
                      );
                      setExtractorError('');
                      setExtractorFeedback('');
                    }}
                    className="px-2.5 py-1 rounded bg-[#152A46] text-slate-300 hover:text-white text-[11px] border border-[#1E3A5F] transition-colors"
                  >
                    Sample 2 (Narcotics)
                  </button>
                  <button
                    onClick={() => {
                      setRawText(
                        'Raj Kumar travelled from Delhi to Mumbai using vehicle MH12AB4582. He met Arjun Mehta at Dharavi Warehouse to coordinate a ₹50 crore transfer via phone 9876543210.'
                      );
                      setExtractorError('');
                      setExtractorFeedback('');
                    }}
                    className="px-2.5 py-1 rounded bg-[#152A46] text-slate-300 hover:text-white text-[11px] border border-[#1E3A5F] transition-colors"
                  >
                    Sample 1 (Financial)
                  </button>
                </div>
              </div>

              {/* Feedback and Error Alerts */}
              {extractorFeedback && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{extractorFeedback}</span>
                </div>
              )}

              {extractorError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{extractorError}</span>
                </div>
              )}

              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    if (extractorError) setExtractorError('');
                  }}
                  placeholder="Paste any FIR text, witness statement, or CDR surveillance transcript..."
                  className="w-full p-3 rounded-xl bg-[#152A46] border border-[#1E3A5F] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Dual-Engine pipeline: <code className="text-blue-400 font-mono">spaCy NER</code> +{' '}
                    <code className="text-cyan-400 font-mono">India RTO/CDR Regex Engine</code>
                  </span>

                  <button
                    onClick={() => handleExtract()}
                    disabled={isExtracting}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing Intelligence Entities...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Run Live NLP Extraction</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Extraction Results */}
              {extractionResult && (
                <div className="mt-3 p-4 rounded-xl bg-[#152A46]/70 border border-[#1E3A5F] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-200">
                        Extracted Entities ({extractionResult.entities?.length || 0} Identified)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {extractionResult.input_length} characters parsed
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        extractionResult.source === 'backend_spacy'
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {extractionResult.source === 'backend_spacy'
                        ? '🟢 LIVE BACKEND (SPACY NER)'
                        : '⚡ TACTICAL NLP PARSER (NER + REGEX)'}
                    </span>
                  </div>

                  {/* Summary Category Chips */}
                  {extractionResult.extraction_summary?.by_type && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1E3A5F]/60">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Categories:</span>
                      {Object.entries(extractionResult.extraction_summary.by_type).map(([cat, count]) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-full bg-[#0B1F3A] border border-[#1E3A5F] text-[10px] font-mono text-slate-300"
                        >
                          {cat}: <strong>{count}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Entities Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    {extractionResult.entities?.map((ent, idx) => {
                      const isPerson = ent.type === 'Person';
                      const isVehicle = ent.type === 'Vehicle';
                      const isLocation = ent.type === 'Location';
                      const isOrg = ent.type === 'Organization';

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-[#0B1F3A] border border-[#1E3A5F] hover:border-blue-500/40 flex flex-col justify-between transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                {isPerson && <User className="w-3.5 h-3.5 text-blue-400" />}
                                {isVehicle && <Car className="w-3.5 h-3.5 text-emerald-400" />}
                                {isLocation && <MapPin className="w-3.5 h-3.5 text-purple-400" />}
                                {isOrg && <Building2 className="w-3.5 h-3.5 text-amber-400" />}
                                {!isPerson && !isVehicle && !isLocation && !isOrg && (
                                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                )}
                                <span
                                  className={`text-[10px] uppercase font-bold tracking-wider ${
                                    isPerson
                                      ? 'text-blue-400'
                                      : isVehicle
                                      ? 'text-emerald-400'
                                      : isLocation
                                      ? 'text-purple-400'
                                      : isOrg
                                      ? 'text-amber-400'
                                      : 'text-cyan-400'
                                  }`}
                                >
                                  {ent.type}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#152A46] px-1.5 py-0.5 rounded">
                                {Math.round((ent.confidence || 0.9) * 100)}%
                              </span>
                            </div>
                            <p className="text-xs font-bold text-white break-words">{ent.name}</p>
                          </div>
                          <div className="mt-2 pt-2 border-t border-[#1E3A5F]/60 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">
                              {ent.extraction_method}
                            </span>
                            <button
                              onClick={() => navigate('/workspace')}
                              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold hover:underline shrink-0"
                            >
                              Graph →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => navigate('/workspace')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold transition-all"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Map All Extracted Entities to Investigation Graph</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE PANEL 2: Alias Resolution (ACH) ─────── */}
      <AnimatePresence>
        {showResolver && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0B1F3A] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E3A5F] pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Entity Resolution & Alias Matching (ACH)</h3>
                    <p className="text-[11px] text-slate-400">
                      Evaluates character overlap, token-sort similarity, and phonetic aliases (Human-in-the-Loop)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 hidden md:inline">Presets:</span>
                  <button
                    onClick={() => {
                      setResolveQuery('R. Kumar');
                      setResolveCandidates('Raj Kumar, Rajesh Kumar, Arjun Mehta, Sanjay Das');
                      setResolverError('');
                      setResolverFeedback('');
                    }}
                    className="px-2.5 py-1 rounded bg-[#152A46] text-slate-300 hover:text-white text-[11px] border border-[#1E3A5F] transition-colors"
                  >
                    R. Kumar Case
                  </button>
                  <button
                    onClick={() => {
                      setResolveQuery('Vikram S.');
                      setResolveCandidates('ACP Vikram Sharma, Vikramaditya Rao, Priya Menon, Rajesh Nair');
                      setResolverError('');
                      setResolverFeedback('');
                    }}
                    className="px-2.5 py-1 rounded bg-[#152A46] text-slate-300 hover:text-white text-[11px] border border-[#1E3A5F] transition-colors"
                  >
                    Officer Alias Check
                  </button>
                </div>
              </div>

              {/* Feedback and Error Alerts */}
              {resolverFeedback && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{resolverFeedback}</span>
                </div>
              )}

              {resolverError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{resolverError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1">
                    Suspect Query Alias / Moniker
                  </label>
                  <input
                    type="text"
                    value={resolveQuery}
                    onChange={(e) => {
                      setResolveQuery(e.target.value);
                      if (resolverError) setResolverError('');
                    }}
                    placeholder="e.g. R. Kumar, Vikram S., Sanjay D."
                    className="w-full px-3 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1">
                    Candidate Identities (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={resolveCandidates}
                    onChange={(e) => {
                      setResolveCandidates(e.target.value);
                      if (resolverError) setResolverError('');
                    }}
                    placeholder="Raj Kumar, Rajesh Kumar, Arjun Mehta"
                    className="w-full px-3 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Dual-Engine matcher: <code className="text-amber-400 font-mono">Levenshtein + Token-Sort</code> +{' '}
                  <code className="text-yellow-400 font-mono">ACH Phonetic Cross-Index</code>
                </span>

                <button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
                >
                  {isResolving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Matching & Disambiguating...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5" />
                      <span>Check Match Confidence</span>
                    </>
                  )}
                </button>
              </div>

              {/* Resolution Results */}
              {resolutionResults.length > 0 && (
                <div className="mt-3 p-4 rounded-xl bg-[#152A46]/70 border border-[#1E3A5F] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      Candidate Matches & Similarity Index ({resolutionResults.length} Evaluated)
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        resolutionResults[0]?.source === 'backend'
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {resolutionResults[0]?.source === 'backend'
                        ? '🟢 LIVE BACKEND RESOLVED'
                        : '⚡ TACTICAL ACH RESOLVER ENGINE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resolutionResults.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg bg-[#0B1F3A] border border-[#1E3A5F] hover:border-amber-500/40 space-y-2.5 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{r.matched_entity}</span>
                            <span className="text-[10px] text-slate-400">Comparing with &ldquo;{resolveQuery}&rdquo;</span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-xs font-mono font-bold ${
                                r.confidence >= 0.75
                                  ? 'text-emerald-400'
                                  : r.confidence >= 0.50
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {Math.round((r.confidence || 0) * 100)}% Match
                            </span>
                          </div>
                        </div>

                        <ConfidenceBar
                          value={Math.round((r.confidence || 0) * 100)}
                          showPercentage={false}
                          color={r.confidence >= 0.75 ? 'green' : r.confidence >= 0.50 ? 'amber' : 'red'}
                        />

                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                              r.confidence >= 0.75
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : r.confidence >= 0.50
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {r.status}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">Human-in-the-Loop</span>
                        </div>

                        {/* Rationale items */}
                        <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4 pt-1 border-t border-[#1E3A5F]/60">
                          {r.rationale?.map((rat: string, rIdx: number) => (
                            <li key={rIdx}>{rat}</li>
                          ))}
                        </ul>

                        {/* Interactive Verification Buttons */}
                        <div className="pt-2 border-t border-[#1E3A5F]/60 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setResolutionResults((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="px-2.5 py-1 rounded bg-[#152A46] hover:bg-[#1E3A5F] text-slate-400 hover:text-white text-[11px] border border-[#1E3A5F] transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleConfirmAlias(r.matched_entity)}
                            className="px-3 py-1 rounded bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all"
                            title="Add this alias directly into the entity record"
                          >
                            <Check className="w-3 h-3" />
                            <span>Confirm Alias Link</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search & Filter Strip ───────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0B1F3A] border border-[#1E3A5F] p-3 rounded-xl text-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search entity name, alias, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'PERSON', 'VEHICLE', 'LOCATION', 'ORGANIZATION', 'EVENT'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-[#152A46] text-slate-300 hover:text-white hover:bg-[#1E3A5F]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Entity Cards Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntities.map((entity, i) => (
          <motion.div
            key={entity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[#0B1F3A] border border-[#1E3A5F] hover:border-blue-500/50 rounded-xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <EntityBadge type={entity.type} />
                <span className="font-mono text-xs font-bold text-slate-400">
                  {entity.confidence}% Match
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {entity.name}
                </h3>
                {entity.roleOrDesignation && (
                  <p className="text-xs text-blue-400 mt-0.5">{entity.roleOrDesignation}</p>
                )}
              </div>

              <ConfidenceBar
                value={entity.confidence}
                showPercentage={false}
                color={entity.confidence >= 90 ? 'green' : 'amber'}
              />

              {/* Aliases */}
              {entity.aliases && entity.aliases.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    Aliases / Identifiers
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {entity.aliases.map((alias) => (
                      <span
                        key={alias}
                        className="px-2 py-0.5 rounded bg-[#152A46] border border-[#1E3A5F] text-[11px] font-mono text-slate-300"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center bg-[#152A46]/60 p-2.5 rounded-lg border border-[#1E3A5F]">
                <div>
                  <span className="font-bold text-white text-xs block">{entity.relatedCases}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Cases</span>
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">{entity.locations}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Locations</span>
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">{entity.evidenceLinks}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Links</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/workspace')}
              className="w-full py-2 rounded-lg bg-[#152A46] hover:bg-blue-600 text-slate-300 hover:text-white border border-[#1E3A5F] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Map in Investigation Graph</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EntitiesPage;
