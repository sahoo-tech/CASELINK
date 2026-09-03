import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  FolderOpen, Link, Brain, Zap, ArrowRight, TrendingUp,
  ChevronRight, Sparkles,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../components/common/Badges';
import {
  MOCK_CASES, MOCK_LEADS, MOCK_ACTIVITY_DATA, ENTITY_BREAKDOWN,
} from '../data/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' },
  }),
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-lg p-3 text-xs shadow-xl">
        <p className="text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-300 capitalize">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-lg p-3 text-xs shadow-xl">
        <p className="font-semibold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
        <p className="text-slate-300">{payload[0].value.toLocaleString()} entities</p>
      </div>
    );
  }
  return null;
};

const confidenceColor = (n: number) =>
  n >= 90 ? 'bg-green-500' : n >= 75 ? 'bg-blue-500' : n >= 60 ? 'bg-amber-500' : 'bg-red-500';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const now = new Date(2026, 8, 3);
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const recentCases = MOCK_CASES.slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* ── Page Header ── */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-wide">Investigation Dashboard</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-xs font-bold text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400">{dateStr} · National Crime Informatics Network</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 text-xs font-semibold border border-[#1E3A5F] transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
            Browse All Cases
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-600/20"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Generate Intelligence Brief
          </button>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Active Cases', value: 24, subtitle: '+5 this week', icon: FolderOpen, color: 'blue' as const },
          { label: 'Connected Evidence', value: '18,542', subtitle: 'Persons • Vehicles • Locations', icon: Link, color: 'green' as const },
          { label: 'AI Generated Leads', value: 37, subtitle: 'High:8 • Med:19 • Low:10', icon: Brain, color: 'purple' as const },
          { label: 'Investigation Efficiency', value: '89%', subtitle: 'vs 45min manual baseline', icon: Zap, color: 'amber' as const },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible">
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row (Guaranteed Dimensions to prevent blank spaces) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Area chart (2/3 width) */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="xl:col-span-2 bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Investigation Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 30 Days Timeline Analytics</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              {[
                { label: 'Leads', color: '#a855f7' },
                { label: 'Evidence', color: '#22c55e' },
                { label: 'Entities', color: '#3b82f6' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                  <span className="text-slate-400 font-medium">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-[240px] min-h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
              <AreaChart data={MOCK_ACTIVITY_DATA} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEvidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEntities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#a855f7" strokeWidth={2} fill="url(#gradLeads)" dot={false} />
                <Area type="monotone" dataKey="evidence" stroke="#22c55e" strokeWidth={2} fill="url(#gradEvidence)" dot={false} />
                <Area type="monotone" dataKey="entities" stroke="#3b82f6" strokeWidth={2} fill="url(#gradEntities)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie chart (1/3 width) */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 shadow-xl flex flex-col justify-between"
        >
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-slate-200">Entity Breakdown</h2>
            <p className="text-xs text-slate-500 mt-0.5">Categorized Multi-Agency Graph Nodes</p>
          </div>

          <div className="w-full h-[180px] min-h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180}>
              <PieChart>
                <Pie
                  data={ENTITY_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {ENTITY_BREAKDOWN.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#1E3A5F]/60">
            {ENTITY_BREAKDOWN.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                  <span className="text-slate-400">{e.name}</span>
                </div>
                <span className="text-slate-300 font-semibold font-mono">{e.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Cases Table ── */}
      <motion.div
        custom={7}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E3A5F]">
          <div>
            <h2 className="text-sm font-semibold text-white">Active Case Queue</h2>
            <p className="text-xs text-slate-400 mt-0.5">Cases requiring immediate lead validation</p>
          </div>
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold"
          >
            View All ({MOCK_CASES.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1E3A5F] bg-[#152A46]/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="px-5 py-3.5">Case ID</th>
                <th className="px-5 py-3.5">Classification</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/60">
              {recentCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate('/workspace')}
                  className="cursor-pointer hover:bg-[#152A46]/80 transition-colors group"
                >
                  <td className="px-5 py-3.5 font-mono font-bold text-blue-400 whitespace-nowrap">
                    {c.caseNumber}
                  </td>
                  <td className="px-5 py-3.5 text-slate-200 font-medium whitespace-nowrap group-hover:text-blue-300 transition-colors">
                    {c.type}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{c.location}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono whitespace-nowrap">{c.lastUpdated}</td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span className="text-blue-400 group-hover:underline text-[11px] font-semibold">
                      Open &rarr;
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── AI Generated Leads Section ── */}
      <motion.div
        custom={8}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">AI Generated Leads & Insights</h2>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              {MOCK_LEADS.length} Leads Active
            </span>
          </div>
          <button
            onClick={() => navigate('/evidence')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors font-semibold"
          >
            Inspect Evidence Provenance <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_LEADS.slice(0, 3).map((lead) => (
            <div
              key={lead.id}
              className="bg-[#152A46] border border-[#1E3A5F] hover:border-purple-500/50 rounded-xl p-4 flex flex-col justify-between gap-3 shadow transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                    {lead.id}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{lead.caseId}</span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                  {lead.title}
                </p>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {lead.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#1E3A5F]/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Inference Confidence</span>
                  <span className="font-bold text-white font-mono">{lead.confidence}%</span>
                </div>
                <div className="h-1.5 bg-[#0B1F3A] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${confidenceColor(lead.confidence)}`}
                    style={{ width: `${lead.confidence}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                  {lead.priority} PRIORITY
                </span>
                <button
                  onClick={() => navigate('/evidence')}
                  className="text-xs flex items-center gap-1 text-blue-400 hover:text-white bg-blue-600/20 hover:bg-blue-600 px-2.5 py-1 rounded border border-blue-500/30 transition-all font-semibold"
                >
                  Investigate <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
