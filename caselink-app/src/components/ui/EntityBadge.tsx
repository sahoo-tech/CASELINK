import React from 'react';
import { User, Car, MapPin, Building2, Calendar, FileText } from 'lucide-react';

type EntityType = 'Person' | 'Vehicle' | 'Location' | 'Organization' | 'Event' | 'Case';

interface EntityBadgeProps {
  type: EntityType;
}

const ENTITY_MAP: Record<EntityType, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  Person:       { icon: User,      bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  Vehicle:      { icon: Car,       bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30'   },
  Location:     { icon: MapPin,    bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30'  },
  Organization: { icon: Building2, bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  Event:        { icon: Calendar,  bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30'  },
  Case:         { icon: FileText,  bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30'    },
};

const EntityBadge: React.FC<EntityBadgeProps> = ({ type }) => {
  const { icon: Icon, bg, text, border } = ENTITY_MAP[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      <Icon size={11} className="shrink-0" />
      {type}
    </span>
  );
};

export default EntityBadge;
