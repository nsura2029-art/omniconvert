/**
 * OmniConvert Gamification — Phase 1 (localStorage-backed) data layer.
 *
 * Schema mirrors the D1 spec from the Widgetly brief so swapping to a
 * Cloudflare Worker + D1 backend in Phase 2 is a one-file change:
 * the public function names + types stay the same; only the storage
 * primitive moves from `localStorage` to `fetch('/api/v1/...')`.
 *
 * Tables:
 *   users (session-only mirror)
 *   credit_transactions
 *   upvotes
 *   referrals
 *   shares
 *   daily_limits
 *
 * Cross-tab sync via BroadcastChannel — admin dashboards in another
 * tab pick up changes within ~50ms, no polling required.
 */

// ───────────────────────────────────────────────────────────── types

export type Tier = 'anonymous' | 'registered' | 'paid';

export interface GamificationUser {
  id: string;                    // session id (anon) or user id
  email: string | null;
  name: string | null;
  tier: Tier;
  credits: number;
  totalEarned: number;
  totalSpent: number;
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
  lastLoginAt: string;
  dailyLoginStreak: number;
  lastDailyLogin: string | null;
  banned: boolean;
  bannedReason: string | null;
}

export type TxType =
  | 'conversion_spend'
  | 'conversion_refund'
  | 'conversion_reward'
  | 'upvote_reward'
  | 'share_reward'
  | 'referral_signup'
  | 'referral_convert'
  | 'referral_paid'
  | 'daily_login'
  | 'profile_complete'
  | 'email_verify'
  | 'review_conversion'
  | 'admin_adjust'
  | 'milestone'
  | 'purchase';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;       // + earned / − spent
  type: TxType;
  subtype?: string;
  description?: string;
  relatedId?: string;
  balanceAfter: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Upvote {
  id: string;
  userId: string;
  sourceFormat: string;
  targetFormat: string;
  category: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string | null;
  referralCode: string;
  status: 'clicked' | 'signed_up' | 'converted' | 'paid';
  creditsAwarded: number;
  clickedAt: string;
  signedUpAt: string | null;
  convertedAt: string | null;
  paidAt: string | null;
}

