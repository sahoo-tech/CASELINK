import { MOCK_LEADS, type Lead } from '../data/mockData';
import { apiRequest } from './apiClient';

interface BackendLead {
  hypothesis_id: string;
  hypothesis: string;
  lead_priority: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  reasoning: string[];
  scores_breakdown: {
    entity_similarity?: number;
    temporal_compatibility?: number;
    location_compatibility?: number;
    relationship_strength?: number;
  };
  supporting_evidence: string[];
  contradictions: string[];
}

export const evidenceService = {
  getLeads: async (caseId: string = 'case-001'): Promise<Lead[]> => {
    try {
      const data = await apiRequest<BackendLead[]>(`/hypotheses/${caseId}/rank-leads`, {
        method: 'POST',
      });
      if (Array.isArray(data) && data.length > 0) {
        return data.map((l, index) => ({
          id: `LEAD-2026-${String(index + 101).padStart(3, '0')}`,
          title: l.hypothesis.length > 75 ? `${l.hypothesis.slice(0, 72)}...` : l.hypothesis,
          caseId: caseId.toUpperCase(),
          confidence: Math.round(l.score),
          priority: l.lead_priority || 'HIGH',
          status: 'New',
          description: l.hypothesis,
          generatedAt: '15 Jan 2026, 11:30 AM',
          reasoningSteps: (l.reasoning || []).map((step, idx) => ({
            title: `Intelligence Signal ${idx + 1}`,
            description: step,
            badge: step.includes('Cross-case') ? 'Cross-Case Link' : 'AI Analysis',
            type: step.includes('vehicle') ? 'vehicle' : step.includes('Location') ? 'location' : 'signal',
          })),
          sourceRecords: (l.supporting_evidence || []).map((ev, idx) => ({
            id: `EV-REC-${idx + 1}`,
            type: 'Evidentiary Record',
            title: 'Supporting Intelligence',
            detail: ev,
            date: 'Jan 2026',
          })),
          aiScores: {
            entityMatching: Math.round((l.scores_breakdown?.entity_similarity || 25) * 3.33),
            temporalCompatibility: Math.round((l.scores_breakdown?.temporal_compatibility || 20) * 4),
            geographicCompatibility: Math.round((l.scores_breakdown?.location_compatibility || 20) * 4),
            evidenceConsistency: Math.round((l.scores_breakdown?.relationship_strength || 15) * 5),
          },
        }));
      }
      return [...MOCK_LEADS];
    } catch (err) {
      console.warn('Backend /rank-leads failed, using local mock:', err);
      return [...MOCK_LEADS];
    }
  },

  getLeadById: async (id: string): Promise<Lead | null> => {
    const leads = await evidenceService.getLeads();
    return leads.find((l) => l.id === id) || null;
  },

  getLeadsByCase: async (caseId: string): Promise<Lead[]> => {
    return evidenceService.getLeads(caseId);
  },

  updateLeadStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    const lead = MOCK_LEADS.find((l) => l.id === id);
    if (!lead) throw new Error('Lead not found');
    lead.status = status;
    return lead;
  },
};

export default evidenceService;
