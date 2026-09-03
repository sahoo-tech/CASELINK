import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  UserCheck,
  FileText,
  Key,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Laptop,
  AlertOctagon,
  Eye,
  Filter,
} from 'lucide-react';
import { MOCK_AUDIT_LOGS, type AuditLog } from '../data/mockData';
import { userService } from '../services/userService';
import StatusBadge from '../components/ui/StatusBadge';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'roles' | 'access'>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AUTHORIZED' | 'DENIED'>('ALL');

  const users = userService.getAllUsers();

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Security, Role Management & Audit Registry
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">
              IMMUTABLE AUDIT ENABLED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident activity logs, cryptographic user session verification, and role-based access enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1F3A] border border-[#1E3A5F] text-xs font-mono text-slate-300">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>SESSION: 256-BIT TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[#1E3A5F] text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 font-semibold border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Audit Logs ({MOCK_AUDIT_LOGS.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-4 font-semibold border-b-2 transition-all ${
            activeTab === 'roles'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Role Management ({users.length} Officers)
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={`pb-3 px-4 font-semibold border-b-2 transition-all ${
            activeTab === 'access'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Access History Stream
        </button>
      </div>

      {/* ── Tab 1: Audit Logs ───────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0B1F3A] border border-[#1E3A5F] p-3 rounded-xl text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by officer, action, resource, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">Status:</span>
              {(['ALL', 'AUTHORIZED', 'DENIED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#152A46] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E3A5F] bg-[#152A46]/60 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User & Role</th>
                    <th className="py-3 px-4">Action Taken</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3A5F]/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#152A46]/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-semibold text-white">{log.user}</p>
                        <p className="text-[10px] text-slate-400">{log.role}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-medium">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-400">
                        {log.resource}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Role Management ──────────────────────────── */}
      {activeTab === 'roles' && (
        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Investigator Role Matrix</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Personnel assigned to CASELINK with multi-factor authentication bindings.
              </p>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">
              Provision New Officer
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E3A5F] bg-[#152A46]/60 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Officer Name</th>
                  <th className="py-3 px-4">Badge Number</th>
                  <th className="py-3 px-4">Official ID</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4">Authorization Role</th>
                  <th className="py-3 px-4">Last Verified Login</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3A5F]/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#152A46]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{u.badgeNumber}</td>
                    <td className="py-3 px-4 font-mono text-blue-400">{u.officialId}</td>
                    <td className="py-3 px-4 text-slate-300">{u.department}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-semibold text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{u.lastLogin}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: Access History Stream ────────────────────── */}
      {activeTab === 'access' && (
        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-[#1E3A5F] pb-3">
            Real-Time Investigator Authentication Stream
          </span>

          <div className="space-y-3">
            {MOCK_AUDIT_LOGS.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#152A46]/60 border border-[#1E3A5F] text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      log.status === 'AUTHORIZED'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {log.user.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{log.user}</p>
                    <p className="text-[11px] text-slate-400">
                      {log.action} · <span className="font-mono text-blue-400">{log.resource}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[11px] text-slate-400 block">{log.timestamp}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      log.status === 'AUTHORIZED' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
