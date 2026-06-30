// Helpers that the mega menu uses to convert `/convert/<slug>` URLs and
// `/<category>-converter/` paths into the existing in-app navigation.
// We expose these as window-bound functions so the MegaMenu (which
// only knows about `onNavigate`) can hand off routing without
// threading every App.tsx callback through its prop tree.

import { TOOLS, CATEGORIES } from '../data/tools';

declare global {
  interface Window {
    __omniMegaRouter?: (url: string) => void;
  }
}

const slugToTool = (() => {
  const map = new Map<string, (typeof TOOLS)[number]>();
  for (const t of TOOLS) {
    const slug = `${t.input.toLowerCase().split(/[,\s]+/)[0]}-to-${t.output.toLowerCase().split(/[,\s]+/)[0]}`;
    if (!map.has(slug)) map.set(slug, t);
    // also support reverse and shorter forms
    const reverseSlug = `${t.output.toLowerCase().split(/[,\s]+/)[0]}-to-${t.input.toLowerCase().split(/[,\s]+/)[0]}`;
    if (!map.has(reverseSlug)) map.set(reverseSlug, t);
  }
  return map;
})();

export const installMegaRouter = (handlers: {
  onChangePage: (page: string) => void;
  onSelectTool: (id: number) => void;
  onSelectCategory: (categoryId: string) => void;
}) => {
  window.__omniMegaRouter = (url: string) => {
    if (!url) return;

    // /<category>-converter/  (e.g. /documents-converter/)
    const catMatch = url.match(/^\/([a-z0-9-]+)-converter\/?$/);
    if (catMatch) {
      const cat = CATEGORIES.find(c => c.id.toLowerCase() === catMatch[1]);
      if (cat) {
        handlers.onSelectCategory(cat.id);
        handlers.onChangePage('category');
      }
      return;
    }

    // /convert/<slug>
    const toolMatch = url.match(/^\/convert\/([a-z0-9-]+)\/?$/);
    if (toolMatch) {
      const slug = toolMatch[1];
      const tool = slugToTool.get(slug);
      if (tool) {
        handlers.onSelectTool(tool.id);
        handlers.onChangePage('tools');
        return;
      }
    }

    if (url === '/') {
      handlers.onChangePage('home');
      return;
    }
    // Fallback: route via pushState so deep-links still update the URL.
    window.history.pushState({}, '', url);
  };
};

export const megaNavigate = (url: string) => {
  if (window.__omniMegaRouter) window.__omniMegaRouter(url);
};