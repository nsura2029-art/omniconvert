/**
 * Upvote store — localStorage-backed, mirrors D1 schema.
 * Per `(userId, category, source, target)` dedupe + 10/day limit per user.
 */
import { GamificationUser, award, todayISO as _today } from '../../data/gamification';

export interface UpvoteRecord {
  id: string;
  userId: string;
  category: string;
  sourceFormat: string;
  targetFormat: string;
  createdAt: string;
}

const KEY = 'omni_gam_upvotes';

const read = <T,>(k: string, fb: T): T => {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) as T : fb; } catch { return fb; }
};
const write = <T,>(k: string, v: T): void => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const broadcast = (event: string, payload: unknown) => {
  try {
    const bc = new BroadcastChannel('omniconvert-gamification');
    bc.postMessage({ event, payload, at: new Date().toISOString() });
    bc.close();
  } catch {}
};

export const readUpvotes = (): UpvoteRecord[] => read<UpvoteRecord[]>(KEY, []);

const writeUpvotes = (list: UpvoteRecord[]): void => {
  write(KEY, list);
  broadcast('upvote', list.length);
};

const pairKey = (category: string, source: string, target: string): string => `${category}::${source}::${target}`;

export const getUpvoteCount = (category: string, source: string, target: string): number => {
  return readUpvotes().filter(u => pairKey(u.category, u.sourceFormat, u.targetFormat) === pairKey(category, source, target)).length;
};

export const hasUserUpvoted = (userId: string, category: string, source: string, target: string): boolean => {
  return readUpvotes().some(u => u.userId === userId && pairKey(u.category, u.sourceFormat, u.targetFormat) === pairKey(category, source, target));
};

export const userUpvoteCountToday = (userId: string): number => {
  const t = _today();
  return readUpvotes().filter(u => u.userId === userId && u.createdAt.slice(0, 10) === t).length;
};

export interface CastUpvoteResult {
  ok: boolean;
  reason?: 'duplicate' | 'daily_limit' | 'banned';
  count?: number;
}

const DAILY_LIMIT = 10;

export const castUpvote = (user: GamificationUser, category: string, source: string, target: string): CastUpvoteResult => {
  if (user.banned) return { ok: false, reason: 'banned' };
  if (hasUserUpvoted(user.id, category, source, target)) return { ok: false, reason: 'duplicate' };
  if (userUpvoteCountToday(user.id) >= DAILY_LIMIT) return { ok: false, reason: 'daily_limit' };
  const rec: UpvoteRecord = {
    id: 'up_' + Math.random().toString(36).slice(2, 11),
    userId: user.id,
    category, sourceFormat: source, targetFormat: target,
    createdAt: new Date().toISOString(),
  };
  const list = readUpvotes();
  list.push(rec);
  writeUpvotes(list);
  // award credits based on tier
  const tier = user.tier;
  const rewardMap = { anonymous: 1, registered: 2, paid: 5 } as const;
  award(rewardMap[tier], 'upvote_reward', {
    description: `Upvoted ${source} → ${target}`,
    subtype: pairKey(category, source, target),
    relatedId: rec.id,
  });
  return { ok: true, count: getUpvoteCount(category, source, target) };
};

export const getTrendingPairs = (limit = 12): Array<{ category: string; source: string; target: string; count: number }> => {
  const counts = new Map<string, { category: string; source: string; target: string; count: number }>();
  for (const u of readUpvotes()) {
    const k = pairKey(u.category, u.sourceFormat, u.targetFormat);
    const ex = counts.get(k);
    if (ex) ex.count++;
    else counts.set(k, { category: u.category, source: u.sourceFormat, target: u.targetFormat, count: 1 });
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, limit);
};

export const upvoteMilestone = (count: number): 'trending' | 'featured' | 'roadmap' | null => {
  if (count >= 500) return 'roadmap';
  if (count >= 200) return 'featured';
  if (count >= 50)  return 'trending';
  return null;
};