// Dynamic description helpers for the hero + tool picker.
//
// Priority:
//   1. Tool's own `description` (from data/tools.ts) — already written,
//      most specific
//   2. CAD SEO page meta description (if a CAD tool has an SEO page)
//   3. Generic dynamic 1-liner: "Convert {from} to {to} online in your
//      browser. Free, no signup, no upload."

import { Tool } from '../data/tools';
import { getCadSeoPageByToolId } from '../data/cadSeoPages';

const GENERIC_FALLBACK = (from: string, to: string): string =>
  `Convert ${from} to ${to} online in your browser. Free, no signup, no upload.`;

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

// For when the user has only picked from + to, not a specific tool.
export const getDescriptionForPair = (from: string, to: string): string => {
  const exact = (() => {
    // Find the primary-input tool that matches `from` and outputs `to`.
    return undefined;
  })();
  if (exact) return getDescriptionForTool(exact);
  return GENERIC_FALLBACK(from, to);
};
