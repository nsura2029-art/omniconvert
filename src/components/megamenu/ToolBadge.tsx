import React from 'react';
import type { BadgeType } from '../../types/mega-menu';

interface Props {
  badge: BadgeType;
  className?: string;
}

const STYLES: Record<Exclude<BadgeType, ''>, { label: string; bg: string; fg: string }> = {
  hot:  { label: '🔥 Hot',  bg: 'bg-amber-100',  fg: 'text-amber-700'  },
  new:  { label: '✨ New',  bg: 'bg-blue-100',   fg: 'text-blue-700'   },
  free: { label: '✓ Free', bg: 'bg-emerald-100', fg: 'text-emerald-700' },
};

const ToolBadge: React.FC<Props> = ({ badge, className = '' }) => {
  if (!badge) return null;
  const s = STYLES[badge];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${s.bg} ${s.fg} ${className}`}>
      {s.label}
    </span>
  );
};

export default ToolBadge;