// Tool slug helpers — generate / resolve canonical `from-to` slugs like
// `dxf-to-dwg`, `pdf-to-docx`, `mp4-to-gif`. These slugs are used in:
//   - the home page file-pick redirect (e.g. /cad/<slug>, /documents/<slug>)
//   - the App.tsx URL detection for /?tool=<slug>
//   - the legacy Tools menu tile (so a clickable converter chip can
//     route by slug)
//
// Uniqueness across the catalog is enforced at module-init time. On a
// collision we append a short id discriminator (-2, -3, …).

import { TOOLS, Tool } from '../data/tools';

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .split(/[,\s/]+/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part.replace(/[^a-z0-9]+/g, '-'))
    .filter(part => part && part !== '-')
    .join('-');

export const formatSlug = (fmt: string): string => {
  const tokens = normalize(fmt).split('-').filter(Boolean);
  return tokens[0] ?? '';
};

export const toolSlug = (input: string, output: string): string => {
  const from = formatSlug(input);
  const to = formatSlug(output);
  if (!from || !to) return '';
  return `${from}-to-${to}`;
};

interface SlugEntry {
  tool: Tool;
  category: string;
}

const slugMap = new Map<string, SlugEntry>();
const slugConflictLog: Array<{ slug: string; existing: Tool; newTool: Tool }> = [];

TOOLS.forEach(tool => {
  const base = toolSlug(tool.input, tool.output);
  if (!base) return;
  let candidate = base;
  let suffix = 2;
  while (slugMap.has(candidate)) {
    const existing = slugMap.get(candidate)!;
    if (existing.tool.id === tool.id) return; // duplicate tool row, skip silently
    slugConflictLog.push({ slug: candidate, existing: existing.tool, newTool: tool });
    candidate = `${base}-${suffix++}`;
  }
  slugMap.set(candidate, { tool, category: tool.category });
});

// Log collisions in dev so we can extend the catalog safely.
if (typeof window !== 'undefined' && slugConflictLog.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[tool-slug] ${slugConflictLog.length} slug collision(s) resolved with -N suffix:`,
    slugConflictLog.map(c => `${c.slug} (${c.existing.name} vs ${c.newTool.name})`)
  );
}

export const resolveSlug = (slug: string): SlugEntry | null =>
  slugMap.get(slug) ?? null;

export const getAllSlugs = (): Array<{ slug: string; tool: Tool; category: string }> =>
  Array.from(slugMap.entries()).map(([slug, entry]) => ({ slug, tool: entry.tool, category: entry.category }));

export const findToolSlug = (tool: Tool): string => {
  for (const [slug, entry] of slugMap.entries()) {
    if (entry.tool.id === tool.id) return slug;
  }
  return '';
};