export interface Share {
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

export type SharePlatform =
  | 'linkedin' | 'reddit' | 'twitter' | 'facebook'
  | 'whatsapp' | 'telegram' | 'email' | 'copy_link';

export interface DailyLimit {
  userId: string;
  limitType: string;
  count: number;
  date: string;       // YYYY-MM-DD (local)
  resetAt: string;
}

// ──────────────────────────────────────────────────── tier configuration

export interface TierConfig {
  startingCredits: number;
  maxCredits: number;
  dailyLogin: number;
  dailyConversions: number;
  batchSize: number;
  maxFileSizeMB: number;
  premiumFormats: boolean;
  priorityQueue: boolean;
  historyRetentionDays: number;
  rewards: {
    upvote: number;
    shareLinkedin: number;
    shareReddit: number;
    shareTwitter: number;
    shareFacebook: number;
    shareWhatsapp: number;
    shareTelegram: number;
    shareEmail: number;
    copyLink: number;
    referralSignup: number;
    referralConvert: number;
    referralPaid: number;
    conversionReward: number;
    profileComplete: number;
    emailVerify: number;
    reviewConversion: number;
  };
}

export const TIER_TABLE: Record<Tier, TierConfig> = {
  anonymous: {
    startingCredits: 5, maxCredits: 20,
    dailyLogin: 2, dailyConversions: 5, batchSize: 1, maxFileSizeMB: 10,
    premiumFormats: false, priorityQueue: false, historyRetentionDays: 7,
    rewards: {
      upvote: 1, shareLinkedin: 3, shareReddit: 3, shareTwitter: 2,
      shareFacebook: 2, shareWhatsapp: 1, shareTelegram: 1, shareEmail: 1,
      copyLink: 0,
      referralSignup: 5, referralConvert: 0, referralPaid: 0,
      conversionReward: 0.5,
      profileComplete: 0, emailVerify: 0, reviewConversion: 0,
    },
  },
  registered: {
    startingCredits: 20, maxCredits: 100,
    dailyLogin: 5, dailyConversions: 20, batchSize: 5, maxFileSizeMB: 50,
    premiumFormats: false, priorityQueue: false, historyRetentionDays: 30,
    rewards: {
      upvote: 2, shareLinkedin: 5, shareReddit: 5, shareTwitter: 3,
      shareFacebook: 3, shareWhatsapp: 2, shareTelegram: 2, shareEmail: 1,
      copyLink: 0,
      referralSignup: 10, referralConvert: 3, referralPaid: 0,
      conversionReward: 1,
      profileComplete: 10, emailVerify: 5, reviewConversion: 0,
    },
  },
  paid: {
    startingCredits: 500, maxCredits: 9999,
    dailyLogin: 10, dailyConversions: 9999, batchSize: 50, maxFileSizeMB: 500,
    premiumFormats: true, priorityQueue: true, historyRetentionDays: 9999,
    rewards: {
      upvote: 5, shareLinkedin: 10, shareReddit: 10, shareTwitter: 5,
      shareFacebook: 5, shareWhatsapp: 3, shareTelegram: 3, shareEmail: 1,
      copyLink: 0,
      referralSignup: 25, referralConvert: 10, referralPaid: 50,
      conversionReward: 2,
      profileComplete: 20, emailVerify: 10, reviewConversion: 15,
    },
  },
};

// ──────────────────────────────────────────────── storage key constants

const KEY = {
  user: 'omni_gam_user',
  tx: 'omni_gam_tx',
  upvotes: 'omni_gam_upvotes',
  referrals: 'omni_gam_referrals',
  shares: 'omni_gam_shares',
  limits: 'omni_gam_limits',
  pendingRef: 'omni_gam_pending_ref',
  session: 'omni_session',
  refCookie: 'omni_ref',
  banned: 'omni_gam_banned_users',
  flags: 'omni_gam_flags',
} as const;

const CHANNEL = 'omniconvert-gamification';

// ──────────────────────────────────────────────────── utilities

const now = (): string => new Date().toISOString();

const today = (): string => new Date().toISOString().slice(0, 10);
export const todayISO = today;

const uuid = (): string => {
  // browser crypto when available
  const c: any = (globalThis as any).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const read = <T>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
};

const write = <T>(k: string, v: T): void => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ }
};

const broadcast = (event: string, payload: unknown): void => {
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ event, payload, at: now() });
    bc.close();
  } catch { /* no-op */ }
};

const listen = (handler: (event: string, payload: unknown) => void): (() => void) => {
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (m: MessageEvent) => handler(m.data.event, m.data.payload);
  } catch { /* no-op */ }
  return () => { try { bc?.close(); } catch {} };
};

// ─────────────────────────────────────────── session + tier resolution

export const getOrCreateSessionId = (): string => {
  let sid = localStorage.getItem(KEY.session);
  if (sid) return sid;
  sid = 'sess_' + uuid().replace(/-/g, '').slice(0, 24);
  localStorage.setItem(KEY.session, sid);
  // mirror as cookie so SSR/Phase-2 server can read it
  document.cookie = `${KEY.session}=${sid}; Max-Age=${30 * 86400}; Path=/; SameSite=Lax`;
  return sid;
};

export interface TierContext {
  tier: Tier;
  userId: string;
  userName: string | null;
  userEmail: string | null;
}

export const resolveTierContext = (currentUser?: { id: string; email: string; name?: string; plan?: string } | null): TierContext => {
  if (currentUser && currentUser.email) {
    const tier: Tier = currentUser.plan === 'enterprise' || currentUser.plan === 'pro'
      ? 'paid'
      : 'registered';
    return { tier, userId: currentUser.id, userName: currentUser.name ?? currentUser.email.split('@')[0], userEmail: currentUser.email };
  }
  const sid = getOrCreateSessionId();
  return { tier: 'anonymous', userId: sid, userName: null, userEmail: null };
};

