import { MOCK_AUDIT_LOGS, type AuditLog } from '../data/mockData';
import { apiRequest } from './apiClient';

export interface UserCredentials {
  officialId: string;
  password: string;
  department: string;
  role: string;
}

export interface AuthUser {
  id: string;
  officialId: string;
  name: string;
  department: string;
  role: string;
  badgeNumber: string;
  lastLogin: string;
  status: 'active' | 'suspended';
}

const MOCK_USERS: AuthUser[] = [
  { id: 'u-001', officialId: 'INV001', name: 'ACP Vikram Sharma', department: 'CBI', role: 'Investigator', badgeNumber: 'CBI-42109', lastLogin: '2026-09-04 01:00', status: 'active' },
  { id: 'u-002', officialId: 'ANL001', name: 'Analyst Priya Menon', department: 'IB', role: 'Analyst', badgeNumber: 'IB-30901', lastLogin: '2026-09-04 01:00', status: 'active' },
  { id: 'u-003', officialId: 'ADM001', name: 'Director Rajesh Nair', department: 'NIA', role: 'Admin', badgeNumber: 'NIA-18734', lastLogin: '2026-09-04 01:00', status: 'active' },
];

let currentUser: AuthUser | null = null;

export const userService = {
  login: async (credentials: UserCredentials): Promise<AuthUser> => {
    try {
      // Call live backend /auth/login
      const res = await apiRequest<{
        access_token: string;
        token_type: string;
        user: {
          id: string;
          official_id: string;
          full_name: string;
          role: string;
          department: string;
        };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          official_id: credentials.officialId,
          password: credentials.password,
          department: credentials.department,
          role: credentials.role,
        }),
      });

      localStorage.setItem('caselink_token', res.access_token);

      currentUser = {
        id: res.user.id,
        officialId: res.user.official_id,
        name: res.user.full_name,
        department: res.user.department,
        role: res.user.role,
        badgeNumber: `${res.user.department}-${res.user.official_id}`,
        lastLogin: 'Just now (Live Backend)',
        status: 'active',
      };
      localStorage.setItem('caselink_user', JSON.stringify(currentUser));
      return currentUser;
    } catch (err) {
      console.warn('Backend login failed, attempting local fallback:', err);
      // Local fallback for offline mode
      const matched = MOCK_USERS.find((u) => u.officialId.toLowerCase() === credentials.officialId.toLowerCase()) || MOCK_USERS[0];
      currentUser = {
        ...matched,
        officialId: credentials.officialId,
        role: credentials.role || matched.role,
        department: credentials.department || matched.department,
      };
      localStorage.setItem('caselink_user', JSON.stringify(currentUser));
      return currentUser;
    }
  },

  logout: () => {
    currentUser = null;
    localStorage.removeItem('caselink_user');
    localStorage.removeItem('caselink_token');
  },

  getCurrentUser: (): AuthUser | null => {
    if (currentUser) return currentUser;
    const stored = localStorage.getItem('caselink_user');
    if (stored) {
      try {
        currentUser = JSON.parse(stored) as AuthUser;
        return currentUser;
      } catch {
        return null;
      }
    }
    return MOCK_USERS[0];
  },

  getAllUsers: (): AuthUser[] => [...MOCK_USERS],

  getAuditLogs: async (): Promise<AuditLog[]> => {
    return [...MOCK_AUDIT_LOGS];
  },
};

export default userService;
