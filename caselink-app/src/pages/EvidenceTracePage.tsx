import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Car,
  MapPin,
  FileText,
  Phone,
  FolderOpen,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  Info,
  Clock,
  Eye,
} from 'lucide-react';
import { MOCK_LEADS, type Lead } from '../data/mockData';
import ConfidenceBar from '../components/ui/ConfidenceBar';

export const EvidenceTracePage: React.FC = () => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(MOCK_LEADS[0].id);
  const selectedLead = MOCK_LEADS.find((l) => l.id === selectedLeadId) || MOCK_LEADS[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Evidence Trace & Reasoning Explainability
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">
              AUDITABLE AUDIT TRAIL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end evidence provenance. Answer <span className="text-slate-200 font-bold">&ldquo;Why was this lead generated?&rdquo;</span> with complete evidentiary grounding.
          </p>
        </div>

        {/* Lead Switcher */}
        <div className="flex items-center gap-2 bg-[#0B1F3A] border border-[#1E3A5F] p-1.5 rounded-xl text-xs">
          <span className="text-slate-400 px-2 font-semibold uppercase text-[10px]">Select Lead:</span>
          {MOCK_LEADS.map((lead) => (
            <button
              key={lead.id}
              onClick={() => setSelectedLeadId(lead.id)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                selectedLeadId === lead.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#152A46]'
              }`}
            >
              {lead.id}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Lead Overview Card ───────────────────────── */}
      <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1E3A5F] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider font-mono">
                INVESTIGATIVE LEAD {selectedLead.id}
              </span>
              <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
                {selectedLead.priority} PRIORITY
              </span>
              <span className="text-slate-500 text-xs font-mono">Case: {selectedLead.caseId}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{selectedLead.title}</h2>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-[#152A46] px-4 py-2 rounded-xl border border-[#1E3A5F]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Composite Confidence</span>
              <span className="text-xl font-mono font-bold text-green-400">{selectedLead.confidence}%</span>
            </div>
            <div className="h-8 w-px bg-[#1E3A5F]" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Generated At</span>
              <span className="text-xs font-mono text-slate-300">{selectedLead.generatedAt}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedLead.description}
        </p>
      </div>

      {/* ── Two-Column Trace Matrix: Reasoning Chain vs Source Records ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: Reasoning Chain (The core requirement) */}
        <div className="lg:col-span-7 bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              Autonomous Reasoning Chain (5 Inference Layers)
            </span>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
              Explainable Graph Path
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {selectedLead.reasoningSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative p-3.5 rounded-xl bg-[#152A46] border border-[#1E3A5F] hover:border-blue-500/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0B1F3A] border border-[#1E3A5F] flex items-center justify-center font-mono text-xs font-bold text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-xs">{step.title}</h4>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Arrow Connector between steps */}
                {idx < selectedLead.reasoningSteps.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <ArrowDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                      <span>INFERENCE CORRELATION</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1E3A5F] flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              All steps trace directly to verified source documents
            </span>
            <button className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors">
              Verify Evidence Integrity
            </button>
          </div>
        </div>

        {/* RIGHT: Source Records & Explainability Metrics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Documents List */}
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-green-400" />
                Source Records Grounding (Why?)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedLead.sourceRecords.length} Documents
              </span>
            </div>

            <div className="space-y-2.5">
              {selectedLead.sourceRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg bg-[#152A46] border border-[#1E3A5F] hover:border-green-500/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-green-400">
                      {rec.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{rec.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-normal">{rec.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Decomposition Metrics */}
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-[#1E3A5F] pb-3">
              Explainable Compatibility Scores
            </span>

            <div className="space-y-3">
              <ConfidenceBar
                value={selectedLead.aiScores.entityMatching}
                label="Entity Matching & Facial/Aadhaar Alignment"
                color="purple"
              />
              <ConfidenceBar
                value={selectedLead.aiScores.temporalCompatibility}
                label="Temporal Compatibility (Within 45 min window)"
                color="blue"
              />
              <ConfidenceBar
                value={selectedLead.aiScores.geographicCompatibility}
                label="Geographic & Fastag Co-occurrence"
                color="green"
              />
              <ConfidenceBar
                value={selectedLead.aiScores.evidenceConsistency}
                label="Cross-Case Modus Operandi Similarity"
                color="amber"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceTracePage;
