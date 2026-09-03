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
} from 'lucide-react';
import { MOCK_ENTITIES, type Entity, type EntityType } from '../data/mockData';
import EntityBadge from '../components/ui/EntityBadge';
import ConfidenceBar from '../components/ui/ConfidenceBar';
import { apiRequest } from '../services/apiClient';

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
  const [extractionResult, setExtractionResult] = useState<any>(null);

  // Interactive Resolver State
  const [showResolver, setShowResolver] = useState(false);
  const [resolveQuery, setResolveQuery] = useState('R. Kumar');
  const [resolveCandidates, setResolveCandidates] = useState('Raj Kumar, Rajesh Kumar, Arjun Mehta, Sanjay Das');
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionResults, setResolutionResults] = useState<any[]>([]);

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

  // Execute Live NLP Extraction via Backend
  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setIsExtracting(true);
    try {
      const res = await apiRequest<any>('/entities/extract', {
        method: 'POST',
        body: JSON.stringify({
          case_id: 'case-001',
          text: rawText,
          source_type: 'FIR Narrative',
        }),
      });
      setExtractionResult(res);

      // Add newly extracted entities to viewable list
      if (res.entities && res.entities.length > 0) {
        const newEntities: Entity[] = res.entities.map((e: any, idx: number) => ({
          id: `ext-${Date.now()}-${idx}`,
          name: e.name,
          type: (e.type as EntityType) || 'Person',
          confidence: Math.round((e.confidence || 0.85) * 100),
          aliases: [],
          relatedCases: 1,
          locations: 1,
          evidenceLinks: 1,
          details: { extraction_method: e.extraction_method || 'spaCy NLP' },
          roleOrDesignation: `Extracted via ${e.extraction_method || 'NLP'}`,
        }));

        setEntities((prev) => {
          const names = new Set(prev.map((p) => p.name.toLowerCase()));
          const uniqueNew = newEntities.filter((ne) => !names.has(ne.name.toLowerCase()));
          return [...uniqueNew, ...prev];
        });
      }
    } catch (err) {
      console.error('NLP extraction failed:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Execute Live Entity Resolution via Backend
  const handleResolve = async () => {
    if (!resolveQuery.trim()) return;
    setIsResolving(true);
    try {
      const candidates = resolveCandidates
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await apiRequest<any[]>('/entities/resolve', {
        method: 'POST',
        body: JSON.stringify({
          query_name: resolveQuery.trim(),
          candidates,
          entity_type: 'Person',
        }),
      });
      setResolutionResults(res || []);
    } catch (err) {
      console.error('Resolution failed:', err);
    } finally {
      setIsResolving(false);
    }
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
              <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
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
                  <button
                    onClick={() =>
                      setRawText(
                        'FIR No. 89/2026: Suspect Sanjay Das was observed meeting Deepak Rao in Delhi using vehicle DL8CAA2301. BSF intercepted 45 kg narcotics at Attari Border. An illegal transaction of ₹25 crore was routed via phone 9765432109.'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-[#152A46] text-slate-300 hover:text-white text-[11px] border border-[#1E3A5F]"
                  >
                    Sample 2 (Narcotics)
                  </button>
                  <button
                    onClick={() =>
                      setRawText(
                        'Raj Kumar travelled from Delhi to Mumbai using vehicle MH12AB4582. He met Arjun Mehta at Dharavi Warehouse to coordinate a ₹50 crore transfer via phone 9876543210.'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-[#152A46] text-slate-300 hover:text-white text-[11px] border border-[#1E3A5F]"
                  >
                    Sample 1 (Financial)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste any FIR text, witness statement, or CDR surveillance transcript..."
                  className="w-full p-3 rounded-xl bg-[#152A46] border border-[#1E3A5F] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Calls live backend endpoint: <code className="text-blue-400 font-mono">POST /api/v1/entities/extract</code>
                  </span>

                  <button
                    onClick={handleExtract}
                    disabled={isExtracting || !rawText.trim()}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                  >
                    {isExtracting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Extracting Entities...</span>
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Extracted Entities ({extractionResult.extraction_summary?.total_entities || 0} Found)
                    </span>
                    <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">
                      LIVE BACKEND PARSED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {extractionResult.entities?.map((ent: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#0B1F3A] border border-[#1E3A5F] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                              {ent.type}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {Math.round((ent.confidence || 0.9) * 100)}%
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white truncate">{ent.name}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1.5 font-mono">{ent.extraction_method}</span>
                      </div>
                    ))}
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
              <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Entity Resolution & Alias Matching</h3>
                    <p className="text-[11px] text-slate-400">
                      Evaluates character overlap and token-sort similarity without automated merge (Human-in-the-Loop)
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                  REQUIRES VERIFICATION
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1">Query Alias / Name</label>
                  <input
                    type="text"
                    value={resolveQuery}
                    onChange={(e) => setResolveQuery(e.target.value)}
                    placeholder="e.g. R. Kumar"
                    className="w-full px-3 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1">Candidate Names (comma separated)</label>
                  <input
                    type="text"
                    value={resolveCandidates}
                    onChange={(e) => setResolveCandidates(e.target.value)}
                    placeholder="Raj Kumar, Rajesh Kumar, Arjun Mehta"
                    className="w-full px-3 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Backend endpoint: <code className="text-amber-400 font-mono">POST /api/v1/entities/resolve</code>
                </span>

                <button
                  onClick={handleResolve}
                  disabled={isResolving || !resolveQuery.trim()}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all"
                >
                  {isResolving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Matching...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Check Match Confidence</span>
                    </>
                  )}
                </button>
              </div>

              {/* Resolution Results */}
              {resolutionResults.length > 0 && (
                <div className="mt-3 p-4 rounded-xl bg-[#152A46]/70 border border-[#1E3A5F] space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">Candidate Matches & Rationale</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resolutionResults.map((r, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#0B1F3A] border border-[#1E3A5F] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{r.matched_entity}</span>
                          <span className="text-[11px] font-mono font-bold text-amber-400">
                            {Math.round((r.confidence || 0) * 100)}% Match
                          </span>
                        </div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {r.status || 'Requires Verification'}
                        </span>
                        <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                          {r.rationale?.map((rat: string, rIdx: number) => (
                            <li key={rIdx}>{rat}</li>
                          ))}
                        </ul>
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
