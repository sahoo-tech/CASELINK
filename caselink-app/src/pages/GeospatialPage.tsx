import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  AlertTriangle,
  Car,
  User,
  Zap,
  TrendingUp,
  Navigation,
  Crosshair,
  Flame,
  ArrowRight,
} from 'lucide-react';
import type { MapMarker } from '../components/map/GeospatialMap';

// ─── Lazy-loaded map (avoids SSR / Leaflet window issues) ──────────────────
const GeospatialMap = lazy(() => import('../components/map/GeospatialMap'));

// ─── Mock data ──────────────────────────────────────────────────────────────
const MOCK_MARKERS: MapMarker[] = [
  {
    id: 'c1',
    lat: 19.076,
    lng: 72.877,
    type: 'crime',
    label: 'Primary Crime Scene',
    description: 'Warehouse Zone A – armed robbery incident',
    timestamp: '2026-01-15 02:34',
  },
  {
    id: 'c2',
    lat: 19.055,
    lng: 72.893,
    type: 'crime',
    label: 'Secondary Scene',
    description: 'Vehicle abandoned near dockyard',
    timestamp: '2026-01-15 03:10',
  },
  {
    id: 'p1',
    lat: 19.092,
    lng: 72.854,
    type: 'person',
    label: 'Arjun Mehta – Last Known',
    description: 'CCTV sighting at Andheri station',
    timestamp: '2026-01-15 01:50',
  },
  {
    id: 'p2',
    lat: 19.041,
    lng: 72.865,
    type: 'person',
    label: 'Ravi Kumar – Sighting',
    description: 'Toll booth camera capture',
    timestamp: '2026-01-15 04:20',
  },
  {
    id: 'v1',
    lat: 19.083,
    lng: 72.901,
    type: 'vehicle',
    label: 'MH12AB4582',
    description: 'Flagged vehicle – 3 case appearances',
    timestamp: '2026-01-15 02:15',
  },
  {
    id: 'i1',
    lat: 19.067,
    lng: 72.842,
    type: 'incident',
    label: 'Phone Tower Ping',
    description: 'CDR record – suspect device',
    timestamp: '2026-01-15 02:40',
  },
];

const MOCK_PATHS: [number, number][][] = [
  [
    [19.092, 72.854],
    [19.083, 72.901],
    [19.076, 72.877],
    [19.055, 72.893],
  ],
  [
    [19.076, 72.877],
    [19.067, 72.842],
    [19.041, 72.865],
  ],
];

const HOTSPOTS = [
  {
    id: 'h1',
    name: 'Warehouse District',
    risk: 'CRITICAL',
    distance: '0.0 km',
    color: 'text-red-400',
    bg: 'bg-red-900/30 border-red-700/50',
  },
  {
    id: 'h2',
    name: 'Dockyard Zone',
    risk: 'HIGH',
    distance: '2.4 km',
    color: 'text-orange-400',
    bg: 'bg-orange-900/30 border-orange-700/50',
  },
  {
    id: 'h3',
    name: 'Andheri Corridor',
    risk: 'MEDIUM',
    distance: '5.1 km',
    color: 'text-amber-400',
    bg: 'bg-amber-900/30 border-amber-700/50',
  },
];

const TYPE_ICONS: Record<MapMarker['type'], React.ReactNode> = {
  crime: <AlertTriangle size={14} className="text-red-400" />,
  person: <User size={14} className="text-orange-400" />,
  vehicle: <Car size={14} className="text-blue-400" />,
  incident: <Zap size={14} className="text-amber-400" />,
};

const TYPE_DOT: Record<MapMarker['type'], string> = {
  crime: 'bg-red-500',
  person: 'bg-orange-500',
  vehicle: 'bg-blue-500',
  incident: 'bg-amber-500',
};

