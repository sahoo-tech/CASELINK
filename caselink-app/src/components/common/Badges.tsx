import React from 'react';
import type { CaseStatus, CasePriority } from '../../data/mockData';

interface StatusBadgeProps {
  status: CaseStatus;
}

interface PriorityBadgeProps {
  priority: CasePriority;
}

const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  Active: { label: 'Active', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  Pending: { label: 'Pending', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  Closed: { label: 'Closed', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  Archived: { label: 'Archived', className: 'bg-slate-700/30 text-slate-500 border-slate-600/30' },
};

const priorityConfig: Record<CasePriority, { label: string; className: string }> = {
  Critical: { label: 'Critical', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  High: { label: 'High', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  Medium: { label: 'Medium', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  Low: { label: 'Low', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {cfg.label}
    </span>
  );
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const cfg = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};
