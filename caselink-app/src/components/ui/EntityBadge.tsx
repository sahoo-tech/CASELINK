import React from 'react';
import { User, Car, MapPin, Building2, Calendar, FileText, Tag } from 'lucide-react';

export type EntityType = 'Person' | 'Vehicle' | 'Location' | 'Organization' | 'Event' | 'Case' | 'Document';

interface EntityBadgeProps {
  type: string;
}

const ENTITY_MAP: Record<string, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  person:       { icon: User,      bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  vehicle:      { icon: Car,       bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30'   },
  location:     { icon: MapPin,    bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30'  },
  organization: { icon: Building2, bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  event:        { icon: Calendar,  bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30'  },
  case:         { icon: FileText,  bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30'    },
  document:     { icon: FileText,  bg: 'bg-cyan-500/15',   text: 'text-cyan-400',   border: 'border-cyan-500/30'   },
};

const DEFAULT_CONFIG = {
  icon: Tag,
  bg: 'bg-slate-500/15',
  text: 'text-slate-400',
  border: 'border-slate-500/30',
};

const EntityBadge: React.FC<EntityBadgeProps> = ({ type }) => {
  const cleanKey = (type || '').toLowerCase().trim();
  const config = ENTITY_MAP[cleanKey] || DEFAULT_CONFIG;
  const { icon: Icon, bg, text, border } = config;
  const displayLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Entity';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      <Icon size={11} className="shrink-0" />
      {displayLabel}
    </span>
  );
};

export default EntityBadge;
