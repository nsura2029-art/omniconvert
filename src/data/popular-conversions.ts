// Popular from-to conversions per category, derived from the TOOLS catalog.
// Each tool with `popular: true` becomes a popular chip in its category.
// Up to 6 are returned per category, sorted by creditCost ascending (cheapest
// first so the most accessible options surface).

import { TOOLS, Tool } from './tools';

const POPULAR_LIMIT = 6;

export const getPopularForCategory = (categoryId: string): Tool[] =>
  TOOLS
    .filter(t => t.category === categoryId && t.popular === true)
    .sort((a, b) => a.creditCost - b.creditCost)
    .slice(0, POPULAR_LIMIT);

// Get the most popular tool in a category (used for default tool when
// a category is selected without an explicit from/to).
export const getTopToolForCategory = (categoryId: string): Tool | undefined => {
  const list = getPopularForCategory(categoryId);
  return list[0] ?? TOOLS.find(t => t.category === categoryId);
};
