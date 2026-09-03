import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Car,
  MapPin,
  DollarSign,
  Brain,
  Clock,
  Map,
  Compass,
  Link,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import KnowledgeGraph from '../components/graph/KnowledgeGraph';
import ConfidenceBar from '../components/ui/ConfidenceBar';
import EntityBadge from '../components/ui/EntityBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import StatusBadge from '../components/ui/StatusBadge';
import {
  MOCK_CASES,
  MOCK_ENTITIES,
  type Entity,
  type Case,
} from '../data/mockData';

const InvestigationWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const currentCase: Case = MOCK_CASES[0]; // CASE-2026-01482

  const [selectedEntityName, setSelectedEntityName] = useState<string>('R. Kumar (Raj Kumar)');
  const [showAIPanel, setShowAIPanel] = useState<boolean>(true);

  // Find entity or match fallback
  const selectedEntity: Entity =
    MOCK_ENTITIES.find(
      (e) =>
        e.name.toLowerCase().includes(selectedEntityName.toLowerCase()) ||
        selectedEntityName.toLowerCase().includes(e.name.toLowerCase()) ||
        e.aliases.some((a) => a.toLowerCase().includes(selectedEntityName.toLowerCase()))
    ) || MOCK_ENTITIES[0];

  const handleSelectNode = (entityLabel: string) => {
    setSelectedEntityName(entityLabel);
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-[#071426]">
      {/* ── Top Workspace Action Bar ────────────────────────── */}
      <div className="h-11 px-4 bg-[#0B1F3A] border-b border-[#1E3A5F] flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-blue-400 font-bold tracking-wider">
            {currentCase.caseNumber}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium truncate max-w-sm hidden sm:inline">
            {currentCase.title}
          </span>
          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-semibold text-[10px]">
            ACTIVE INTELLIGENCE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              showAIPanel
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#152A46] text-slate-300 hover:text-white border border-[#1E3A5F]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI Reasoning Matrix</span>
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          </button>

          <button
            onClick={() => navigate('/timeline')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 text-xs border border-[#1E3A5F] transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Timeline
          </button>

          <button
            onClick={() => navigate('/geospatial')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 text-xs border border-[#1E3A5F] transition-colors"
          >
            <Map className="w-3.5 h-3.5 text-green-400" />
            Geospatial
          </button>

          <button
            onClick={() => navigate('/hypothesis')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-medium transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            Hypotheses
          </button>
        </div>
      </div>

      {/* ── Main 3-Panel Workspace Body ─────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden w-full">
        {/* ── LEFT PANEL: Case Information & Evidence Summary ─ */}
        <div className="w-72 md:w-80 bg-[#0B1F3A] border-r border-[#1E3A5F] flex flex-col shrink-0 overflow-y-auto">
          {/* Case Details Block */}
          <div className="p-4 border-b border-[#1E3A5F] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Case Details
              </span>
              <StatusBadge status={currentCase.status} />
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Case Identifier</span>
                <span className="font-mono text-sm font-bold text-blue-400">
                  {currentCase.caseNumber}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Category</span>
                <span className="font-medium text-slate-200">{currentCase.type}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 text-[11px] block">Created</span>
                  <span className="text-slate-300 font-mono">{currentCase.created}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Priority</span>
                  <PriorityBadge priority={currentCase.priority} />
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Assigned Unit</span>
                <span className="text-slate-300">{currentCase.assignedUnit}</span>
              </div>
            </div>
          </div>

          {/* Evidence Found Summary */}
          <div className="p-4 border-b border-[#1E3A5F] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Evidence Found
              </span>
              <span className="text-[10px] text-slate-400 font-mono">87 items mapped</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#152A46] border border-[#1E3A5F] p-2.5 rounded-lg flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-lg font-bold text-white leading-none block">
                    {currentCase.evidenceCounts.documents}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Documents</span>
                </div>
              </div>

              <div className="bg-[#152A46] border border-[#1E3A5F] p-2.5 rounded-lg flex items-center gap-2.5">
                <Users className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <span className="text-lg font-bold text-white leading-none block">
                    {currentCase.evidenceCounts.persons}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Persons</span>
                </div>
              </div>

              <div className="bg-[#152A46] border border-[#1E3A5F] p-2.5 rounded-lg flex items-center gap-2.5">
                <Car className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="text-lg font-bold text-white leading-none block">
                    {currentCase.evidenceCounts.vehicles}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Vehicles</span>
                </div>
              </div>

              <div className="bg-[#152A46] border border-[#1E3A5F] p-2.5 rounded-lg flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-green-400 shrink-0" />
                <div>
                  <span className="text-lg font-bold text-white leading-none block">
                    {currentCase.evidenceCounts.locations}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Locations</span>
                </div>
              </div>

              <div className="col-span-2 bg-[#152A46] border border-[#1E3A5F] p-2.5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-lg font-bold text-white leading-none block">
                      {currentCase.evidenceCounts.transactions}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Transactions</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-amber-400 font-semibold">₹14.8 Cr Total</span>
              </div>
            </div>
          </div>

          {/* Quick Investigation Modules Navigation */}
          <div className="p-4 space-y-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
              Investigative Modules
            </span>

            <button
              onClick={() => navigate('/evidence')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-200 text-xs border border-[#1E3A5F] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Link className="w-3.5 h-3.5 text-purple-400" />
                <span>Evidence Trace & Why?</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => navigate('/hypothesis')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-200 text-xs border border-[#1E3A5F] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>Competing Hypotheses (4)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-200 text-xs border border-[#1E3A5F] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-green-400" />
                <span>Export Dossier / Report</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* ── CENTER PANEL: Dynamic Knowledge Graph (Robust Flex Container) ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[500px] h-full relative overflow-hidden">
          <KnowledgeGraph
            onSelectEntity={handleSelectNode}
            selectedEntityId={selectedEntity.name}
          />
        </div>

        {/* ── RIGHT PANEL: Entity Profile & AI Reasoning ────── */}
        <div className="w-80 md:w-96 bg-[#0B1F3A] border-l border-[#1E3A5F] flex flex-col shrink-0 overflow-y-auto">
          {/* AI Assisted Reasoning Section */}
          {showAIPanel && (
            <div className="border-b border-[#1E3A5F] bg-gradient-to-b from-purple-950/20 to-transparent p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-400">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Assisted Reasoning
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  PRIORITY: HIGH
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Autonomous heuristic engine cross-referencing temporal-spatial telemetry with historical syndicates.
              </p>

              {/* Explainable Confidence Matrix */}
              <div className="space-y-2 bg-[#152A46]/60 border border-[#1E3A5F] p-3 rounded-lg">
                <ConfidenceBar value={87} label="Entity Matching" color="purple" />
                <ConfidenceBar value={92} label="Temporal Compatibility" color="blue" />
                <ConfidenceBar value={81} label="Geographic Compatibility" color="green" />
                <ConfidenceBar value={76} label="Evidence Consistency" color="amber" />
              </div>

              {/* Rationale Bullet Points (Explains WHY) */}
              <div className="bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wide block">
                  Why was this lead generated?
                </span>
                <ul className="text-[11px] text-slate-300 space-y-1 pl-3.5 list-disc">
                  <li>Same vehicle appeared in 3 related cases</li>
                  <li>Movement pattern overlaps within 45 min</li>
                  <li>Entity similarity detected with known profile</li>
                  <li>Previous location association with Warehouse Zone A</li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/evidence')}
                className="w-full py-1.5 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Inspect Full Evidence Trace Chain</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Selected Entity Profile */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Entity Profile
              </span>
              <EntityBadge type={selectedEntity.type} />
            </div>

            {/* Name and Designation */}
            <div>
              <h3 className="text-base font-bold text-white">{selectedEntity.name}</h3>
              {selectedEntity.roleOrDesignation && (
                <p className="text-xs text-blue-400 mt-0.5">{selectedEntity.roleOrDesignation}</p>
              )}
            </div>

            {/* Confidence Score */}
            <div className="bg-[#152A46] border border-[#1E3A5F] p-3 rounded-xl space-y-1.5">
              <ConfidenceBar
                value={selectedEntity.confidence}
                label="Entity Identity Confidence"
                color={selectedEntity.confidence >= 90 ? 'green' : 'amber'}
              />
            </div>

            {/* Metric Counters: Related Cases, Locations, Evidence Links */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#152A46] border border-[#1E3A5F] p-2 rounded-lg">
                <span className="text-base font-bold text-white block">
                  {selectedEntity.relatedCases}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">Cases</span>
              </div>
              <div className="bg-[#152A46] border border-[#1E3A5F] p-2 rounded-lg">
                <span className="text-base font-bold text-white block">
                  {selectedEntity.locations}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">Locations</span>
              </div>
              <div className="bg-[#152A46] border border-[#1E3A5F] p-2 rounded-lg">
                <span className="text-base font-bold text-white block">
                  {selectedEntity.evidenceLinks}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">Links</span>
              </div>
            </div>

            {/* Aliases */}
            {selectedEntity.aliases && selectedEntity.aliases.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                  Known Aliases
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEntity.aliases.map((alias) => (
                    <span
                      key={alias}
                      className="px-2 py-0.5 rounded bg-[#152A46] border border-[#1E3A5F] text-slate-300 text-xs font-mono"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Entity Key Attributes */}
            {selectedEntity.details && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                  Verified Attributes
                </span>
                <div className="bg-[#152A46] border border-[#1E3A5F] rounded-lg p-2.5 space-y-1.5 text-xs">
                  {Object.entries(selectedEntity.details).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between border-b border-[#1E3A5F]/50 pb-1 last:border-0 last:pb-0">
                      <span className="text-slate-400 capitalize">{key}:</span>
                      <span className="font-mono text-slate-200">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => navigate('/timeline')}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow"
              >
                Inspect Movement & Timeline
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="w-full py-2 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 text-xs font-medium border border-[#1E3A5F] transition-colors"
              >
                Add Entity to Investigative Dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationWorkspace;