// ───────────────────────────────────────────────── user record

const loadUser = (id: string): GamificationUser | null => {
  const u = read<GamificationUser | null>(KEY.user, null);
  if (u && u.id === id) return u;
  return null;
};

const saveUser = (u: GamificationUser): void => {
  write(KEY.user, u);
  broadcast('user', u);
};

export const getOrCreateUser = (currentUser?: { id: string; email: string; name?: string; plan?: string } | null): GamificationUser => {
  const ctx = resolveTierContext(currentUser);
  const existing = loadUser(ctx.userId);
  if (existing) {
    // promote tier if registered/paid user signs in mid-session
    if (existing.tier !== ctx.tier) {
      const promoted: GamificationUser = { ...existing, tier: ctx.tier, email: ctx.userEmail, name: ctx.userName };
      saveUser(promoted);
      return promoted;
    }
    return existing;
  }
  const banned = read<Record<string, { reason: string; at: string }>>(KEY.banned, {});
  if (banned[ctx.userId]) {
    // create a banned user record (no credits issued)
    const u: GamificationUser = {
      id: ctx.userId, email: ctx.userEmail, name: ctx.userName,
      tier: ctx.tier, credits: 0, totalEarned: 0, totalSpent: 0,
      referralCode: makeReferralCode(ctx.userId),
      referredBy: readPendingReferralCode(),
      createdAt: now(), lastLoginAt: now(),
      dailyLoginStreak: 0, lastDailyLogin: null,
      banned: true, bannedReason: banned[ctx.userId].reason,
    };
    saveUser(u);
    return u;
  }
  const cfg = TIER_TABLE[ctx.tier];
  const u: GamificationUser = {
    id: ctx.userId, email: ctx.userEmail, name: ctx.userName,
    tier: ctx.tier, credits: cfg.startingCredits, totalEarned: cfg.startingCredits, totalSpent: 0,
    referralCode: makeReferralCode(ctx.userId),
    referredBy: readPendingReferralCode(),
    createdAt: now(), lastLoginAt: now(),
    dailyLoginStreak: 1, lastDailyLogin: today(),
    banned: false, bannedReason: null,
  };
  saveUser(u);
  awardDailyLoginIfDue(u);
  return u;
};

const makeReferralCode = (userId: string): string => {
  if (userId.startsWith('user_')) return userId.slice(5, 13);
  if (userId.startsWith('sess_')) return 'guest-' + userId.slice(5, 11);
  return userId.slice(0, 8);
};

// ─────────────────────────────────────────── pending referral capture

const readPendingReferralCode = (): string | null => {
  const raw = localStorage.getItem(KEY.pendingRef);
  if (raw) return raw;
  // try cookie
  const m = document.cookie.match(new RegExp(`(?:^|; )${KEY.refCookie}=([^;]+)`));
  if (m) return decodeURIComponent(m[1]);
  // try URL
  const url = new URL(window.location.href);
  const q = url.searchParams.get('ref');
  if (q) {
    localStorage.setItem(KEY.pendingRef, q);
    document.cookie = `${KEY.refCookie}=${encodeURIComponent(q)}; Max-Age=${30 * 86400}; Path=/; SameSite=Lax`;
    return q;
  }
  return null;
};

export const captureReferralFromUrl = (): string | null => readPendingReferralCode();

// ───────────────────────────────────────────── credit operations

export interface AwardOptions {
  description?: string;
  relatedId?: string;
  subtype?: string;
  silent?: boolean;
}

