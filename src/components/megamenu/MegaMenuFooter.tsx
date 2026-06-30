import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';

interface Props {
  leftText: string;
  rightText: string;
  highlightBadge?: { icon?: React.ReactNode; label: string };
  onLeftClick?: () => void;
}

const MegaMenuFooter: React.FC<Props> = ({ leftText, rightText, highlightBadge, onLeftClick }) => (
  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
    {onLeftClick ? (
      <button
        type="button"
        onClick={onLeftClick}
        className="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 hover:text-blue-800"
      >
        {leftText}
        <ArrowRight className="h-3 w-3" />
      </button>
    ) : (
      <span className="text-[11px] font-black text-slate-500">{leftText}</span>
    )}
    <div className="flex items-center gap-3">
      {highlightBadge && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
          {highlightBadge.icon ?? <Flame className="h-3 w-3" />}
          {highlightBadge.label}
        </span>
      )}
      <span className="text-[11px] font-bold text-slate-500">{rightText}</span>
    </div>
  </div>
);

export default MegaMenuFooter;