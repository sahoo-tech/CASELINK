import {
  MOCK_ENTITIES,
  MOCK_GRAPH_NODES,
  MOCK_GRAPH_EDGES,
  type Entity,
} from '../data/mockData';
import { apiRequest } from './apiClient';

interface BackendGraphResponse {
  nodes: {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      label: string;
      entityType: string;
      confidence?: number;
      isCrossCase?: boolean;
      metadata?: Record<string, any>;
    };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label: string;
    animated?: boolean;
    data?: {
      isCrossCase?: boolean;
    };
  }[];
}

export const graphService = {
  getGraphData: async (caseId: string = 'case-001') => {
    try {
      const data = await apiRequest<BackendGraphResponse>(`/graph/${caseId}`);
      if (data && data.nodes && data.nodes.length > 0) {
        // Map backend nodes to frontend KnowledgeGraph node format
        const nodes = data.nodes.map((n) => {
          let nodeType = 'personNode';
          const t = (n.data?.entityType || '').toLowerCase();
          if (t === 'person') nodeType = 'personNode';
          else if (t === 'vehicle') nodeType = 'vehicleNode';
          else if (t === 'location') nodeType = 'locationNode';
          else if (t === 'organization') nodeType = 'orgNode';
          else if (t === 'event') nodeType = 'eventNode';
          else if (t === 'case') nodeType = 'caseNode';

          return {
            id: n.id,
            type: nodeType,
            position: n.position || { x: Math.random() * 600, y: Math.random() * 400 },
            data: {
              label: n.data.label,
              entityType: n.data.entityType,
              confidence: Math.round((n.data.confidence || 0.9) * 100),
              subtitle: n.data.isCrossCase ? 'Cross-Case Link' : (n.data.metadata?.role || n.data.entityType),
            },
          };
        });

        const edges = data.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: Boolean(e.animated || e.data?.isCrossCase),
        }));

        return { nodes, edges };
      }
      return {
        nodes: [...MOCK_GRAPH_NODES],
        edges: [...MOCK_GRAPH_EDGES],
      };
    } catch (err) {
      console.warn('Backend graph fetch failed, using local mock:', err);
      return {
        nodes: [...MOCK_GRAPH_NODES],
        edges: [...MOCK_GRAPH_EDGES],
      };
    }
  },

  getEntities: async (caseId?: string): Promise<Entity[]> => {
    try {
      if (caseId) {
        const data = await apiRequest<any[]>(`/entities/${caseId}`);
        if (Array.isArray(data) && data.length > 0) {
          return data.map((e) => ({
            id: e.id,
            name: e.name,
            type: e.type,
            confidence: Math.round((e.confidence_score || 0.9) * 100),
            aliases: e.extra_metadata?.aliases || [],
            relatedCases: 1,
            locations: 1,
            evidenceLinks: 2,
            details: e.extra_metadata || {},
            roleOrDesignation: e.extra_metadata?.role || e.type,
          }));
        }
      }
      return [...MOCK_ENTITIES];
    } catch (err) {
      console.warn('Backend /entities failed, using local mock:', err);
      return [...MOCK_ENTITIES];
    }
  },

  getEntityById: async (id: string): Promise<Entity | null> => {
    return MOCK_ENTITIES.find((e) => e.id === id || e.name.toLowerCase().includes(id.toLowerCase())) || null;
  },

  extractEntitiesFromText: async (text: string, caseId: string = 'case-001') => {
    return apiRequest<{
      entities: { name: string; type: string; confidence: number }[];
      extraction_summary: { total_entities: number };
    }>('/entities/extract', {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, text }),
    });
  },
};

export default graphService;
