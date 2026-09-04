import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Handle,
  Position,
  type NodeProps,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  User,
  Car,
  MapPin,
  Building2,
  Calendar,
  FolderOpen,
  Filter,
  Info,
  Network,
  Layers,
  FileText,
  Activity,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MOCK_GRAPH_NODES, MOCK_GRAPH_EDGES } from '../../data/mockData';
import { graphService } from '../../services/graphService';

// ── Custom Node Components ──────────────────────────────────────────────────

const BaseNode: React.FC<{
  label: string;
  subtitle?: string;
  confidence?: number;
  icon: React.ReactNode;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  selected?: boolean;
  isCrossCase?: boolean;
}> = ({ label, subtitle, confidence, icon, borderColor, glowColor, bgGradient, selected, isCrossCase }) => (
  <div
    className={`px-3 py-2 rounded-xl border ${
      isCrossCase ? 'border-amber-400/80 ring-1 ring-amber-400/40 shadow-amber-500/20' : borderColor
    } ${bgGradient} text-white shadow-xl transition-all duration-200 cursor-pointer min-w-[165px] ${
      selected ? `ring-2 ${glowColor} scale-105` : 'hover:scale-[1.03]'
    }`}
  >
    <Handle type="target" position={Position.Top} className="!bg-[#254D7A] !w-2 !h-2" />
    <Handle type="source" position={Position.Bottom} className="!bg-[#254D7A] !w-2 !h-2" />
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold truncate text-slate-100">{label}</p>
        {subtitle && (
          <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            {isCrossCase && (
              <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold tracking-tight">
                LINK
              </span>
            )}
            <span>{subtitle}</span>
          </p>
        )}
      </div>
      {confidence ? (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300 font-semibold shrink-0">
          {confidence}%
        </span>
      ) : null}
    </div>
  </div>
);

const PersonNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseNode
    label={data.label as string}
    subtitle={data.subtitle as string}
    confidence={data.confidence as number}
    icon={<User className="w-3.5 h-3.5 text-orange-400" />}
    borderColor="border-orange-500/50"
    glowColor="ring-orange-500"
    bgGradient="bg-gradient-to-br from-[#1c1917] to-[#0B1F3A]"
    selected={selected}
    isCrossCase={Boolean(data.isCrossCase)}
  />
);

const VehicleNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseNode
    label={data.label as string}
    subtitle={data.subtitle as string}
    confidence={data.confidence as number}
    icon={<Car className="w-3.5 h-3.5 text-blue-400" />}
    borderColor="border-blue-500/50"
    glowColor="ring-blue-500"
    bgGradient="bg-gradient-to-br from-[#082f49] to-[#0B1F3A]"
    selected={selected}
    isCrossCase={Boolean(data.isCrossCase)}
  />
);

const LocationNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseNode
    label={data.label as string}
    subtitle={data.subtitle as string}
    confidence={data.confidence as number}
    icon={<MapPin className="w-3.5 h-3.5 text-green-400" />}
    borderColor="border-green-500/50"
    glowColor="ring-green-500"
    bgGradient="bg-gradient-to-br from-[#064e3b] to-[#0B1F3A]"
    selected={selected}
    isCrossCase={Boolean(data.isCrossCase)}
  />
);

const OrgNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseNode
    label={data.label as string}
    subtitle={data.subtitle as string}
    confidence={data.confidence as number}
    icon={<Building2 className="w-3.5 h-3.5 text-purple-400" />}
    borderColor="border-purple-500/50"
    glowColor="ring-purple-500"
    bgGradient="bg-gradient-to-br from-[#3b0764] to-[#0B1F3A]"
    selected={selected}
    isCrossCase={Boolean(data.isCrossCase)}
  />
);

const EventNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseNode
    label={data.label as string}
    subtitle={data.subtitle as string}
    confidence={data.confidence as number}
    icon={<Calendar className="w-3.5 h-3.5 text-amber-400" />}
    borderColor="border-amber-500/50"
    glowColor="ring-amber-500"
    bgGradient="bg-gradient-to-br from-[#451a03] to-[#0B1F3A]"
    selected={selected}
    isCrossCase={Boolean(data.isCrossCase)}
  />
);

const CaseNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseNode
    label={data.label as string}
    subtitle={data.subtitle as string}
    confidence={data.confidence as number}
    icon={<FolderOpen className="w-3.5 h-3.5 text-red-400" />}
    borderColor="border-red-500/50"
    glowColor="ring-red-500"
    bgGradient="bg-gradient-to-br from-[#450a0a] to-[#0B1F3A]"
    selected={selected}
    isCrossCase={Boolean(data.isCrossCase)}
  />
);

const DocumentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <BaseNode
    label={data.label as string}
    subtitle={data.subtitle as string}
    confidence={data.confidence as number}
    icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}
    borderColor="border-slate-500/50"
    glowColor="ring-slate-400"
    bgGradient="bg-gradient-to-br from-[#1e293b] to-[#0B1F3A]"
    selected={selected}
    isCrossCase={Boolean(data.isCrossCase)}
  />
);

const nodeTypes = {
  personNode: PersonNode,
  vehicleNode: VehicleNode,
  locationNode: LocationNode,
  orgNode: OrgNode,
  eventNode: EventNode,
  caseNode: CaseNode,
  documentNode: DocumentNode,
};

interface KnowledgeGraphProps {
  onSelectEntity?: (entityId: string) => void;
  selectedEntityId?: string | null;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  onSelectEntity,
  selectedEntityId,
}) => {
  const [graphMode, setGraphMode] = useState<'PRIMARY' | 'DETAILED'>('PRIMARY');
  const initialDetailed = useMemo(() => graphService.getDetailedFallback(), []);
  const [detailedGraph, setDetailedGraph] = useState<{ nodes: any[]; edges: any[] }>(initialDetailed);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [showHUDDetails, setShowHUDDetails] = useState<boolean>(true);
  const rfInstance = useRef<any>(null);

  const buildPrimaryNodes = useCallback(() => {
    return MOCK_GRAPH_NODES.map((node) => ({
      ...node,
      selected:
        Boolean(selectedEntityId) &&
        (selectedEntityId === node.id ||
          node.data.label.toString().toLowerCase().includes(String(selectedEntityId).toLowerCase())),
    }));
  }, [selectedEntityId]);

  const initialEdges: Edge[] = useMemo(() => {
    return MOCK_GRAPH_EDGES.map((edge) => ({
      ...edge,
      label: edge.label,
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 600, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#0B1F3A', fillOpacity: 0.85 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
      style: { stroke: '#254D7A', strokeWidth: 1.5 },
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>(buildPrimaryNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Load live detailed graph data from backend
  useEffect(() => {
    let isMounted = true;
    graphService.getGraphData().then((data) => {
      if (!isMounted) return;
      if (data && data.nodes && data.nodes.length > 0) {
        const liveNodes = data.nodes.map((node: any) => ({
          ...node,
          selected:
            Boolean(selectedEntityId) &&
            (selectedEntityId === node.id ||
              node.data?.label?.toString().toLowerCase().includes(String(selectedEntityId).toLowerCase())),
        }));

        const liveEdges = data.edges.map((edge: any) => ({
          ...edge,
          labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 600, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#0B1F3A', fillOpacity: 0.85 },
          labelBgPadding: [6, 3] as [number, number],
          labelBgBorderRadius: 4,
          style: { stroke: edge.animated ? '#f59e0b' : '#254D7A', strokeWidth: edge.animated ? 2.5 : 1.5 },
        }));

        setDetailedGraph({ nodes: liveNodes, edges: liveEdges });

        // If currently in detailed view, update nodes immediately
        if (graphMode === 'DETAILED') {
          setNodes(liveNodes);
          setEdges(liveEdges);
        }
      }
    }).catch((err) => {
      console.warn('Could not load live graph:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedEntityId, graphMode, setNodes, setEdges]);

  // Switch between Primary (Curated) and Detailed (Backend Multi-Case) graph views
  const switchGraphMode = (mode: 'PRIMARY' | 'DETAILED') => {
    setGraphMode(mode);
    if (mode === 'PRIMARY') {
      setNodes(buildPrimaryNodes());
      setEdges(initialEdges);
    } else if (mode === 'DETAILED') {
      const target = detailedGraph || initialDetailed;
      setNodes(target.nodes);
      setEdges(target.edges);
    }
    setTimeout(() => {
      rfInstance.current?.fitView({ padding: 0.18, duration: 400 });
    }, 60);
  };

  // Synchronize external entity selection
  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        selected:
          Boolean(selectedEntityId) &&
          (selectedEntityId === node.id ||
            node.data?.label?.toString().toLowerCase().includes(String(selectedEntityId).toLowerCase())),
      }))
    );
  }, [selectedEntityId, setNodes]);

  // Filter nodes based on entity type
  const visibleNodes = useMemo(() => {
    if (filterType === 'ALL') return nodes;
    return nodes.filter((n) => {
      const type = (n.data.entityType as string)?.toUpperCase();
      return type === filterType;
    });
  }, [nodes, filterType]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onSelectEntity) {
        onSelectEntity(node.data.label as string);
      }
    },
    [onSelectEntity]
  );

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-[#071426] select-none">
      {/* ── Graph Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0B1F3A]/95 backdrop-blur border-b border-[#1E3A5F] z-10 text-xs shrink-0">
        {/* View Mode Toggle: Primary vs Detailed */}
        <div className="flex items-center gap-1 bg-[#152A46] p-1 rounded-lg border border-[#1E3A5F]">
          <button
            onClick={() => switchGraphMode('PRIMARY')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all ${
              graphMode === 'PRIMARY'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Primary Case View</span>
          </button>

          <button
            onClick={() => switchGraphMode('DETAILED')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all ${
              graphMode === 'DETAILED'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Detailed Multi-Case Network {detailedGraph ? `(${detailedGraph.nodes.length} nodes)` : ''}</span>
          </button>
        </div>

        {/* Filter Nodes */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            Filter:
          </span>
          {['ALL', 'PERSON', 'VEHICLE', 'LOCATION', 'ORGANIZATION', 'EVENT'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                filterType === t
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-[#152A46] text-slate-300 hover:text-white hover:bg-[#1E3A5F]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Right Info Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-[#152A46] px-2.5 py-1 rounded border border-[#1E3A5F]">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Click any node to inspect profile</span>
          </div>
        </div>
      </div>

      {/* ── React Flow Canvas (Explicit min-height and full flex bounds) ── */}
      <div className="flex-1 w-full min-h-[450px] h-full relative overflow-hidden">
        <ReactFlow
          onInit={(instance) => {
            rfInstance.current = instance;
          }}
          nodes={visibleNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2.5}
          defaultEdgeOptions={{ animated: true }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#152A46" gap={24} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-[#0B1F3A] !border-[#1E3A5F] !rounded-lg overflow-hidden [&>button]:!bg-[#0B1F3A] [&>button]:!border-[#1E3A5F] [&>button]:!text-slate-300" />
          
          {/* ── React Flow Native MiniMap (Positioned at bottom: 12px, right: 12px) ── */}
          {showMiniMap && (
            <MiniMap
              className="!bg-[#0B1F3A]/95 !border !border-[#1E3A5F] !rounded-lg !shadow-2xl !m-0"
              style={{ width: 180, height: 105, position: 'absolute', right: 12, bottom: 12 }}
              nodeColor={(n) => {
                switch (n.data?.entityType) {
                  case 'Person':
                    return '#f97316';
                  case 'Vehicle':
                    return '#3b82f6';
                  case 'Location':
                    return '#22c55e';
                  case 'Organization':
                    return '#a855f7';
                  case 'Event':
                    return '#f59e0b';
                  default:
                    return '#ef4444';
                }
              }}
            />
          )}

          {/* ── Useful Telemetry & Legend HUD (Positioned cleanly ABOVE MiniMap with ZERO overlap) ── */}
          <div
            className="absolute right-3 z-10 select-none transition-all duration-200 pointer-events-auto"
            style={{ bottom: showMiniMap ? '126px' : '12px' }}
          >
            <div className="bg-[#0B1F3A]/95 backdrop-blur border border-[#1E3A5F] rounded-lg p-2.5 text-[10px] space-y-1.5 shadow-2xl min-w-[210px]">
              <div className="flex items-center justify-between border-b border-[#1E3A5F]/70 pb-1 gap-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-blue-400" />
                  Graph Telemetry
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-blue-400 font-bold bg-[#152A46] px-1.5 py-0.5 rounded border border-[#1E3A5F]">
                    {visibleNodes.length}N · {edges.length}E
                  </span>
                  <button
                    onClick={() => setShowMiniMap(!showMiniMap)}
                    className="p-1 rounded hover:bg-[#152A46] text-slate-400 hover:text-white transition-colors"
                    title={showMiniMap ? 'Hide MiniMap thumbnail' : 'Show MiniMap thumbnail'}
                  >
                    {showMiniMap ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-blue-400" />}
                  </button>
                  <button
                    onClick={() => setShowHUDDetails(!showHUDDetails)}
                    className="p-1 rounded hover:bg-[#152A46] text-slate-400 hover:text-white transition-colors"
                    title={showHUDDetails ? 'Collapse Legend' : 'Expand Legend'}
                  >
                    {showHUDDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Quick Glance Color Legend (Collapsible) */}
              {showHUDDetails && (
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 text-[9px] text-slate-300 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <span>Suspect / Person</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span>Vehicle (RTO)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span>Location / Hub</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span>Organization</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Incident / Event</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <span className="text-amber-300 font-semibold">Cross-Case Link</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ReactFlow>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
