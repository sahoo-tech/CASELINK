import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ExternalLink,
  Maximize2,
  Minimize2,
  FolderOpen,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Layers,
} from 'lucide-react';
import KnowledgeGraph from '../components/graph/KnowledgeGraph';
import ConfidenceBar from '../components/ui/ConfidenceBar';
import EntityBadge from '../components/ui/EntityBadge';
import { StatusBadge, PriorityBadge } from '../components/common/Badges';
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
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);

  const isMaximized = !leftPanelOpen && !rightPanelOpen;

  const toggleMaximize = () => {
    if (isMaximized) {
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
    } else {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
    }
  };

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
    if (!rightPanelOpen) {
      setRightPanelOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-[#071426]">
      {/* ── Top Workspace Action Bar ────────────────────────── */}
      <div className="h-11 px-3 md:px-4 bg-[#0B1F3A] border-b border-[#1E3A5F] flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2">
          {/* Quick Left Panel Toggle */}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className={`p-1.5 rounded transition-colors ${
              leftPanelOpen
                ? 'bg-[#152A46] text-blue-400 hover:text-white border border-[#1E3A5F]'
                : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/40'
            }`}
            title={leftPanelOpen ? 'Hide Case Details Panel' : 'Show Case Details Panel'}
          >
            {leftPanelOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
          </button>

          <span className="font-mono text-blue-400 font-bold tracking-wider">
            {currentCase.caseNumber}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-300 font-medium truncate max-w-xs hidden md:inline">
            {currentCase.title}
          </span>
          <span className="hidden lg:inline-block px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-semibold text-[10px]">
            ACTIVE INTELLIGENCE
          </span>
        </div>

        {/* Action Center Buttons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Maximize / Focus Mode Toggle Button */}
          <button
            onClick={toggleMaximize}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              isMaximized
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 hover:text-white border border-[#1E3A5F]'
            }`}
            title={isMaximized ? 'Restore Side Panels' : 'Full Canvas Focus Mode (100% Graph Space)'}
          >
            {isMaximized ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restore Panels</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Full Canvas (100%)</span>
              </>
            )}
          </button>

          {/* AI Reasoning Matrix Toggle */}
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              showAIPanel
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#152A46] text-slate-300 hover:text-white border border-[#1E3A5F]'
            }`}
            title="Toggle AI Heuristic Reasoning"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Reasoning</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          </button>

          <button
            onClick={() => navigate('/timeline')}
            className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 text-xs border border-[#1E3A5F] transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Timeline
          </button>

          <button
            onClick={() => navigate('/geospatial')}
            className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 text-xs border border-[#1E3A5F] transition-colors"
          >
            <Map className="w-3.5 h-3.5 text-green-400" />
            Geospatial
          </button>

          <button
            onClick={() => navigate('/hypothesis')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-medium transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hypotheses</span>
          </button>

          {/* Quick Right Panel Toggle */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`p-1.5 rounded transition-colors ${
              rightPanelOpen
                ? 'bg-[#152A46] text-blue-400 hover:text-white border border-[#1E3A5F]'
                : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/40'
            }`}
            title={rightPanelOpen ? 'Hide Entity Inspector' : 'Show Entity Inspector'}
          >
            {rightPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Main 3-Panel Workspace Body ─────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden w-full relative">
        {/* ── LEFT PANEL: Case Information & Evidence Summary ─ */}
        {leftPanelOpen ? (
          <div className="w-72 md:w-80 bg-[#0B1F3A] border-r border-[#1E3A5F] flex flex-col shrink-0 overflow-y-auto transition-all duration-200 select-none">
            {/* Case Details Block Header with Collapse button */}
            <div className="p-3.5 border-b border-[#1E3A5F] flex items-center justify-between bg-[#08182D]">
              <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                Case File Details
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status={currentCase.status} />
                <button
                  onClick={() => setLeftPanelOpen(false)}
                  className="p-1 rounded hover:bg-[#152A46] text-slate-400 hover:text-white transition-colors"
                  title="Collapse Case Details Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-[#1E3A5F] space-y-3">
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
        ) : (
          /* ── LEFT MINI DOCK (Useful glanceable summary when collapsed) ── */
          <div
            onClick={() => setLeftPanelOpen(true)}
            className="w-11 bg-[#0B1F3A] border-r border-[#1E3A5F] flex flex-col items-center py-3 shrink-0 cursor-pointer hover:bg-[#0E2545] transition-all select-none space-y-4 group z-20"
            title="Click to expand Case Details Panel"
          >
            <button
              className="p-1 rounded-lg bg-[#152A46] group-hover:bg-blue-600 text-slate-300 group-hover:text-white border border-[#1E3A5F] transition-all shadow"
              title="Expand Case Details"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Vertical Case Tag */}
            <div className="py-2 flex items-center justify-center">
              <span className="[writing-mode:vertical-rl] text-[10px] font-mono font-bold tracking-wider text-blue-400 rotate-180">
                {currentCase.caseNumber}
              </span>
            </div>

            <div className="w-5 h-px bg-[#1E3A5F]" />

            {/* Useful Glanceable Counters in Mini Section */}
            <div className="space-y-3 text-center">
              <div className="flex flex-col items-center gap-0.5" title="87 Documents mapped">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-white leading-none">{currentCase.evidenceCounts.documents}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5" title="12 Persons involved">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] font-bold text-white leading-none">{currentCase.evidenceCounts.persons}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5" title="6 Vehicles identified">
                <Car className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-bold text-white leading-none">{currentCase.evidenceCounts.vehicles}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5" title="8 Locations mapped">
                <MapPin className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] font-bold text-white leading-none">{currentCase.evidenceCounts.locations}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5" title="₹14.8 Cr Transacted">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-bold text-amber-300 leading-none">₹14.8</span>
              </div>
            </div>
          </div>
        )}

        {/* ── CENTER PANEL: Dynamic Knowledge Graph (Maximizes to 100% space) ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[500px] h-full relative overflow-hidden">
          <KnowledgeGraph
            onSelectEntity={handleSelectNode}
            selectedEntityId={selectedEntity.name}
          />
        </div>

        {/* ── RIGHT PANEL: Entity Profile & AI Reasoning ────── */}
        {rightPanelOpen ? (
          <div className="w-80 md:w-96 bg-[#0B1F3A] border-l border-[#1E3A5F] flex flex-col shrink-0 overflow-y-auto transition-all duration-200 select-none">
            {/* Header with Collapse Button */}
            <div className="p-3 border-b border-[#1E3A5F] flex items-center justify-between bg-[#08182D]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="p-1 rounded hover:bg-[#152A46] text-slate-400 hover:text-white transition-colors"
                  title="Collapse Entity Inspector Panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  Entity Inspector
                </span>
              </div>
              <EntityBadge type={selectedEntity.type} />
            </div>

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
        ) : (
          /* ── RIGHT MINI DOCK (Glanceable Entity summary when collapsed) ── */
          <div
            onClick={() => setRightPanelOpen(true)}
            className="w-11 bg-[#0B1F3A] border-l border-[#1E3A5F] flex flex-col items-center py-3 shrink-0 cursor-pointer hover:bg-[#0E2545] transition-all select-none space-y-4 group z-20"
            title="Click to expand Entity Inspector Panel"
          >
            <button
              className="p-1 rounded-lg bg-[#152A46] group-hover:bg-purple-600 text-slate-300 group-hover:text-white border border-[#1E3A5F] transition-all shadow"
              title="Expand Entity Inspector"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Entity Avatar / Initial */}
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-[10px] font-bold text-blue-300">
              {selectedEntity.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Confidence Mini Tag */}
            <div className="flex flex-col items-center" title={`Identity Confidence: ${selectedEntity.confidence}%`}>
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                {selectedEntity.confidence}%
              </span>
              <span className="text-[7px] text-slate-500 uppercase">CONF</span>
            </div>

            <div className="w-5 h-px bg-[#1E3A5F]" />

            {/* AI Indicator */}
            <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400" title="AI Lead Analysis Active">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
            </div>

            {/* Vertical Label */}
            <div className="py-2 flex items-center justify-center flex-1">
              <span className="[writing-mode:vertical-rl] text-[10px] font-medium tracking-wider text-slate-400 rotate-180 truncate max-h-36">
                {selectedEntity.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestigationWorkspace;
