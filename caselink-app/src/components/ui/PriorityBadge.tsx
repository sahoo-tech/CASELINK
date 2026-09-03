import React from 'react';

type Priority = 'High' | 'Medium' | 'Low';

interface PriorityBadgeProps {
  priority: Priority;
}

const PRIORITY_MAP: Record<Priority, { bg: string; text: string; border: string; dot: string }> = {
  High:   { bg: 'bg-red-500/15',   text: 'text-red-400',   border: 'border-red-500/30',   dot: 'bg-red-500'   },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  Low:    { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500' },
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const { bg, text, border, dot } = PRIORITY_MAP[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {priority}
    </span>
  );
};

export default PriorityBadge;
