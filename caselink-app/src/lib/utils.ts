import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Active:     'text-green-400',
    AUTHORIZED: 'text-green-400',
    Pending:    'text-amber-400',
    Closed:     'text-slate-400',
    DENIED:     'text-red-400',
  };
  return map[status] ?? 'text-slate-400';
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    High:   'text-red-400',
    Medium: 'text-amber-400',
    Low:    'text-green-400',
  };
  return map[priority] ?? 'text-slate-400';
}

export function getEntityColor(entityType: string): string {
  const map: Record<string, string> = {
    Person:       'text-orange-400',
    Vehicle:      'text-blue-400',
    Location:     'text-green-400',
    Organization: 'text-purple-400',
    Event:        'text-amber-400',
    Case:         'text-red-400',
  };
  return map[entityType] ?? 'text-slate-400';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-green-400';
  if (confidence >= 60) return 'text-amber-400';
  return 'text-red-400';
}

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str;
}
