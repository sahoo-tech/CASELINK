import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Plus,
  Compass,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MOCK_HYPOTHESES, type Hypothesis } from '../data/mockData';
import PriorityBadge from '../components/ui/PriorityBadge';

export const HypothesisEnginePage: React.FC = () => {
  const [filter, setFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_HYPOTHESES[0].id);

  const filtered = MOCK_HYPOTHESES.filter((h) => {
    if (filter === 'ALL') return true;
    return h.status === filter;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Competing Investigation Hypotheses
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              ACH FRAMEWORK (HEURISTIC)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analysis of Competing Hypotheses (ACH). Evaluates supportive vs contradictory evidence to minimize cognitive bias.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1F3A] border border-[#1E3A5F] text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono">4 ACTIVE SCENARIOS</span>
          </div>

          <button
            title="Investigator permission required"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all cursor-not-allowed opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            Formulate New Hypothesis
          </button>
        </div>
      </div>

      {/* ── Warning & Principles Banner ─────────────────────── */}
      <div className="bg-[#0B1F3A] border-l-4 border-l-purple-500 border-y border-r border-[#1E3A5F] p-3.5 rounded-r-xl flex items-start gap-3 text-xs">
        <Brain className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
            Explainable AI Principle — Human Decision In The Loop
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Hypotheses are mathematically weighted from multi-source signals. Contradictory evidence carries double diagnostic weight to guard against premature closure. Human investigators retain final determination.
          </p>
        </div>
      </div>

      {/* ── Filter Buttons ──────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mr-1">
          Filter by Status:
        </span>
        {['ALL', 'HIGH PRIORITY', 'MEDIUM', 'LOW'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === st
                ? 'bg-blue-600 text-white shadow'
                : 'bg-[#0B1F3A] border border-[#1E3A5F] text-slate-300 hover:bg-[#152A46]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* ── Hypotheses Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((hyp, index) => {
          const isExpanded = expandedId === hyp.id;
          const totalEvidence = hyp.supportingEvidence + hyp.contradictoryEvidence;
          const supportPct = Math.round((hyp.supportingEvidence / totalEvidence) * 100);
          const contraPct = 100 - supportPct;

          return (
            <motion.div
              key={hyp.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-[#0B1F3A] border rounded-xl overflow-hidden shadow-xl transition-all ${
                hyp.status === 'HIGH PRIORITY'
                  ? 'border-red-500/40 hover:border-red-500/80'
                  : hyp.status === 'MEDIUM'
                  ? 'border-amber-500/40 hover:border-amber-500/80'
                  : 'border-[#1E3A5F] hover:border-slate-500'
              }`}
            >
              {/* Header Bar */}
              <div className="p-4 border-b border-[#1E3A5F] flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase bg-[#152A46] px-2 py-0.5 rounded border border-[#1E3A5F]">
                      {hyp.id.toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        hyp.status === 'HIGH PRIORITY'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : hyp.status === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-green-500/15 text-green-400 border-green-500/30'
                      }`}
                    >
                      {hyp.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{hyp.title}</h3>
                </div>

                {/* Circular / Large Confidence Gauge */}
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className={`text-2xl font-bold font-mono ${
                      hyp.confidence >= 80
                        ? 'text-green-400'
                        : hyp.confidence >= 60
                        ? 'text-blue-400'
                        : hyp.confidence >= 40
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {hyp.confidence}%
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                    Confidence
                  </span>
                </div>
              </div>

              {/* Body Summary */}
              <div className="p-4 space-y-4 text-xs">
                <p className="text-slate-300 leading-relaxed bg-[#152A46]/60 p-3 rounded-lg border border-[#1E3A5F]">
                  {hyp.description}
                </p>

                {/* ── Evidence Balance Visualization (Crucial Spec) ── */}
                <div className="space-y-2 bg-[#152A46] p-3 rounded-lg border border-[#1E3A5F]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      Evidence Balance Ratio
                    </span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {hyp.supportingEvidence} Support vs {hyp.contradictoryEvidence} Contra
                    </span>
                  </div>

                  {/* Dual Proportional Bar */}
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800 p-0.5 gap-0.5">
                    <div
                      style={{ width: `${supportPct}%` }}
                      className="h-full bg-green-500 rounded-l-full flex items-center justify-center transition-all"
                    />
                    <div
                      style={{ width: `${contraPct}%` }}
                      className="h-full bg-red-500 rounded-r-full flex items-center justify-center transition-all"
                    />
                  </div>

                  {/* Labels below bars */}
                  <div className="flex items-center justify-between text-[11px] font-semibold pt-0.5">
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SUPPORTING ({hyp.supportingEvidence})</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>CONTRADICTORY ({hyp.contradictoryEvidence})</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Breakdown of Facts */}
                <button
                  onClick={() => toggleExpand(hyp.id)}
                  className="w-full flex items-center justify-between py-1.5 px-3 rounded bg-[#152A46]/80 text-slate-300 hover:text-white border border-[#1E3A5F] text-[11px] font-semibold transition-colors"
                >
                  <span>
                    {isExpanded ? 'Collapse Diagnostic Facts' : 'Inspect Supporting & Contradictory Signals'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-1 text-xs"
                  >
                    {/* Supporting Items */}
                    <div className="space-y-1.5 bg-green-950/20 border border-green-800/30 p-3 rounded-lg">
                      <span className="font-bold text-green-400 text-[11px] flex items-center gap-1 uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Supporting Evidence
                      </span>
                      <ul className="space-y-1 text-slate-300 text-[11px] pl-4 list-disc">
                        {hyp.supportingItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Contradictory Items */}
                    <div className="space-y-1.5 bg-red-950/20 border border-red-800/30 p-3 rounded-lg">
                      <span className="font-bold text-red-400 text-[11px] flex items-center gap-1 uppercase">
                        <XCircle className="w-3.5 h-3.5" /> Contradictory / Disconfirming Signals
                      </span>
                      <ul className="space-y-1 text-slate-300 text-[11px] pl-4 list-disc">
                        {hyp.contradictoryItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-[#152A46]/60 border-t border-[#1E3A5F] flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Created {hyp.createdDate}
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1">
                    <span>Investigate</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HypothesisEnginePage;
