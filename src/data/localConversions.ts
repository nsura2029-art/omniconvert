/**
 * Local conversions query layer. Reads the user's actual conversion history
 * from localStorage (the same store App.tsx maintains under
 * 'omni_conversions') and surfaces lightweight analytics on top.
 *
 * The dashboard uses these as a thin "real signal" layer over the seeded
 * analytics in dashboardAnalytics.ts — when the user has no conversion
 * history yet, the seeded values are the source of truth; when they do,
 * the dashboard blends the real count into the KPI cards.
 */

import { FileConversion } from '../types';
import { CategoryId } from './dashboardAnalytics';

const STORAGE_KEY = 'omni_conversions';

export interface StoredConversion extends FileConversion {
  timestamp: string;
}

export function getLocalConversions(): StoredConversion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalConversionsByCategory(cat: CategoryId): StoredConversion[] {
  return getLocalConversions().filter(c => (c.category || '').toLowerCase() === cat);
}

export function getLocalConversionsTotal(): number {
  return getLocalConversions().length;
}