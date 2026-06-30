// ToolPicker — 3-step picker that lets the user choose a Category, then a
// source format, then a target format, and also shows a row of popular
// from-to combos in the active category. Picking any chip calls
// `onChange(tool)` so the parent can sync the URL + update the hero +
// re-render the file list.

import React, { useMemo } from 'react';
import { CATEGORIES, Tool, TOOLS } from '../data/tools';
import { colorForFormat, iconLetter } from '../lib/format-colors';
import { getPopularForCategory, getTopToolForCategory } from '../data/popular-conversions';
import { getDescriptionForTool } from '../lib/tool-description';
import { toolSlug } from '../lib/tool-slug';

interface ToolPickerProps {
  activeCategory: string;
  activeFrom: string;
  activeTo: string;
  onChange: (tool: Tool) => void;
}

const normalize = (s: string): string =>
  s.toLowerCase().split(/[,\s/]+/).map(p => p.trim()).filter(Boolean).join(' ');

const formatMatches = (toolInput: string, from: string): boolean => {
  const tokens = toolInput.toLowerCase().split(/[,\s/]+/).map(p => p.trim()).filter(Boolean);
  return tokens.includes(from.toLowerCase()) || tokens[0] === from.toLowerCase();
};

const findTool = (category: string, from: string, to: string): Tool | undefined => {
  // 1. Exact match: tool.input includes `from` and tool.output includes `to`
  const exact = TOOLS.find(t =>
    t.category === category &&
    formatMatches(t.input, from) &&
    t.output.toLowerCase().split(/[,\s/]+/).map(p => p.trim()).includes(to.toLowerCase())
  );
  if (exact) return exact;
  // 2. Fallback: any tool in this category that has `to` in output
  return TOOLS.find(t => t.category === category && t.output.toLowerCase().includes(to.toLowerCase()));
};

const getFromOptions = (category: string): string[] => {
  const set = new Set<string>();
  TOOLS.filter(t => t.category === category).forEach(t => {
    t.input.split(/[,\s/]+/).map(p => p.trim()).filter(Boolean).forEach(p => set.add(p));
  });
  return Array.from(set);
};

const getToOptions = (category: string, from: string): string[] => {
  const set = new Set<string>();
  TOOLS
    .filter(t => t.category === category && formatMatches(t.input, from))
    .forEach(t => t.output.split(/[,\s/]+/).map(p => p.trim()).filter(Boolean).forEach(p => set.add(p)));
  return Array.from(set);
};

const CategoryIcon: React.FC<{ id: string }> = ({ id }) => {
  const labels: Record<string, string> = {
    'CAD': '3D', 'Documents': 'DOC', 'Images': 'IMG', 'Video': 'VID',
    'Audio': 'AUD', 'Archives': 'ZIP', 'Spreadsheets': 'XLS', 'Presentations': 'PPT',
    'eBooks': 'EPUB', 'Fonts': 'FNT', 'Data': 'DB', '3D': '3D',
  };
  return <span className="font-bold">{labels[id] ?? id.slice(0, 3).toUpperCase()}</span>;
};

const FormatChip: React.FC<{ fmt: string; size?: 'sm' | 'md' }> = ({ fmt, size = 'sm' }) => {
  const c = colorForFormat(fmt);
  return (
    <span
      className={`inline-flex items-center font-mono font-bold ${size === 'md' ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5'} rounded ${c.bg} ${c.fg}`}
    >
      {fmt}
    </span>
  );
};

const ToolPicker: React.FC<ToolPickerProps> = ({
  activeCategory, activeFrom, activeTo, onChange,
}) => {
  const fromOptions = useMemo(() => getFromOptions(activeCategory), [activeCategory]);
  const toOptions = useMemo(() => getToOptions(activeCategory, activeFrom), [activeCategory, activeFrom]);
  const popular = useMemo(() => getPopularForCategory(activeCategory), [activeCategory]);

  // Active tool + description (used in the dynamic description row).
  const activeTool = useMemo(() => findTool(activeCategory, activeFrom, activeTo), [activeCategory, activeFrom, activeTo]);
  const description = useMemo(() => {
    if (activeTool) return getDescriptionForTool(activeTool);
    return `Convert ${activeFrom} to ${activeTo} online in your browser. Free, no signup, no upload.`;
  }, [activeTool, activeFrom, activeTo]);

  const handleCategory = (catId: string) => {
    const top = getTopToolForCategory(catId);
    if (top) {
      onChange(top);
      return;
    }
    // Fallback: first tool in this category
    const fallback = TOOLS.find(t => t.category === catId);
    if (fallback) onChange(fallback);
  };

  const handleFrom = (from: string) => {
    const tos = getToOptions(activeCategory, from);
    const to = tos.includes(activeTo) ? activeTo : (tos[0] ?? '');
    const tool = findTool(activeCategory, from, to);
    if (tool) onChange(tool);
  };

  const handleTo = (to: string) => {
    const tool = findTool(activeCategory, activeFrom, to);
    if (tool) onChange(tool);
  };

  const handlePopular = (tool: Tool) => {
    onChange(tool);
  };

  return (
    <section className="rounded-3xl glass border border-zinc-200/70 dark:border-zinc-800/70 p-5 md:p-7">
      <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Pick a tool</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
            {description}
          </p>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          URL:&nbsp;
          <span className="text-slate-700 dark:text-slate-300 font-semibold">
            {activeCategory === 'CAD' ? `/cad/${toolSlug(activeFrom, activeTo)}` : `/${activeCategory.toLowerCase()}/${toolSlug(activeFrom, activeTo)}`}
          </span>
        </div>
      </div>

      {/* 3-step picker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Step 1 — Category */}
        <div className="lg:col-span-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 grid place-items-center text-[9px] font-bold">1</span>
            Category
          </div>
          <div className="flex flex-col gap-1.5">
            {CATEGORIES.map(cat => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="w-7 h-7 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 grid place-items-center text-[10px]">
                    <CategoryIcon id={cat.id} />
                  </span>
                  <span className="flex-1 text-sm font-semibold truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-500">{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — From */}
        <div className="lg:col-span-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 grid place-items-center text-[9px] font-bold">2</span>
            From
          </div>
          {fromOptions.length === 0 ? (
            <div className="text-[11px] text-slate-400 italic py-2">No formats in this category.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {fromOptions.map(f => {
                const isActive = normalize(f) === normalize(activeFrom);
                return (
                  <button
                    key={f}
                    onClick={() => handleFrom(f)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold border transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                        : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 3 — To */}
        <div className="lg:col-span-5">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 grid place-items-center text-[9px] font-bold">3</span>
            To
          </div>
          {toOptions.length === 0 ? (
            <div className="text-[11px] text-slate-400 italic py-2">Pick a source format first.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {toOptions.map(t => {
                const isActive = normalize(t) === normalize(activeTo);
                return (
                  <button
                    key={t}
                    onClick={() => handleTo(t)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold border transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                        : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Popular in this category */}
      {popular.length > 0 && (
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              Popular in {CATEGORIES.find(c => c.id === activeCategory)?.name ?? activeCategory}
            </div>
            <span className="text-[10px] text-slate-400">· {popular.length} picks</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popular.map(tool => {
              const isActive = activeTool?.id === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => handlePopular(tool)}
                  className={`group inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-400 hover:shadow-sm'
                  }`}
                  title={tool.description}
                >
                  <FormatChip fmt={tool.input} />
                  <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                  <FormatChip fmt={tool.output} />
                  <span className="hidden sm:inline text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[180px]">
                    {tool.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{tool.creditCost}cr</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default ToolPicker;