// ─── Reusable panel card ────────────────────────────────────────────────────
function PanelCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1E3A5F]">
        {icon && <span className="text-slate-400">{icon}</span>}
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Simple progress bar ────────────────────────────────────────────────────
function MiniBar({
  value,
  color = 'bg-blue-500',
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="w-full h-1.5 rounded-full bg-[#152A46] overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function GeospatialPage() {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 19.076, lng: 72.877 });

  const handleMarkerClick = (id: string) => {
    setSelectedMarkerId((prev) => (prev === id ? null : id));
  };

  const handleMapMove = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  const selectedMarker = MOCK_MARKERS.find((m) => m.id === selectedMarkerId) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full gap-4 p-6 bg-[#071426] overflow-hidden min-h-0"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30">
            <MapPin size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-none">
              Geospatial Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive crime mapping &amp; movement analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Case badge */}
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/50">
            CASE-2026-01482
          </span>

          {/* Coordinate display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F3A] border border-[#1E3A5F] rounded-lg">
            <Crosshair size={12} className="text-slate-500" />
            <span className="text-xs font-mono text-slate-400">
              {mapCenter.lat.toFixed(4)}°N &nbsp; {mapCenter.lng.toFixed(4)}°E
            </span>
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* LEFT: Map container (2/3 width) */}
        <div className="flex-[2] min-h-0 rounded-lg border border-[#1E3A5F] overflow-hidden bg-[#0B1F3A]"
          style={{ minHeight: 500 }}
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-slate-500 text-sm gap-2">
                <Navigation size={16} className="animate-spin" />
                Loading map…
              </div>
            }
          >
            <GeospatialMap
              markers={MOCK_MARKERS}
              paths={MOCK_PATHS}
              selectedMarkerId={selectedMarkerId}
              onMarkerClick={handleMarkerClick}
              onMapMove={handleMapMove}
            />
          </Suspense>
        </div>

        {/* RIGHT: Analysis panels (1/3 width) */}
        <div className="flex-[1] flex flex-col gap-3 overflow-y-auto min-h-0 pr-0.5">

          {/* ── Movement Analysis ── */}
          <PanelCard title="Movement Analysis" icon={<TrendingUp size={13} />}>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Distance Compatibility</span>
                  <span className="text-slate-300 font-semibold">84%</span>
                </div>
                <MiniBar value={84} color="bg-blue-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Time Compatibility</span>
                  <span className="text-slate-300 font-semibold">71%</span>
                </div>
                <MiniBar value={71} color="bg-green-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Movement Confidence</span>
                  <span className="text-amber-400 font-semibold">78%</span>
                </div>
                <MiniBar value={78} color="bg-amber-500" />
              </div>
            </div>
          </PanelCard>

          {/* ── Location Markers ── */}
          <PanelCard title="Location Markers" icon={<MapPin size={13} />}>
            <div className="space-y-2">
              {MOCK_MARKERS.map((m) => {
                const isSelected = m.id === selectedMarkerId;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleMarkerClick(m.id)}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-md text-left transition-all ${
                      isSelected
                        ? 'bg-[#152A46] border border-blue-500/50'
                        : 'hover:bg-[#152A46]/60 border border-transparent'
                    }`}
                  >
                    <span className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${TYPE_DOT[m.type]}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {TYPE_ICONS[m.type]}
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {m.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {m.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedMarker && (
              <div className="mt-3 p-2.5 rounded-md bg-blue-900/20 border border-blue-700/40 text-xs text-slate-300">
                <span className="font-semibold text-blue-300">Selected: </span>
                {selectedMarker.label} — {selectedMarker.timestamp}
              </div>
            )}
          </PanelCard>

          {/* ── Crime Hotspots ── */}
          <PanelCard title="Crime Hotspots" icon={<Flame size={13} />}>
            <div className="space-y-2">
              {HOTSPOTS.map((h) => (
                <div
                  key={h.id}
                  className={`flex items-center justify-between p-2.5 rounded-md border ${h.bg}`}
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{h.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Distance: {h.distance}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${h.color} border-current bg-black/20`}
                  >
                    {h.risk}
                  </span>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* ── Path Analysis ── */}
          <PanelCard title="Path Analysis" icon={<Navigation size={13} />}>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                  Primary Movement Path
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  {['Andheri St.', 'Flagged Vehicle', 'Warehouse A', 'Dockyard'].map(
                    (node, i, arr) => (
                      <span key={node} className="flex items-center gap-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#152A46] border border-[#1E3A5F] text-slate-300 font-mono">
                          {node}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight size={11} className="text-slate-600" />
                        )}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                  Secondary Path
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  {['Warehouse A', 'Phone Tower', 'Toll Booth'].map((node, i, arr) => (
                    <span key={node} className="flex items-center gap-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#152A46] border border-[#1E3A5F] text-slate-300 font-mono">
                        {node}
                      </span>
                      {i < arr.length - 1 && (
                        <ArrowRight size={11} className="text-slate-600" />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1 border-t border-[#1E3A5F]">
                <p className="text-[11px] text-slate-500">
                  Total estimated travel:{' '}
                  <span className="text-slate-300 font-semibold">11.3 km</span> over{' '}
                  <span className="text-slate-300 font-semibold">~38 min</span>
                </p>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </motion.div>
  );
}
