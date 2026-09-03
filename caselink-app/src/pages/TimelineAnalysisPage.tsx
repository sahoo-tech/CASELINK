import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Filter,
  Calendar,
  MapPin,
  Car,
  User,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { MOCK_TIMELINE_EVENTS, type TimelineEvent } from '../data/mockData';

const eventTypeIcons: Record<string, React.ReactNode> = {
  Vehicle: <Car className="w-4 h-4 text-blue-400" />,
  Person: <User className="w-4 h-4 text-orange-400" />,
  Financial: <DollarSign className="w-4 h-4 text-amber-400" />,
  Location: <MapPin className="w-4 h-4 text-green-400" />,
  Incident: <AlertTriangle className="w-4 h-4 text-red-400" />,
};

const eventTypeBorders: Record<string, string> = {
  Vehicle: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  Person: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
  Financial: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  Location: 'border-green-500/50 bg-green-500/10 text-green-400',
  Incident: 'border-red-500/50 bg-red-500/10 text-red-400',
};

const TimelineAnalysisPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_TIMELINE_EVENTS[5].id); // Feb 15 event by default

  const filteredEvents = useMemo(() => {
    if (filterType === 'All') return MOCK_TIMELINE_EVENTS;
    return MOCK_TIMELINE_EVENTS.filter((e) => e.eventType === filterType);
  }, [filterType]);

  const selectedEvent =
    MOCK_TIMELINE_EVENTS.find((e) => e.id === selectedEventId) || MOCK_TIMELINE_EVENTS[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">Timeline & Temporal Analysis</h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              TEMPORAL CORRELATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chronological reconstruction of telemetry, sensor logs, wire transfers, and surveillance hits.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0B1F3A] border border-[#1E3A5F] px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Span: 10 Jan 2026 — 02 Mar 2026 (51 Days)</span>
        </div>
      </div>

      {/* ── Filter Strip ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1F3A] border border-[#1E3A5F] p-3 rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            Filter Stream:
          </span>
          {['All', 'Person', 'Vehicle', 'Financial', 'Location', 'Incident'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-[#152A46] text-slate-300 hover:text-white hover:bg-[#1E3A5F]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400">
          Showing <span className="text-white font-bold">{filteredEvents.length}</span> temporal checkpoints
        </div>
      </div>

      {/* ── Horizontal Interactive Timeline ─────────────────── */}
      <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" />
            Sequential Event Ribbon
          </span>
          <span className="text-[11px] text-slate-500 italic">
            Scroll horizontally to navigate temporal checkpoints
          </span>
        </div>

        {/* Scrollable track */}
        <div className="overflow-x-auto pb-4 pt-6 scrollbar-thin">
          <div className="relative min-w-[1000px] flex items-center justify-between px-6">
            {/* Base Horizontal Track Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-900 via-blue-500 to-purple-600 opacity-60 rounded-full" />

            {filteredEvents.map((evt, idx) => {
              const isSelected = evt.id === selectedEventId;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group px-2"
                >
                  {/* Top card for even elements */}
                  {isEven ? (
                    <motion.div
                      whileHover={{ y: -4 }}
                      className={`mb-4 w-44 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#152A46] border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'bg-[#0B1F3A]/90 border-[#1E3A5F] group-hover:border-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                        {evt.dateLabel}
                      </span>
                      <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {evt.title}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                            eventTypeBorders[evt.eventType] || 'border-slate-500'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-24 w-44 invisible" />
                  )}

                  {/* Center Node Dot on Line */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-500 border-white scale-125 shadow-lg shadow-blue-500/50'
                        : 'bg-[#0B1F3A] border-blue-500/60 group-hover:scale-110'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Bottom card for odd elements */}
                  {!isEven ? (
                    <motion.div
                      whileHover={{ y: 4 }}
                      className={`mt-4 w-44 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#152A46] border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'bg-[#0B1F3A]/90 border-[#1E3A5F] group-hover:border-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                        {evt.dateLabel}
                      </span>
                      <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {evt.title}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                            eventTypeBorders[evt.eventType] || 'border-slate-500'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-24 w-44 invisible" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Two-Column Bottom View: Event Detail & Movement Tracking ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Event Full Dossier */}
        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#152A46] border border-[#1E3A5F]">
                {eventTypeIcons[selectedEvent.eventType]}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Temporal Checkpoint Detail
                </span>
                <span className="font-mono text-xs text-blue-400 font-semibold">
                  {selectedEvent.dateLabel}
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                eventTypeBorders[selectedEvent.eventType]
              }`}
            >
              {selectedEvent.eventType}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white leading-snug">{selectedEvent.title}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-[#152A46]/60 p-3 rounded-lg border border-[#1E3A5F]">
              {selectedEvent.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#152A46] p-2.5 rounded-lg border border-[#1E3A5F]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Geographic Fix</span>
              <div className="flex items-center gap-1 text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span className="truncate">{selectedEvent.location}</span>
              </div>
            </div>

            <div className="bg-[#152A46] p-2.5 rounded-lg border border-[#1E3A5F]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Investigative Significance</span>
              <span
                className={`font-semibold ${
                  selectedEvent.significance === 'High'
                    ? 'text-red-400'
                    : selectedEvent.significance === 'Medium'
                    ? 'text-amber-400'
                    : 'text-green-400'
                }`}
              >
                {selectedEvent.significance} Priority
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
              Correlated Entities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedEvent.relatedEntities.map((ent) => (
                <span
                  key={ent}
                  className="px-2.5 py-1 rounded bg-[#152A46] border border-[#1E3A5F] text-slate-200 text-xs font-mono"
                >
                  {ent}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Movement Pattern / Route Reconstruction */}
        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-4 h-4 text-blue-400" />
              Movement Sequence Tracking
            </span>
            <span className="text-[11px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">
              Pattern Match: 94%
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Reconstructed sequence showing person and vehicle trajectories preceding the cash handover incident.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#152A46]/80 border border-[#1E3A5F]">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                1
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-bold text-white block">Origin: Horizon Exports HQ</span>
                <span className="text-slate-400 text-[11px]">Nariman Point, 01:15 AM · Dispatched</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#152A46]/80 border border-[#1E3A5F]">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                2
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-bold text-white block">Transit: Bhiwandi Bypass Toll</span>
                <span className="text-slate-400 text-[11px]">FASTag MH12AB4582 scanned at 02:22 AM</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#152A46]/80 border border-[#1E3A5F]">
              <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                3
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-bold text-white block">Staging: Warehouse Zone A</span>
                <span className="text-slate-400 text-[11px]">Vehicle parked inside for 38 minutes</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-950/20 border border-red-800/40">
              <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                4
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-bold text-red-300 block">Incident: Cash Handover Unit B</span>
                <span className="text-slate-400 text-[11px]">Dharavi Compound, 03:15 AM · ₹1.85 Cr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineAnalysisPage;
