import React from 'react';
import { motion } from 'framer-motion';

type BarColor = 'green' | 'red' | 'blue' | 'purple' | 'amber';

interface ConfidenceBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  color?: BarColor;
}

const COLOR_MAP: Record<BarColor, { track: string; fill: string }> = {
  green:  { track: 'bg-green-900/40',  fill: 'bg-green-500'  },
  red:    { track: 'bg-red-900/40',    fill: 'bg-red-500'    },
  blue:   { track: 'bg-blue-900/40',   fill: 'bg-blue-500'   },
  purple: { track: 'bg-purple-900/40', fill: 'bg-purple-500' },
  amber:  { track: 'bg-amber-900/40',  fill: 'bg-amber-500'  },
};

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  value,
  label,
  showPercentage = true,
  color = 'blue',
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const colors = COLOR_MAP[color];

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-slate-400 text-xs font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-slate-300 text-xs font-semibold ml-auto">{clamped}%</span>
          )}
        </div>
      )}
      <div className={`relative w-full h-2 rounded-full overflow-hidden ${colors.track}`}>
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${colors.fill}`}
          initial={{ width: '0%' }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;
