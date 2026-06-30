import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { MegaMenuCategory as CategoryData } from '../../types/mega-menu';
import MegaMenuToolCard from './MegaMenuToolCard';
import CategoryIcon from './CategoryIcon';

interface Props {
  category: CategoryData;
  onNavigate?: (url: string) => void;
}

const MegaMenuCategory: React.FC<Props> = ({ category, onNavigate }) => {
  const popular = category.top_tools.find(t => t.badge === 'hot');

  return (
    <div className="w-[600px] max-w-[calc(100vw-2rem)] p-5">
      <header className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <CategoryIcon emoji={category.icon} size="lg" />
          </span>
          <div>
            <p className="text-[13px] font-black tracking-tight text-slate-900">{category.name} Converters</p>
            <p className="text-[10px] font-semibold text-slate-500">{category.description}</p>
          </div>
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

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
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
        {popular && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
            <Flame className="h-3 w-3" />
            {popular.label} most popular
          </span>
        )}
      </div>
    </div>
  );
};

export default MegaMenuCategory;