export const award = (amount: number, type: TxType, opts: AwardOptions = {}, currentUser?: any): CreditTransaction | null => {
  const ctx = resolveTierContext(currentUser);
  const user = getOrCreateUser(currentUser);
  if (!user || user.banned) return null;
  const cfg = TIER_TABLE[user.tier];
  // Admin accounts have effectively unlimited credits (cap at 999_999).
  const cap = (currentUser && currentUser.email === 'admin@omniconvert.com') ? 999_999 : cfg.maxCredits;
  const newBalance = Math.min(cap, Math.max(0, user.credits + amount));
  const actualAmount = newBalance - user.credits;
  if (actualAmount === 0 && amount !== 0) {
    return null;
  }
  const updated: GamificationUser = {
    ...user,
    credits: newBalance,
    totalEarned: user.totalEarned + Math.max(0, actualAmount),
    lastLoginAt: now(),
  };
  saveUser(updated);
  const tx: CreditTransaction = {
    id: uuid(), userId: user.id, amount: actualAmount, type,
    subtype: opts.subtype, description: opts.description, relatedId: opts.relatedId,
    balanceAfter: newBalance, createdAt: now(),
  };
  const txs = read<CreditTransaction[]>(KEY.tx, []);
  txs.unshift(tx);
  write(KEY.tx, txs.slice(0, 500));
  broadcast('tx', tx);
  if (!opts.silent) broadcast('toast', tx);
  return tx;
};

export const spend = (amount: number, type: TxType, opts: AwardOptions = {}, currentUser?: any): { ok: true; tx: CreditTransaction } | { ok: false; reason: 'insufficient' | 'banned' | 'capped' } => {
  const user = getOrCreateUser(currentUser);
  if (!user) return { ok: false, reason: 'banned' };
  if (user.banned) return { ok: false, reason: 'banned' };
  // Admin bypass: never block conversion with insufficient credits.
  if (currentUser && currentUser.email === 'admin@omniconvert.com') {
    const newBalance = user.credits; // unchanged — admin doesn't pay
    saveUser({ ...user, lastLoginAt: now() });
    const tx: CreditTransaction = {
      id: uuid(), userId: user.id, amount: 0, type,
      subtype: (opts.subtype ?? '') + ':admin-bypass', description: (opts.description ?? '') + ' (admin bypass)',
      relatedId: opts.relatedId, balanceAfter: newBalance, createdAt: now(),
    };
    const txs = read<CreditTransaction[]>(KEY.tx, []);
    txs.unshift(tx);
    write(KEY.tx, txs.slice(0, 500));
    broadcast('tx', tx);
    return { ok: true, tx };
  }
  if (user.credits < amount) return { ok: false, reason: 'insufficient' };
  const newBalance = user.credits - amount;
  const updated: GamificationUser = {
    ...user,
    credits: newBalance,
    totalSpent: user.totalSpent + amount,
  };
  saveUser(updated);
  const tx: CreditTransaction = {
    id: uuid(), userId: user.id, amount: -amount, type,
    subtype: opts.subtype, description: opts.description, relatedId: opts.relatedId,
    balanceAfter: newBalance, createdAt: now(),
  };
  const txs = read<CreditTransaction[]>(KEY.tx, []);
  txs.unshift(tx);
  write(KEY.tx, txs.slice(0, 500));
  broadcast('tx', tx);
  return { ok: true, tx };
};

export const refund = (originalTxId: string, type: TxType, opts: AwardOptions = {}, currentUser?: any): CreditTransaction | null => {
  const txs = read<CreditTransaction[]>(KEY.tx, []);
  const original = txs.find(t => t.id === originalTxId);
  if (!original || original.amount >= 0) return null;
  return award(Math.abs(original.amount), type, { ...opts, relatedId: originalTxId }, currentUser);
};

export const getBalance = (currentUser?: any): number => {
  const u = getOrCreateUser(currentUser);
  return u.credits;
};

