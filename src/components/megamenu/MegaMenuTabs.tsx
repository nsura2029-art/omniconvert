import React from 'react';
import { MegaMenuCategory } from '../../types/mega-menu';

interface Props {
  categories: MegaMenuCategory[];
  activeId: string;
  onChange: (id: string) => void;
}

/** Horizontal scrollable row of category chips. Text only — no icons. */
const MegaMenuTabs: React.FC<Props> = ({ categories, activeId, onChange }) => (
  <div
    role="tablist"
    aria-label="Conversion categories"
    className="flex gap-1 overflow-x-auto border-b border-slate-100 pb-2 mb-3 scrollbar-none"
  >
    {categories.map(cat => {
      const active = cat.id === activeId;
      return (
        <button
          key={cat.id}
          type="button"
          role="tab"
          aria-selected={active}
          aria-controls={`megamenu-panel-${cat.id}`}
          onClick={() => onChange(cat.id)}
          className={`group/megatab inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-black transition ${
            active
              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="whitespace-nowrap">{cat.name}</span>
          <span className={`ml-1 inline-flex items-center justify-center rounded-md px-1 py-0.5 text-[9px] font-black tabular-nums ${
            active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {cat.format_count}
          </span>
        </button>
      );
    })}
  </div>
);

export default MegaMenuTabs;