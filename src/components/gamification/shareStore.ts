/**
 * Share store — localStorage-backed, mirrors D1 schema.
 * 7 platforms, 24h cooldown per platform per user, max 3/day per platform.
 */
import { GamificationUser, award, todayISO as _today, SharePlatform } from '../../data/gamification';

export interface ShareRecord {
  id: string;
  userId: string;
  platform: SharePlatform;
  url: string;
  conversionPair: string | null;
  creditsAwarded: number;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

const KEY = 'omni_gam_shares';
const MAX_PER_PLATFORM_PER_DAY = 3;

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

const readShares = (): ShareRecord[] => read<ShareRecord[]>(KEY, []);

const writeShares = (list: ShareRecord[]): void => {
  write(KEY, list);
  broadcast('share', list.length);
};

export const hasShareToday = (userId: string, platform: SharePlatform): boolean => {
  const t = _today();
  return readShares().some(s => s.userId === userId && s.platform === platform && s.createdAt.slice(0, 10) === t);
};

export const shareCountToday = (userId: string, platform: SharePlatform): number => {
  const t = _today();
  return readShares().filter(s => s.userId === userId && s.platform === platform && s.createdAt.slice(0, 10) === t).length;
};

export const lastShareTime = (userId: string, platform: SharePlatform): string | null => {
  const list = readShares().filter(s => s.userId === userId && s.platform === platform);
  list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return list[0]?.createdAt ?? null;
};

export const canShare = (userId: string, platform: SharePlatform): { ok: boolean; reason?: 'cooldown' | 'cap' } => {
  if (shareCountToday(userId, platform) >= MAX_PER_PLATFORM_PER_DAY) return { ok: false, reason: 'cap' };
  const last = lastShareTime(userId, platform);
  if (last) {
    const ageH = (Date.now() - Date.parse(last)) / (1000 * 60 * 60);
    if (ageH < 24) return { ok: false, reason: 'cooldown' };
  }
  return { ok: true };
};

export interface PlatformCreditReward {
  linkedin: number; reddit: number; twitter: number; facebook: number;
  whatsapp: number; telegram: number; email: number;
}

const REWARDS_BY_TIER: Record<GamificationUser['tier'], PlatformCreditReward> = {
  anonymous:  { linkedin: 3, reddit: 3, twitter: 2, facebook: 2, whatsapp: 1, telegram: 1, email: 1 },
  registered: { linkedin: 5, reddit: 5, twitter: 3, facebook: 3, whatsapp: 2, telegram: 2, email: 1 },
  paid:       { linkedin: 10, reddit: 10, twitter: 5, facebook: 5, whatsapp: 3, telegram: 3, email: 1 },
};

export const rewardFor = (user: GamificationUser, platform: SharePlatform): number => {
  if (platform === 'copy_link') return 0;
  return REWARDS_BY_TIER[user.tier][platform as keyof PlatformCreditReward] ?? 0;
};

export const recordShare = (
  user: GamificationUser, platform: SharePlatform, url: string, conversionPair: string | null,
): ShareRecord => {
  const credits = rewardFor(user, platform);
  const rec: ShareRecord = {
    id: 'shr_' + Math.random().toString(36).slice(2, 11),
    userId: user.id,
    platform, url, conversionPair,
    creditsAwarded: credits,
    verified: true,             // Phase-1: trust-on-honor. Phase-2 webhook verifies.
    verifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  const list = readShares();
  list.push(rec);
  writeShares(list);
  if (credits > 0) {
    award(credits, 'share_reward', {
      description: `Shared on ${platform}${conversionPair ? ' · ' + conversionPair.replace(/-/g, ' \u2192 ') : ''}`,
      subtype: platform,
      relatedId: rec.id,
    });
  }
  return rec;
};

export const buildShareUrl = (platform: SharePlatform, shareUrl: string, text: string): string => {
  const encUrl = encodeURIComponent(shareUrl);
  const encText = encodeURIComponent(text);
  switch (platform) {
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`;
    case 'reddit':   return `https://www.reddit.com/submit?url=${encUrl}&title=${encText}`;
    case 'twitter':  return `https://twitter.com/intent/tweet?url=${encUrl}&text=${encText}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;
    case 'whatsapp': return `https://wa.me/?text=${encText}%20${encUrl}`;
    case 'telegram': return `https://t.me/share/url?url=${encUrl}&text=${encText}`;
    case 'email':    return `mailto:?subject=${encodeURIComponent('Convert files online')}&body=${encText}%20${encUrl}`;
    default:         return shareUrl;
  }
};

export const getShareHistory = (userId: string, limit = 30): ShareRecord[] => {
  return readShares().filter(s => s.userId === userId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit);
};