export const getHistory = (limit = 50, currentUser?: any): CreditTransaction[] => {
  const ctx = resolveTierContext(currentUser);
  const cfg = TIER_TABLE[ctx.tier];
  const txs = read<CreditTransaction[]>(KEY.tx, []);
  // retention filter (paid = unlimited)
  const cutoff = Date.now() - cfg.historyRetentionDays * 86400 * 1000;
  return txs.filter(t => t.userId === ctx.userId && Date.parse(t.createdAt) > cutoff).slice(0, limit);
};

export const getUser = (currentUser?: any): GamificationUser => getOrCreateUser(currentUser);

// ──────────────────────────────────────────────── daily login

export const claimDailyLogin = (currentUser?: any): { credited: boolean; streak: number; amount: number } => {
  const u = getOrCreateUser(currentUser);
  if (u.banned) return { credited: false, streak: 0, amount: 0 };
  if (u.lastDailyLogin === today()) return { credited: false, streak: u.dailyLoginStreak, amount: 0 };
  const cfg = TIER_TABLE[u.tier];
  // streak resets if more than 2 days gap
  const yesterday = new Date(Date.now() - 86400 * 1000).toISOString().slice(0, 10);
  const continued = u.lastDailyLogin === yesterday;
  const newStreak = continued ? u.dailyLoginStreak + 1 : 1;
  const updated: GamificationUser = {
    ...u,
    dailyLoginStreak: newStreak,
    lastDailyLogin: today(),
    lastLoginAt: now(),
  };
  saveUser(updated);
  const tx = award(cfg.dailyLogin, 'daily_login', {
    description: continued ? `Daily login · streak day ${newStreak}` : 'Daily login bonus',
    subtype: 'streak:' + newStreak,
  }, currentUser);
  return { credited: !!tx, streak: newStreak, amount: cfg.dailyLogin };
};

const awardDailyLoginIfDue = (u: GamificationUser): void => {
  // called on user creation — already credited starting credits,
  // mark the streak as having claimed today
  const updated: GamificationUser = { ...u, lastDailyLogin: today() };
  saveUser(updated);
};

// ───────────────────────────────────────────── conversion cost

export interface ConversionCostInput {
  toolCategory: string;
  inputFormat: string;
  totalSizeMB: number;
  fileCount: number;
  premiumFormat?: boolean;
  priorityQueue?: boolean;
  ocr?: boolean;
  videoMinutes?: number;
}

export const computeConversionCost = (input: ConversionCostInput, currentUser?: any): number => {
  const ctx = resolveTierContext(currentUser);
  const cfg = TIER_TABLE[ctx.tier];
  let cost = 1;                                        // base
  if (input.totalSizeMB > 10) {
    cost += Math.ceil((input.totalSizeMB - 10) * 0.1); // 0.1/MB over 10MB
  }
  if (input.fileCount > 1) {
    cost = cost + (input.fileCount - 1) * (1 * 0.8);   // batch multiplier
  }
  if (input.premiumFormat) cost *= 2;
  if (input.priorityQueue) cost += 2;
  if (input.ocr) cost += 3;
  if (input.videoMinutes) cost += input.videoMinutes * 2;
  if (input.toolCategory === 'CAD') cost += 3;
  // round up
  return Math.max(1, Math.ceil(cost));
};

// ──────────────────────────────────────────────── admin ops

export const adminAdjustCredits = (userId: string, delta: number, reason: string): CreditTransaction | null => {
  const u = read<GamificationUser | null>(KEY.user, null);
  if (!u || u.id !== userId) return null;
  const target = { ...u, credits: Math.max(0, u.credits + delta) };
  saveUser(target);
  const tx: CreditTransaction = {
    id: uuid(), userId, amount: delta, type: 'admin_adjust',
    description: reason, balanceAfter: target.credits, createdAt: now(),
  };
  const txs = read<CreditTransaction[]>(KEY.tx, []);
  txs.unshift(tx);
  write(KEY.tx, txs.slice(0, 500));
  broadcast('tx', tx);
  return tx;
};

