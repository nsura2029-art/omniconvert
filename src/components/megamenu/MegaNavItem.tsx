import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  label: string;
  openKey: string;
  active: boolean;
  onOpen: (key: string) => void;
  onNavigate?: (url: string) => void;
}

/**
 * The little button that sits in the navbar and toggles a mega menu.
 * Each instance is tied to one MegaMenu variant via `openKey`.
 *
 * Hover bridge: the parent <nav> already closes on mouseLeave, so the
 * MegaMenu itself owns the hover-out delay (see MegaMenu.tsx). We just
 * toggle open state on click here — that lets keyboard users reach
 * the menu without a hover requirement.
 */
const MegaNavItem: React.FC<Props> = ({ label, openKey, active, onOpen, onNavigate }) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpen(openKey)}
        onMouseEnter={() => onOpen(openKey)}
        aria-expanded={active}
        aria-haspopup="menu"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
          active
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
        id={`megamenu-trigger-${openKey}`}
      >
        {label}
        <ChevronDown
          className={`h-3 w-3 text-current opacity-60 transition-transform ${active ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
};

export default MegaNavItem;