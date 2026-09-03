import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Search,
  Plus,
  ArrowUpRight,
  MapPin,
  Calendar,
  Layers,
  Clock,
  Shield,
  FileCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { MOCK_CASES, type Case, type CaseType, type CasePriority } from '../data/mockData';
import { StatusBadge, PriorityBadge } from '../components/common/Badges';
import caseService from '../services/caseService';

const CasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CaseType>('Organized Financial Crime');
  const [newLocation, setNewLocation] = useState('Mumbai');
  const [newPriority, setNewPriority] = useState<CasePriority>('High');
  const [newDescription, setNewDescription] = useState('');

  // Load cases from backend on mount
  useEffect(() => {
    let isMounted = true;
    caseService.getCases().then((data) => {
      if (isMounted && data.length > 0) {
        setCases(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.investigator.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = cases.length;
    const active = cases.filter((c) => c.status === 'Active').length;
    const pending = cases.filter((c) => c.status === 'Pending').length;
    const highPriority = cases.filter((c) => c.priority === 'High' || c.priority === 'Critical').length;
    return { total, active, pending, highPriority };
  }, [cases]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await caseService.createCase({
        title: newTitle.trim(),
        type: newType,
        location: newLocation.trim(),
        priority: newPriority,
        description: newDescription.trim() || 'New investigation registered in central intelligence repository.',
      });

      setCases((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      console.error('Failed to create case:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">Investigation Cases</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              NATIONAL REPOSITORY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Central investigative case registry with graph cross-referencing and autonomous pattern matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workspace')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-600/20"
          >
            <FolderOpen className="w-4 h-4" />
            Active Investigation Workspace
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-emerald-600/25"
          >
            <Plus className="w-3.5 h-3.5" />
            New Case
          </button>
        </div>
      </div>

      {/* ── Metric Snapshot Cards ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Records</span>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Inquiries</span>
            <p className="text-2xl font-bold text-green-400 mt-0.5">{stats.active}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Review</span>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{stats.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Priority</span>
            <p className="text-2xl font-bold text-red-400 mt-0.5">{stats.highPriority}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────── */}
      <div className="bg-[#0B1F3A] border border-[#1E3A5F] p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case number, title, type, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#152A46] border border-[#1E3A5F] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#152A46] border border-[#1E3A5F] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Cases Table ─────────────────────────────────────── */}
      <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E3A5F] bg-[#152A46]/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Case Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Lead Officer</th>
                <th className="py-3 px-4">Evidence Links</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/60">
              {filteredCases.map((c) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#152A46]/40 transition-colors group cursor-pointer"
                  onClick={() => navigate('/workspace')}
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-400 group-hover:text-blue-300">
                      {c.caseNumber}
                    </span>
                    <p className="text-slate-400 text-[11px] font-mono mt-0.5">{c.created}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white max-w-xs truncate group-hover:text-blue-200">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.type}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {c.location}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="text-slate-200 font-medium">{c.investigator}</p>
                    <p className="text-[10px] text-slate-500">{c.assignedUnit}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="text-slate-200 font-bold">{c.entityCount}</span> entities ·
                      <span className="text-slate-200 font-bold">
                        {c.evidenceCounts ? c.evidenceCounts.documents + c.evidenceCounts.transactions : 32}
                      </span> docs
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/workspace');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition-all font-medium"
                    >
                      <span>Investigate</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCases.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            No investigation cases match the selected filter criteria.
          </div>
        )}
      </div>

      {/* ── Interactive Ingestion Modal (Backend Connected) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Ingest New Primary Case</h3>
                  <p className="text-[11px] text-slate-400">Registers into live backend & activates knowledge graph</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#152A46]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Investigation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cross-Border Gold Contraband Syndicate"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Crime Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CaseType)}
                    className="w-full px-3 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Organized Financial Crime">Organized Financial Crime</option>
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Cybercrime">Cybercrime</option>
                    <option value="Smuggling Network">Smuggling Network</option>
                    <option value="Money Laundering">Money Laundering</option>
                    <option value="Document Forgery">Document Forgery</option>
                    <option value="Organized Crime">Organized Crime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jurisdiction / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kochi Port, Kerala"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Critical', 'High', 'Medium', 'Low'] as CasePriority[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`py-1.5 rounded-lg font-semibold border transition-all text-center ${
                        newPriority === p
                          ? p === 'Critical' || p === 'High'
                            ? 'bg-red-600/30 text-red-400 border-red-500/50'
                            : 'bg-blue-600/30 text-blue-400 border-blue-500/50'
                          : 'bg-[#152A46] text-slate-400 border-[#1E3A5F] hover:bg-[#1E3A5F]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial FIR / Narrative Summary</label>
                <textarea
                  rows={3}
                  placeholder="Enter initial briefing summary, suspected front organizations, or intelligence tip-off..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register Case File</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesPage;
