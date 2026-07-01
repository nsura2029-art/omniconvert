// Dynamic description helpers for the hero + tool picker.
//
// Three levels of specificity:
//   1. Tool (most specific) — tool.description
//   2. Category — getCategoryDescription() — lists top formats
//   3. Generic — convert any file

import { Tool, TOOLS, CATEGORIES } from '../data/tools';
import { getCadSeoPageByToolId } from '../data/cadSeoPages';

const GENERIC_FALLBACK = (from: string, to: string): string =>
  `Convert ${from} to ${to} online in your browser. Free, no signup, no upload.`;

// Generic hero — used on / before the user makes any selection.
export const GENERIC_HERO_TITLE = 'Convert Any File';
export const GENERIC_HERO_DESCRIPTION =
  'Drop a file and pick what to turn it into. OmniConvert handles 200+ formats across documents, images, audio, video, archives, CAD and more — straight from your browser. No upload, no signup, no friction.';

export const getDescriptionForTool = (tool: Tool): string => {
  if (tool.description && tool.description.trim().length > 0) {
    return tool.description;
  }
  const cadSeo = getCadSeoPageByToolId(tool.id);
  if (cadSeo?.metaDescription) {
    return cadSeo.metaDescription;
  }
  return GENERIC_FALLBACK(tool.input, tool.output);
};

// Category-level hero — used on /<category>/ when no specific tool is
// picked. Lists the top 6 most common formats in the category.
export const getCategoryDescription = (categoryId: string): string => {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  const catName = cat?.name ?? categoryId;
  const set = new Set<string>();
  TOOLS.filter(t => t.category === categoryId).forEach(t => {
    t.input.split(/[,\s/]+/).map(p => p.trim()).filter(Boolean).forEach(p => set.add(p));
  });
  const formats = Array.from(set).slice(0, 6);
  const list = formats.length === 0
    ? 'multiple formats'
    : formats.length === 1
      ? formats[0]
      : formats.slice(0, -1).join(', ') + ' and ' + formats[formats.length - 1];
  return `Convert your ${catName.toLowerCase()} files online. We support ${list} and more — all in your browser, no signup, no upload.`;
};

// Get the top 6 formats in a category (used in the trust strip / chips).
export const getCategoryFormats = (categoryId: string): string[] => {
  const set = new Set<string>();
  TOOLS.filter(t => t.category === categoryId).forEach(t => {
    t.input.split(/[,\s/]+/).map(p => p.trim()).filter(Boolean).forEach(p => set.add(p));
  });
  return Array.from(set).slice(0, 6);
};

export const getCategoryName = (categoryId: string): string => {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat?.name ?? categoryId;
};
