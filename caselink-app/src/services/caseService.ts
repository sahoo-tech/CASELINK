import { MOCK_CASES, type Case } from '../data/mockData';
import { apiRequest } from './apiClient';

interface BackendCase {
  id: string;
  case_number: string;
  title: string;
  category: string;
  location: string;
  created_date: string;
  status: string;
  priority: string;
  description: string;
  entity_count?: number;
  evidence_count?: number;
  created_by?: string;
}

function mapBackendCase(bc: BackendCase): Case {
  return {
    id: bc.id,
    caseNumber: bc.case_number || bc.id,
    title: bc.title,
    type: (bc.category as Case['type']) || 'Organized Financial Crime',
    location: bc.location,
    status: (bc.status as Case['status']) || 'Active',
    priority: (bc.priority as Case['priority']) || 'Medium',
    investigator: bc.created_by || 'ACP Vikram Sharma',
    assignedUnit: 'Investigation Unit A',
    created: bc.created_date ? new Date(bc.created_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
    lastUpdated: 'Live Backend',
    description: bc.description || '',
    evidenceCounts: {
      documents: bc.evidence_count || 1,
      persons: 2,
      vehicles: 1,
      locations: 1,
      transactions: 2,
    },
    entityCount: bc.entity_count || 5,
  };
}

export const caseService = {
  getCases: async (): Promise<Case[]> => {
    try {
      const data = await apiRequest<BackendCase[]>('/cases');
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapBackendCase);
      }
      return [...MOCK_CASES];
    } catch (err) {
      console.warn('Backend /cases failed, falling back to local mock:', err);
      return [...MOCK_CASES];
    }
  },

  getCaseById: async (id: string): Promise<Case | null> => {
    try {
      const data = await apiRequest<BackendCase>(`/cases/${id}`);
      return mapBackendCase(data);
    } catch (err) {
      console.warn(`Backend /cases/${id} failed, using local mock:`, err);
      return MOCK_CASES.find((c) => c.id === id || c.caseNumber === id) || null;
    }
  },

  createCase: async (data: Partial<Case>): Promise<Case> => {
    try {
      const res = await apiRequest<{ case_id: string; case_number: string }>('/cases/create', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title || 'Untitled Investigation',
          category: data.type || 'Organized Financial Crime',
          location: data.location || 'Mumbai',
          priority: data.priority || 'Medium',
          description: data.description || 'Newly created investigation file.',
        }),
      });

      const newCase: Case = {
        id: res.case_id,
        caseNumber: res.case_number,
        title: data.title || 'Untitled Investigation',
        type: data.type || 'Organized Financial Crime',
        location: data.location || 'Mumbai',
        status: 'Active',
        priority: data.priority || 'Medium',
        investigator: data.investigator || 'ACP Vikram Sharma',
        assignedUnit: data.assignedUnit || 'Investigation Unit A',
        created: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        lastUpdated: 'Just now',
        description: data.description || '',
        evidenceCounts: { documents: 0, persons: 0, vehicles: 0, locations: 0, transactions: 0 },
        entityCount: 0,
      };
      MOCK_CASES.unshift(newCase);
      return newCase;
    } catch (err) {
      console.warn('Backend case creation failed, creating locally:', err);
      const newCase: Case = {
        id: `case-${Date.now().toString(36)}`,
        caseNumber: `CASE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        title: data.title || 'Untitled Investigation',
        type: data.type || 'Organized Financial Crime',
        location: data.location || 'Mumbai, MH',
        status: 'Active',
        priority: data.priority || 'Medium',
        investigator: data.investigator || 'Inspector Rahul Sharma',
        assignedUnit: data.assignedUnit || 'Investigation Unit A',
        created: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        lastUpdated: 'Just now',
        description: data.description || '',
        evidenceCounts: { documents: 0, persons: 0, vehicles: 0, locations: 0, transactions: 0 },
        entityCount: 0,
      };
      MOCK_CASES.unshift(newCase);
      return newCase;
    }
  },

  updateCaseStatus: async (id: string, status: Case['status']): Promise<Case> => {
    try {
      await apiRequest(`/cases/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('Backend update failed, updating locally:', err);
    }
    const item = MOCK_CASES.find((c) => c.id === id);
    if (item) item.status = status;
    return item || MOCK_CASES[0];
  },

  getCaseStats: async () => {
    const cases = await caseService.getCases();
    const active = cases.filter((c) => c.status === 'Active').length;
    return {
      activeCases: active,
      connectedEvidence: 18542,
      entitiesLinked: 12480,
      generatedLeads: 37,
    };
  },
};

export default caseService;
