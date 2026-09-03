import React from 'react';

type Status = 'Active' | 'Pending' | 'Closed' | 'AUTHORIZED' | 'DENIED';

interface StatusBadgeProps {
  status: Status;
}

const STATUS_MAP: Record<Status, { bg: string; text: string; border: string; dot: string }> = {
  Active:     { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30',  dot: 'bg-green-500'  },
  AUTHORIZED: { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30',  dot: 'bg-green-500'  },
  Pending:    { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30',  dot: 'bg-amber-500'  },
  DENIED:     { bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30',    dot: 'bg-red-500'    },
  Closed:     { bg: 'bg-slate-700/40',  text: 'text-slate-400',  border: 'border-slate-600/40',  dot: 'bg-slate-500'  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { bg, text, border, dot } = STATUS_MAP[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
