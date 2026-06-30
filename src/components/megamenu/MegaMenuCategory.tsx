import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MegaMenuCategory as CategoryData } from '../../types/mega-menu';
import MegaMenuToolCard from './MegaMenuToolCard';

interface Props {
  category: CategoryData;
  onNavigate?: (url: string) => void;
}

const MegaMenuCategory: React.FC<Props> = ({ category, onNavigate }) => {
  return (
    <div className="w-[600px] max-w-[calc(100vw-2rem)] p-5">
      <header className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <p className="text-[13px] font-black tracking-tight text-slate-900">{category.name} Converters</p>
          <p className="text-[10px] font-semibold text-slate-500">{category.description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 tabular-nums">
          {category.format_count} formats
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {category.top_tools.map(tool => (
          <MegaMenuToolCard key={tool.url} tool={tool} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
        <a
          href={`/${category.id}-converter/`}
          onClick={e => {
            if (e.metaKey || e.ctrlKey || e.button !== 0) return;
            if (onNavigate) {
              e.preventDefault();
              onNavigate(`/${category.id}-converter/`);
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 hover:text-blue-800"
        >
          View all {category.format_count} {category.name.toLowerCase()} formats
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default MegaMenuCategory;