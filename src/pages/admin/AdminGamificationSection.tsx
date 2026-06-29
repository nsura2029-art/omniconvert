import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Gem, Users, TrendingUp, Sparkles, ThumbsUp, Share2, AlertTriangle, Download, RefreshCw, Crown } from 'lucide-react';
import {
  GamificationUser, getHistory, getLeaderboard, onGamificationEvent,
  CreditTransaction, tierLabel, tierColor,
} from '../../data/gamification';
import { getTrendingPairs } from '../../components/gamification/upvoteStore';
import { getReferralStats } from '../../components/gamification/referralStore';
import { getShareHistory } from '../../components/gamification/shareStore';

const AdminGamificationSection: React.FC = () => {
  const [tick, setTick] = useState(0);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [autoRefresh, setAutoRefresh] = useState<3 | 5 | 10 | 30 | 0>(3);

  // realtime polling
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setTick(t => t + 1), autoRefresh * 1000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // cross-tab sync
  useEffect(() => {
    const off = onGamificationEvent((event) => {
      if (event === 'tx' || event === 'user' || event === 'upvote' || event === 'share' || event === 'referral') {
        setTick(t => t + 1);
      }
    });
    return () => off();
  }, []);

  const data = useMemo(() => computeStats(period, tick), [period, tick]);

  const exportCsv = () => {
    const rows = [['userId', 'tier', 'credits', 'totalEarned', 'totalSpent', 'streak', 'banned']];
    for (const u of data.allUsers) {
      rows.push([u.id, u.tier, String(u.credits), String(u.totalEarned), String(u.totalSpent), String(u.dailyLoginStreak), String(u.banned)]);
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `gamification-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Gamification</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Realtime credit, upvote, referral & share flow. Updates every {autoRefresh || '—'}s + cross-tab sync.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase"
          >
            <option value="day">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
          <select
            value={autoRefresh}
            onChange={e => setAutoRefresh(parseInt(e.target.value) as any)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black"
            aria-label="Auto-refresh interval"
          >
            <option value={3}>3s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={0}>Off</option>
          </select>
          <button
            type="button"
            onClick={() => setTick(t => t + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Active users"   value={data.activeUsers.toLocaleString()} hint={`${data.allUsers.length} total`} icon={Users} accent="text-blue-700" bg="bg-blue-50" realtime />
        <Kpi label="Credits given"  value={`+${data.creditsGiven.toLocaleString()}`} hint={`${period} window`} icon={Gem} accent="text-emerald-700" bg="bg-emerald-50" realtime />
        <Kpi label="Credits spent"  value={`-${data.creditsSpent.toLocaleString()}`} hint={`${period} window`} icon={Gem} accent="text-rose-700" bg="bg-rose-50" realtime />
        <Kpi label="Net flow"       value={(data.creditsGiven - data.creditsSpent >= 0 ? '+' : '') + (data.creditsGiven - data.creditsSpent).toLocaleString()} hint="given − spent" icon={TrendingUp} accent="text-violet-700" bg="bg-violet-50" realtime />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Upvotes"   value={data.upvoteCount.toLocaleString()} hint={`${data.uniquePairs.length} unique pairs`} icon={ThumbsUp} accent="text-cyan-700" bg="bg-cyan-50" realtime />
        <Kpi label="Shares"    value={data.shareCount.toLocaleString()} hint={`${data.uniquePlatforms.length} platforms`} icon={Share2} accent="text-amber-700" bg="bg-amber-50" realtime />
        <Kpi label="Referrals" value={data.referralCount.toLocaleString()} hint={`${data.signups} signups · ${data.paidConversions} paid`} icon={Sparkles} accent="text-pink-700" bg="bg-pink-50" realtime />
        <Kpi label="Alerts"    value={data.alerts.length.toString()} hint="anti-gaming flags" icon={AlertTriangle} accent="text-rose-700" bg="bg-rose-50" />
      </div>

      {/* Credit flow chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Credit flow (live)</h3>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">In (green) vs Out (rose) over the {period}.</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> In</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Out</span>
          </div>
        </div>
        <FlowChart points={data.flowPoints} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Top earners</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">{period} leaderboard · click row to inspect.</p>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.topEarners.slice(0, 8).map((u, i) => (
              <li key={u.userId} className="flex items-center gap-3 py-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-black text-slate-800">{u.name}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{u.userId.slice(0, 18)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${tierColor(u.tier)}`}>{tierLabel(u.tier)}</span>
                <span className="w-16 text-right text-xs font-black tabular-nums text-emerald-700">+{u.totalEarnedToday}</span>
              </li>
            ))}
            {data.topEarners.length === 0 && (
              <li className="py-6 text-center text-xs text-slate-500">No earners in this window.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Trending upvotes</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Top pairs users want prioritized.</p>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.trending.slice(0, 8).map((p, i) => (
              <li key={`${p.category}-${p.source}-${p.target}`} className="flex items-center gap-3 py-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-50 text-[10px] font-black text-cyan-700">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-black text-slate-800">{p.source} → {p.target}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{p.category}</p>
                </div>
                <span className="text-xs font-black tabular-nums text-cyan-700">{p.count}</span>
              </li>
            ))}
            {data.trending.length === 0 && (
              <li className="py-6 text-center text-xs text-slate-500">No upvotes yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Recent transactions</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">When</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTxs.slice(0, 50).map(t => (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 text-xs text-slate-700">{new Date(t.createdAt).toLocaleTimeString()}</td>
                  <td className="px-4 py-2 text-xs font-bold text-slate-700">{t.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2 text-xs text-slate-700 max-w-xs truncate">{t.description ?? '—'}</td>
                  <td className={`px-4 py-2 text-right text-xs font-black tabular-nums ${t.amount > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </td>
                  <td className="px-4 py-2 text-right text-xs font-black tabular-nums text-slate-900">{t.balanceAfter}</td>
                </tr>
              ))}
              {data.recentTxs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-500">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data.alerts.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-rose-700">
            <AlertTriangle className="h-4 w-4" /> Anti-gaming alerts
          </h3>
          <ul className="mt-3 space-y-1">
            {data.alerts.map((a, i) => (
              <li key={i} className="text-xs font-bold text-rose-700">{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────── compute

interface ComputedStats {
  activeUsers: number;
  allUsers: GamificationUser[];
  creditsGiven: number;
  creditsSpent: number;
  upvoteCount: number;
  uniquePairs: any[];
  shareCount: number;
  uniquePlatforms: any[];
  referralCount: number;
  signups: number;
  paidConversions: number;
  flowPoints: Array<{ t: number; in: number; out: number }>;
  topEarners: ReturnType<typeof getLeaderboard>;
  trending: ReturnType<typeof getTrendingPairs>;
  recentTxs: CreditTransaction[];
  alerts: string[];
}

const computeStats = (period: 'day' | 'week' | 'month', _tick: number): ComputedStats => {
  const txs = JSON.parse(localStorage.getItem('omni_gam_tx') || '[]') as CreditTransaction[];
  const user = JSON.parse(localStorage.getItem('omni_gam_user') || 'null') as GamificationUser | null;
  const allUsers: GamificationUser[] = user ? [user] : [];
  const banned: Record<string, any> = JSON.parse(localStorage.getItem('omni_gam_banned_users') || '{}');
  for (const id of Object.keys(banned)) {
    if (!allUsers.find(u => u.id === id)) {
      allUsers.push({ id, tier: 'anonymous', credits: 0, totalEarned: 0, totalSpent: 0,
        referralCode: '', referredBy: null, createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(), dailyLoginStreak: 0, lastDailyLogin: null,
        email: null, name: null, banned: true, bannedReason: banned[id].reason });
    }
  }

  const nowMs = Date.now();
  const cutoff = nowMs - (period === 'day' ? 86400 : period === 'week' ? 7 * 86400 : 30 * 86400) * 1000;
  const periodTxs = txs.filter(t => Date.parse(t.createdAt) >= cutoff);
  const creditsGiven = periodTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const creditsSpent = Math.abs(periodTxs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  // upvote count from upvoteStore
  const upvotes = JSON.parse(localStorage.getItem('omni_gam_upvotes') || '[]') as any[];
  const shares = JSON.parse(localStorage.getItem('omni_gam_shares') || '[]') as any[];
  const referrals = JSON.parse(localStorage.getItem('omni_gam_referrals') || '[]') as any[];

  // flow: 12 buckets across the period
  const buckets = period === 'day' ? 24 : period === 'week' ? 14 : 30;
  const bucketMs = (nowMs - cutoff) / buckets;
  const flowPoints = Array.from({ length: buckets }, (_, i) => {
    const from = cutoff + i * bucketMs;
    const to = cutoff + (i + 1) * bucketMs;
    const inP = periodTxs.filter(t => t.amount > 0 && Date.parse(t.createdAt) >= from && Date.parse(t.createdAt) < to).reduce((s, t) => s + t.amount, 0);
    const outP = Math.abs(periodTxs.filter(t => t.amount < 0 && Date.parse(t.createdAt) >= from && Date.parse(t.createdAt) < to).reduce((s, t) => s + t.amount, 0));
    return { t: i, in: inP, out: outP };
  });

  // top earners
  const earnByUser = new Map<string, number>();
  for (const t of periodTxs) {
    if (t.amount > 0) earnByUser.set(t.userId, (earnByUser.get(t.userId) ?? 0) + t.amount);
  }
  const topEarners = Array.from(earnByUser.entries()).map(([userId, totalEarnedToday]) => ({
    userId, name: user?.id === userId ? (user.name ?? user.email ?? userId) : userId.slice(0, 12),
    tier: user?.id === userId ? user.tier : 'anonymous' as const,
    credits: user?.id === userId ? user.credits : 0,
    totalEarnedToday,
  })).sort((a, b) => b.totalEarnedToday - a.totalEarnedToday);

  // trending pairs
  const pairMap = new Map<string, { category: string; source: string; target: string; count: number }>();
  for (const u of upvotes) {
    const k = `${u.category}::${u.sourceFormat}::${u.targetFormat}`;
    const ex = pairMap.get(k);
    if (ex) ex.count++;
    else pairMap.set(k, { category: u.category, source: u.sourceFormat, target: u.targetFormat, count: 1 });
  }
  const trending = Array.from(pairMap.values()).sort((a, b) => b.count - a.count);

  const uniquePairs = Array.from(new Set(upvotes.map((u: any) => `${u.category}::${u.sourceFormat}::${u.targetFormat}`)));
  const uniquePlatforms = Array.from(new Set(shares.map((s: any) => s.platform)));
  const signups = referrals.filter((r: any) => ['signed_up', 'converted', 'paid'].includes(r.status)).length;
  const paidConversions = referrals.filter((r: any) => r.status === 'paid').length;

  // anti-gaming alerts: flag users with >5 same-platform shares in window
  const alerts: string[] = [];
  const samePlatShareCount = new Map<string, Map<string, number>>();
  for (const s of shares) {
    if (!samePlatShareCount.has(s.userId)) samePlatShareCount.set(s.userId, new Map());
    const m = samePlatShareCount.get(s.userId)!;
    m.set(s.platform, (m.get(s.platform) ?? 0) + 1);
  }
  for (const [userId, m] of samePlatShareCount.entries()) {
    for (const [platform, count] of m.entries()) {
      if (count > 5) alerts.push(`User ${userId.slice(0, 12)} shared ${platform} ${count}× in window — possible automation.`);
    }
  }
  // flag users with >20 upvotes in window
  const upByUser = new Map<string, number>();
  for (const u of upvotes) {
    upByUser.set(u.userId, (upByUser.get(u.userId) ?? 0) + 1);
  }
  for (const [userId, count] of upByUser.entries()) {
    if (count > 20) alerts.push(`User ${userId.slice(0, 12)} cast ${count} upvotes in window — daily limit bypass.`);
  }

  return {
    activeUsers: allUsers.filter(u => Date.parse(u.lastLoginAt) >= cutoff).length,
    allUsers,
    creditsGiven, creditsSpent,
    upvoteCount: upvotes.length,
    uniquePairs, shareCount: shares.length, uniquePlatforms,
    referralCount: referrals.length, signups, paidConversions,
    flowPoints, topEarners, trending,
    recentTxs: txs.slice(0, 50),
    alerts,
  };
};

// ─────────────────────────────────────────────────────── sub-components

const Kpi: React.FC<{
  label: string; value: string; hint?: string;
  icon: React.ComponentType<{ className?: string }>; accent: string; bg: string; realtime?: boolean;
}> = ({ label, value, hint, icon: Icon, accent, bg, realtime }) => (
  <motion.div
    layout
    className="rounded-xl border border-slate-200 bg-white p-4 relative overflow-hidden"
  >
    {realtime && (
      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
      </span>
    )}
    <div className={`grid h-9 w-9 place-items-center rounded-lg ${bg}`}>
      <Icon className={`h-4 w-4 ${accent}`} />
    </div>
    <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-1 text-2xl font-black tabular-nums ${accent}`}>{value}</p>
    {hint && <p className="mt-1 text-[11px] font-semibold text-slate-500">{hint}</p>}
  </motion.div>
);

const FlowChart: React.FC<{ points: Array<{ t: number; in: number; out: number }> }> = ({ points }) => {
  const max = Math.max(1, ...points.flatMap(p => [p.in, p.out]));
  const w = 800, h = 160;
  const pad = 8;
  const innerW = w - pad * 2, innerH = h - pad * 2;
  const xStep = innerW / Math.max(1, points.length - 1);
  const yFor = (v: number) => pad + innerH - (v / max) * innerH;
  const pathIn = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * xStep} ${yFor(p.in)}`).join(' ');
  const pathOut = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * xStep} ${yFor(p.out)}`).join(' ');
  const areaIn = points.length > 0 ? `${pathIn} L ${pad + (points.length - 1) * xStep} ${pad + innerH} L ${pad} ${pad + innerH} Z` : '';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-40 w-full">
      <defs>
        <linearGradient id="g-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.45" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaIn} fill="url(#g-in)" />
      <path d={pathIn} fill="none" stroke="#10b981" strokeWidth="2" />
      <path d={pathOut} fill="none" stroke="#f43f5e" strokeWidth="2" />
      {/* axis */}
      <line x1={pad} y1={pad + innerH} x2={pad + innerW} y2={pad + innerH} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
};

export default AdminGamificationSection;