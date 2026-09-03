import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'amber';
  delay?: number;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    border: 'border-blue-500/20',
    value: 'text-blue-300',
  },
  green: {
    bg: 'bg-green-500/10',
    icon: 'text-green-400',
    border: 'border-green-500/20',
    value: 'text-green-300',
  },
  purple: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-400',
    border: 'border-purple-500/20',
    value: 'text-purple-300',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    border: 'border-amber-500/20',
    value: 'text-amber-300',
  },
};

const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, icon: Icon, color }) => {
  const c = colorMap[color];
  return (
    <div className={`bg-[#0B1F3A] border ${c.border} rounded-xl p-5 flex items-start gap-4`}>
      <div className={`flex-shrink-0 w-11 h-11 rounded-lg ${c.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold ${c.value} leading-none mb-1`}>{value}</p>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatCard;
