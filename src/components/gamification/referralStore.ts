/**
 * Referral store — localStorage-backed, mirrors D1 schema.
 * Captures ?ref= URLs, tracks clicks/signups/conversions, awards credits.
 */
import { GamificationUser, award, Referral } from '../../data/gamification';

const KEY_CLICKS = 'omni_gam_referrals';
const KEY_PENDING = 'omni_gam_pending_ref';

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

export const readReferrals = (): Referral[] => read<Referral[]>(KEY_CLICKS, []);

const writeReferrals = (list: Referral[]): void => {
  write(KEY_CLICKS, list);
  broadcast('referral', list.length);
};

export const getReferralLink = (code: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?ref=${encodeURIComponent(code)}`;
};

export const copyReferralLink = async (link: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = link; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      return true;
    } catch { return false; }
  }
};

/** Capture ?ref= on page load; idempotent. */
export const captureReferralFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const existing = read<string | null>(KEY_PENDING, null);
  if (existing) return existing;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (!ref) return null;
  write(KEY_PENDING, ref);
  // also as a cookie (Phase-2 server-readable)
  document.cookie = `omni_ref=${encodeURIComponent(ref)}; Max-Age=${30 * 86400}; Path=/; SameSite=Lax`;
  // record click
  const list = readReferrals();
  list.push({
    id: 'ref_' + Math.random().toString(36).slice(2, 11),
    referrerId: ref,
    referredId: null,
    referralCode: ref,
    status: 'clicked',
    creditsAwarded: 0,
    clickedAt: new Date().toISOString(),
    signedUpAt: null, convertedAt: null, paidAt: null,
  });
  writeReferrals(list);
  return ref;
};

export const consumePendingReferral = (): string | null => {
  const code = read<string | null>(KEY_PENDING, null);
  if (code) write(KEY_PENDING, null);
  return code;
};

/** Fire on user signup / conversion / paid upgrade. */
export const attributeReferralEvent = (
  referrerCode: string, referredUser: GamificationUser, status: 'signed_up' | 'converted' | 'paid',
): Referral | null => {
  const list = readReferrals();
  // last-click attribution: pick the most recent click for this code where referredId is null
  const idx = list.findIndex(r => r.referralCode === referrerCode && r.referredId === null && r.status === 'clicked');
  if (idx === -1) return null;
  const rec = list[idx];
  const now = new Date().toISOString();
  const updated: Referral = {
    ...rec,
    referredId: referredUser.id,
    status,
    signedUpAt: status === 'signed_up' ? now : rec.signedUpAt,
    convertedAt: status === 'converted' ? now : rec.convertedAt,
    paidAt: status === 'paid' ? now : rec.paidAt,
  };
  // credit referrer based on event
  const referrerUser = loadUserById(referrerCode);
  if (referrerUser) {
    const map = {
      signed_up: { anon: 5, reg: 10, paid: 25 },
      converted: { anon: 0, reg: 3, paid: 10 },
      paid:      { anon: 0, reg: 0, paid: 50 },
    } as const;
    const credits = map[status][referrerUser.tier];
    if (credits > 0) {
      award(credits, status === 'signed_up' ? 'referral_signup' : status === 'converted' ? 'referral_convert' : 'referral_paid', {
        description: `Referral ${status}: ${referredUser.name ?? referredUser.email ?? referredUser.id}`,
        relatedId: updated.id,
      });
      updated.creditsAwarded = credits;
    }
  }
  list[idx] = updated;
  writeReferrals(list);
  return updated;
};

const loadUserById = (idOrCode: string): GamificationUser | null => {
  // Phase-1: only the current session user is fully resolvable.
  // We read the local user record if id matches; otherwise return null.
  try {
    const raw = localStorage.getItem('omni_gam_user');
    if (!raw) return null;
    const u = JSON.parse(raw) as GamificationUser;
    return u.id === idOrCode || u.referralCode === idOrCode ? u : null;
  } catch { return null; }
};

export const getReferralStats = (userId: string): { clicks: number; signups: number; converts: number; paid: number } => {
  const list = readReferrals().filter(r => r.referrerId === userId);
  return {
    clicks: list.filter(r => r.status === 'clicked').length,
    signups: list.filter(r => ['signed_up', 'converted', 'paid'].includes(r.status)).length,
    converts: list.filter(r => ['converted', 'paid'].includes(r.status)).length,
    paid: list.filter(r => r.status === 'paid').length,
  };
};

export const getReferralTree = (userId: string): Referral[] => {
  return readReferrals().filter(r => r.referrerId === userId).sort((a, b) => Date.parse(b.clickedAt) - Date.parse(a.clickedAt));
};