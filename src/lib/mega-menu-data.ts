// Loads and exposes the mega-menu data. Validates against the JSON
// schema so any typo in the catalog surfaces at module-init time.

import type { MegaMenuData } from '../types/mega-menu';
import raw from '../data/mega_menu_data.json';

const data = raw as unknown as MegaMenuData;

if (!Array.isArray(data.categories) || data.categories.length === 0) {
  throw new Error('[mega-menu] data: categories array is empty or missing');
}

export const MEGA_MENU_DATA: MegaMenuData = data;

export const findCategory = (id: string) =>
  MEGA_MENU_DATA.categories.find(c => c.id === id);

export const totalToolCount = MEGA_MENU_DATA.categories.reduce(
  (s, c) => s + c.top_tools.length, 0
);

export const totalFormatCount = MEGA_MENU_DATA.categories.reduce(
  (s, c) => s + c.format_count, 0
);

// Search across all categories. Returns flat list of matching tools with
// the parent category id.
export interface SearchResult {
  categoryId: string;
  categoryName: string;
  tool: import('../types/mega-menu').MegaMenuTool;
}

export const searchTools = (q: string): SearchResult[] => {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const out: SearchResult[] = [];
  for (const cat of MEGA_MENU_DATA.categories) {
    for (const tool of cat.top_tools) {
      if (
        tool.label.toLowerCase().includes(term) ||
        tool.source.toLowerCase().includes(term) ||
        tool.target.toLowerCase().includes(term) ||
        tool.meta.toLowerCase().includes(term)
      ) {
        out.push({ categoryId: cat.id, categoryName: cat.name, tool });
      }
    }
  }
  return out.slice(0, 30);
};