export const adminSetTier = (userId: string, tier: Tier): void => {
  const u = read<GamificationUser | null>(KEY.user, null);
  if (!u || u.id !== userId) return;
  saveUser({ ...u, tier });
  broadcast('user', { ...u, tier });
};

export const adminBan = (userId: string, reason: string): void => {
  const banned = read<Record<string, { reason: string; at: string }>>(KEY.banned, {});
  banned[userId] = { reason, at: now() };
  write(KEY.banned, banned);
  const u = read<GamificationUser | null>(KEY.user, null);
  if (u && u.id === userId) saveUser({ ...u, banned: true, bannedReason: reason });
  broadcast('admin_ban', { userId, reason });
};

export const adminUnban = (userId: string): void => {
  const banned = read<Record<string, { reason: string; at: string }>>(KEY.banned, {});
  delete banned[userId];
  write(KEY.banned, banned);
  const u = read<GamificationUser | null>(KEY.user, null);
  if (u && u.id === userId) saveUser({ ...u, banned: false, bannedReason: null });
  broadcast('admin_unban', { userId });
};

export const adminResetDailyCount = (userId: string, _limitType: string): void => {
  const limits = read<DailyLimit[]>(KEY.limits, []);
  const todayStr = today();
  const next = limits.filter(l => !(l.userId === userId && l.date === todayStr));
  write(KEY.limits, next);
  broadcast('admin_reset_limit', { userId, limitType: _limitType });
};

// ─────────────────────────────────────────────── leaderboard

export interface LeaderboardRow {
  userId: string;
  name: string;
  tier: Tier;
  credits: number;
  totalEarnedToday: number;
}

export const getLeaderboard = (period: 'day' | 'week' | 'month' = 'day'): LeaderboardRow[] => {
  const txs = read<CreditTransaction[]>(KEY.tx, []);
  const nowMs = Date.now();
  const cutoff = nowMs - (period === 'day' ? 86400 : period === 'week' ? 7 * 86400 : 30 * 86400) * 1000;
  const earnByUser = new Map<string, number>();
  for (const t of txs) {
    if (Date.parse(t.createdAt) < cutoff) continue;
    if (t.amount > 0) earnByUser.set(t.userId, (earnByUser.get(t.userId) ?? 0) + t.amount);
  }
  // also surface current user record for display
  const u = loadUser(getOrCreateSessionId());
  const allUserIds = new Set<string>([...earnByUser.keys()]);
  if (u) allUserIds.add(u.id);
  return Array.from(allUserIds).map(userId => ({
    userId,
    name: u?.id === userId ? (u.name ?? u.email ?? 'You') : userId.slice(0, 12),
    tier: u?.id === userId ? u.tier : 'anonymous',
    credits: u?.id === userId ? u.credits : 0,
    totalEarnedToday: earnByUser.get(userId) ?? 0,
  })).sort((a, b) => b.totalEarnedToday - a.totalEarnedToday).slice(0, 25);
};

// ─────────────────────────────────────────────── utilities export

export const onGamificationEvent = (handler: (event: string, payload: unknown) => void): (() => void) => listen(handler);

export const resetLocalGamification = (): void => {
  Object.values(KEY).forEach(k => localStorage.removeItem(k));
  broadcast('reset', {});
};

// ─────────────────────────────────────────────── tier helpers

export const tierLabel = (t: Tier): string =>
  t === 'paid' ? 'Pro' : t === 'registered' ? 'Free' : 'Guest';

export const tierColor = (t: Tier): string =>
  t === 'paid' ? 'text-violet-700 bg-violet-50' :
  t === 'registered' ? 'text-blue-700 bg-blue-50' :
  'text-slate-700 bg-slate-100';

export const getCurrentUserTier = (currentUser?: any): Tier => resolveTierContext(currentUser).tier;

export const getCurrentTierConfig = (currentUser?: any): TierConfig => TIER_TABLE[resolveTierContext(currentUser).tier];