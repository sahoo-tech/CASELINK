import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type CardColor = 'green' | 'blue' | 'purple' | 'orange' | 'amber';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendLabel?: string;
  color?: CardColor;
}

const COLOR_MAP: Record<CardColor, { bg: string; icon: string }> = {
  green:  { bg: 'bg-green-500/15',  icon: 'text-green-400'  },
  blue:   { bg: 'bg-blue-500/15',   icon: 'text-blue-400'   },
  purple: { bg: 'bg-purple-500/15', icon: 'text-purple-400' },
  orange: { bg: 'bg-orange-500/15', icon: 'text-orange-400' },
  amber:  { bg: 'bg-amber-500/15',  icon: 'text-amber-400'  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
}) => {
  const colors = COLOR_MAP[color];

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 flex flex-col gap-4 cursor-default select-none hover:border-blue-500/30 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest truncate">
            {title}
          </span>
          <span className="text-white text-3xl font-bold leading-none tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        </div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${colors.bg}`}>
          <Icon size={20} className={colors.icon} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs">{subtitle}</span>
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-semibold ml-auto ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
