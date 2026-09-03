import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'crime' | 'person' | 'vehicle' | 'incident';
  label: string;
  description: string;
  timestamp: string;
}

interface GeospatialMapProps {
  markers: MapMarker[];
  paths: [number, number][][];
  selectedMarkerId: string | null;
  onMarkerClick: (id: string) => void;
  onMapMove?: (lat: number, lng: number) => void;
}

// ─── Color palette per marker type ─────────────────────────────────────────
const markerColors: Record<MapMarker['type'], string> = {
  crime: '#ef4444',
  person: '#f97316',
  vehicle: '#3b82f6',
  incident: '#f59e0b',
};

const markerRings: Record<MapMarker['type'], string> = {
  crime: '#fca5a5',
  person: '#fdba74',
  vehicle: '#93c5fd',
  incident: '#fcd34d',
};

// ─── Build a divIcon for a given type / selected state ──────────────────────
function buildIcon(type: MapMarker['type'], selected: boolean): L.DivIcon {
  const color = markerColors[type];
  const ring = markerRings[type];
  const size = selected ? 22 : 14;
  const totalBox = size + 20;

  const pulse = selected
    ? `<span style="
        position:absolute;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:${size + 16}px;
        height:${size + 16}px;
        background:${ring};
        border-radius:50%;
        opacity:0.4;
        animation:geoMapPulse 1.4s ease-out infinite;
      "></span>`
    : '';

  return L.divIcon({
    className: '',
    iconAnchor: [totalBox / 2, totalBox / 2],
    popupAnchor: [0, -(size / 2 + 12)],
    html: `
      <div style="
        position:relative;
        width:${totalBox}px;
        height:${totalBox}px;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        ${pulse}
        <span style="
          display:block;
          width:${size}px;
          height:${size}px;
          background:${color};
          border:2.5px solid rgba(255,255,255,0.9);
          border-radius:50%;
          box-shadow:0 2px 10px rgba(0,0,0,0.6);
          position:relative;
          z-index:1;
        "></span>
      </div>`,
  });
}

// ─── Internal hook: fires on moveend ────────────────────────────────────────
function MapEventHandler({ onMapMove }: { onMapMove?: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMapMove?.(
        parseFloat(c.lat.toFixed(5)),
        parseFloat(c.lng.toFixed(5))
      );
    },
  });
  return null;
}

// ─── Inject pulse keyframe once ─────────────────────────────────────────────
function injectPulseStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('geo-map-pulse-style')) return;
  const style = document.createElement('style');
  style.id = 'geo-map-pulse-style';
  style.textContent = `
    @keyframes geoMapPulse {
      0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.7; }
      70%  { transform: translate(-50%,-50%) scale(1.6); opacity: 0;   }
      100% { transform: translate(-50%,-50%) scale(0.5); opacity: 0;   }
    }
  `;
  document.head.appendChild(style);
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function GeospatialMap({
  markers,
  paths,
  selectedMarkerId,
  onMarkerClick,
  onMapMove,
}: GeospatialMapProps) {
  useEffect(() => {
    injectPulseStyle();

    // Fix Leaflet default icon broken by bundlers
    // @ts-expect-error _getIconUrl is an internal Leaflet property
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const center: [number, number] = [19.076, 72.877]; // Mumbai

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
    >
      {/* OpenStreetMap tile layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {/* Map event handler */}
      <MapEventHandler onMapMove={onMapMove} />

      {/* Movement path polylines (blue dashed) */}
      {paths.map((path, idx) => (
        <Polyline
          key={`path-${idx}`}
          positions={path}
          pathOptions={{
            color: '#3b82f6',
            weight: 2.5,
            opacity: 0.8,
            dashArray: '8, 6',
          }}
        />
      ))}

      {/* Markers */}
      {markers.map((m) => {
        const selected = m.id === selectedMarkerId;
        return (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={buildIcon(m.type, selected)}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{
              click: () => onMarkerClick(m.id),
            }}
          >
            <Popup closeButton={true}>
              <div style={{ minWidth: 180 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 4,
                    color: markerColors[m.type],
                  }}
                >
                  {m.label}
                </div>
                <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 4 }}>
                  {m.description}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                  {m.timestamp}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
