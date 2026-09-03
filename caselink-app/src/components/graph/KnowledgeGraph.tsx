import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
}> = ({ label, subtitle, confidence, icon, borderColor, glowColor, bgGradient, selected }) => (
  <div
    className={`px-3 py-2 rounded-xl border ${borderColor} ${bgGradient} text-white shadow-xl transition-all duration-200 cursor-pointer min-w-[150px] ${
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
        {subtitle && <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>}
      </div>
      {confidence && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300 font-semibold">
          {confidence}%
        </span>
      )}
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
  />
);

const nodeTypes = {
  personNode: PersonNode,
  vehicleNode: VehicleNode,
  locationNode: LocationNode,
  orgNode: OrgNode,
  eventNode: EventNode,
  caseNode: CaseNode,
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
  const [detailedGraph, setDetailedGraph] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

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
      }
    }).catch((err) => {
      console.warn('Could not load live graph:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedEntityId]);

  // Switch between Primary (Curated) and Detailed (Backend Multi-Case) graph views
  const switchGraphMode = (mode: 'PRIMARY' | 'DETAILED') => {
    setGraphMode(mode);
    if (mode === 'PRIMARY') {
      setNodes(buildPrimaryNodes());
      setEdges(initialEdges);
    } else if (mode === 'DETAILED') {
      if (detailedGraph) {
        setNodes(detailedGraph.nodes);
        setEdges(detailedGraph.edges);
      } else {
        // Fetch on demand if not yet loaded
        graphService.getGraphData().then((data) => {
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
            setNodes(liveNodes);
            setEdges(liveEdges);
            setDetailedGraph({ nodes: liveNodes, edges: liveEdges });
          }
        });
      }
    }
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
        >
          <Background color="#152A46" gap={24} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-[#0B1F3A] !border-[#1E3A5F] !rounded-lg overflow-hidden [&>button]:!bg-[#0B1F3A] [&>button]:!border-[#1E3A5F] [&>button]:!text-slate-300" />
          <MiniMap
            className="!bg-[#0B1F3A] !border !border-[#1E3A5F] !rounded-lg"
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
        </ReactFlow>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
