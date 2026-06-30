import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { MEGA_MENU_DATA } from '../../lib/mega-menu-data';
import MegaMenuToolCard from './MegaMenuToolCard';
import CategoryIcon from './CategoryIcon';

interface Props {
  /** IDs to render in the "More" dropdown. Default: Video, Archives, Fonts. */
  categoryIds?: string[];
  onNavigate?: (url: string) => void;
}

const MegaMenuMore: React.FC<Props> = ({ categoryIds = ['video', 'archives', 'fonts'], onNavigate }) => {
  const cats = categoryIds
    .map(id => MEGA_MENU_DATA.categories.find(c => c.id === id))
    .filter(Boolean) as typeof MEGA_MENU_DATA.categories;

  return (
    <div className="w-[680px] max-w-[calc(100vw-2rem)] p-5">
      <div className="grid grid-cols-3 gap-4">
        {cats.map(cat => (
          <div key={cat.id}>
            <header className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="inline-flex items-center gap-1.5">
                <CategoryIcon emoji={cat.icon} size="sm" />
                <span className="text-[12px] font-black text-slate-900">{cat.name}</span>
              </span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-black tabular-nums text-slate-500">
                {cat.format_count}
              </span>
            </header>
            <div className="space-y-1.5">
              {cat.top_tools.slice(0, 4).map(tool => (
                <MegaMenuToolCard key={tool.url} tool={tool} onNavigate={onNavigate} size="sm" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <a
          href="/"
          onClick={e => {
            if (e.metaKey || e.ctrlKey || e.button !== 0) return;
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 hover:text-blue-800"
        >
          View all 12 categories
          <ArrowRight className="h-3 w-3" />
        </a>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
          <Flame className="h-3 w-3" />
          STL→OBJ trending +234%
        </span>
      </div>
    </div>
  );
};

export default MegaMenuMore;