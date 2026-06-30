import React, { useEffect, useMemo, useState } from 'react';
import { MEGA_MENU_DATA, searchTools } from '../../lib/mega-menu-data';
import MegaMenuTabs from './MegaMenuTabs';
import MegaMenuSearch from './MegaMenuSearch';
import MegaMenuToolCard from './MegaMenuToolCard';
import MegaMenuFooter from './MegaMenuFooter';
import { Search } from 'lucide-react';

interface Props {
  onNavigate?: (url: string) => void;
}

/**
 * "All Tools" mega menu — primary SEO surface. All 12 categories ×
 * all top_tools rendered as <a> tags in the initial HTML.
 *
 * Layout:
 *   - Category tabs (horizontal scroll)
 *   - 4-column grid of MegaMenuToolCards (active category, or search
 *     results)
 *   - Inline search with debounce
 *   - Footer with "View all" + category count
 */
const MegaMenuAllTools: React.FC<Props> = ({ onNavigate }) => {
  const [activeId, setActiveId] = useState(MEGA_MENU_DATA.categories[0].id);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 300ms debounce on search — prevents re-renders on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const activeCategory = useMemo(
    () => MEGA_MENU_DATA.categories.find(c => c.id === activeId) ?? MEGA_MENU_DATA.categories[0],
    [activeId]
  );

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    return searchTools(debouncedQuery);
  }, [debouncedQuery]);

  const totalTools = MEGA_MENU_DATA.categories.reduce((s, c) => s + c.top_tools.length, 0);
  const totalFormats = MEGA_MENU_DATA.categories.reduce((s, c) => s + c.format_count, 0);

  return (
    <div className="w-[920px] max-w-[calc(100vw-2rem)] p-5">
      <MegaMenuSearch value={query} onChange={setQuery} placeholder="Search all 65+ conversion tools…" />

      {!searchResults ? (
        <>
          <MegaMenuTabs
            categories={MEGA_MENU_DATA.categories}
            activeId={activeId}
            onChange={setActiveId}
          />
          <div
            role="tabpanel"
            id={`megamenu-panel-${activeId}`}
            aria-label={`${activeCategory.name} conversion tools`}
            className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {activeCategory.top_tools.map(tool => (
              <MegaMenuToolCard key={tool.url} tool={tool} onNavigate={onNavigate} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-2">
          <p className="mb-2 text-[11px] font-bold text-slate-500">
            {searchResults.length} result{searchResults.length === 1 ? '' : 's'} for "{debouncedQuery}"
          </p>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 max-h-80 overflow-y-auto pr-1">
              {searchResults.map((r, i) => (
                <div key={`${r.tool.url}-${i}`} className="relative">
                  <MegaMenuToolCard tool={r.tool} onNavigate={onNavigate} />
                  <span className="absolute right-2 top-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-600">
                    {r.categoryName}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <Search className="mx-auto h-5 w-5 text-slate-400" />
              <p className="mt-2 text-[12px] font-black text-slate-700">No matching tools</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                Request a format and we'll add it to the catalog.
              </p>
            </div>
          )}
        </div>
      )}

      <MegaMenuFooter
        leftText="View all 12 categories"
        rightText={`${totalTools} tools · ${totalFormats} formats`}
      />
    </div>
  );
};

export default MegaMenuAllTools;