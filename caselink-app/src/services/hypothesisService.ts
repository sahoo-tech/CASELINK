import { MOCK_HYPOTHESES, type Hypothesis } from '../data/mockData';
import { apiRequest } from './apiClient';

interface BackendHypothesis {
  id: string;
  description: string;
  support_score: number;
  contradiction_score: number;
  final_score: number;
  status: string;
  supporting_evidence: string[];
  contradicting_evidence: string[];
}

export const hypothesisService = {
  getHypotheses: async (caseId: string = 'case-001'): Promise<Hypothesis[]> => {
    try {
      const data = await apiRequest<BackendHypothesis[]>(`/hypotheses/${caseId}`);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((h) => ({
          id: h.id,
          title: h.description.length > 70 ? `${h.description.slice(0, 67)}...` : h.description,
          description: h.description,
          confidence: Math.round((h.final_score ?? h.support_score ?? 0.8) * 100),
          supportingEvidence: h.supporting_evidence?.length || 0,
          contradictoryEvidence: h.contradicting_evidence?.length || 0,
          status: (h.status as Hypothesis['status']) || 'MEDIUM',
          createdDate: '15 Jan 2026',
          supportingItems: h.supporting_evidence || [],
          contradictoryItems: h.contradicting_evidence || [],
        }));
      }
      return [...MOCK_HYPOTHESES];
    } catch (err) {
      console.warn('Backend hypotheses fetch failed, using local mock:', err);
      return [...MOCK_HYPOTHESES];
    }
  },

  getHypothesisById: async (id: string): Promise<Hypothesis | null> => {
    const list = await hypothesisService.getHypotheses();
    return list.find((h) => h.id === id) || null;
  },

  updateStatus: async (id: string, status: Hypothesis['status']): Promise<Hypothesis> => {
    const h = MOCK_HYPOTHESES.find((item) => item.id === id);
    if (h) h.status = status;
    return h || MOCK_HYPOTHESES[0];
  },
};

export default hypothesisService;
