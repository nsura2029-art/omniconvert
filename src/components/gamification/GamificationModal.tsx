import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Gem, ThumbsUp, Link as LinkIcon, Share2, Activity,
  Copy, Check, ArrowRight, Lock, Sparkles, ChevronRight, Crown,
} from 'lucide-react';
import { User } from '../../types';
import {
  GamificationUser, Tier, getUser, getHistory, getBalance,
  getCurrentTierConfig, TIER_TABLE, tierLabel, tierColor,
  SharePlatform, Referral,
} from '../../data/gamification';
import UpvoteButton from './UpvoteButton';
import ShareGrid from './ShareGrid';
import ActivityFeed from './ActivityFeed';
import {
  readUpvotes, getUpvoteCount,
} from './upvoteStore';
import {
  getReferralLink, getReferralStats, copyReferralLink,
} from './referralStore';

interface Props {
  currentUser?: User | null;
  onClose: () => void;
  onClaimDaily: () => void;
}

type Tab = 'credits' | 'upvote' | 'refer' | 'share' | 'activity';

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'credits',  label: 'Credits',  icon: Gem },
  { id: 'upvote',   label: 'Upvote',   icon: ThumbsUp },
  { id: 'refer',    label: 'Refer',    icon: LinkIcon },
  { id: 'share',    label: 'Share',    icon: Share2 },
  { id: 'activity', label: 'Activity', icon: Activity },
];

const GamificationModal: React.FC<Props> = ({ currentUser, onClose, onClaimDaily }) => {
  const [tab, setTab] = useState<Tab>('credits');
  const [user, setUser] = useState<GamificationUser | null>(null);
  const [history, setHistory] = useState(getHistory(50, currentUser));

  useEffect(() => {
    setUser(getUser(currentUser));
    setHistory(getHistory(50, currentUser));
    const id = setInterval(() => {
      setUser(getUser(currentUser));
      setHistory(getHistory(50, currentUser));
    }, 1500);
    return () => clearInterval(id);
  }, [currentUser]);

  if (!user) return null;
  const cfg = getCurrentTierConfig(currentUser);
  const pct = Math.min(100, Math.round((user.credits / cfg.maxCredits) * 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" />
      <motion.div
        initial={{ y: '100%', scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl shadow-slate-900/40 sm:rounded-2xl"
        role="dialog"
        aria-label="Your gamification dashboard"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-700 px-5 py-4 text-white">
          <div>
            <h2 className="text-base font-black tracking-tight">Your OmniConvert dashboard</h2>
            <p className="mt-0.5 text-[11px] font-semibold text-white/70">Earn credits, unlock perks, grow your referral tree.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Tabs */}
        <nav className="flex shrink-0 border-b border-slate-100 bg-white px-2 py-1">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
                aria-pressed={active}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto bg-slate-50/60 px-5 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {tab === 'credits'  && <CreditsTab user={user} cfg={cfg} pct={pct} history={history} currentUser={currentUser} onClaimDaily={onClaimDaily} />}
              {tab === 'upvote'   && <UpvoteTab user={user} cfg={cfg} />}
              {tab === 'refer'    && <ReferTab user={user} cfg={cfg} />}
              {tab === 'share'    && <ShareTab user={user} cfg={cfg} currentUser={currentUser} />}
              {tab === 'activity' && <ActivityFeed userId={user.id} currentUser={currentUser} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────── CreditsTab

const CreditsTab: React.FC<{
  user: GamificationUser; cfg: ReturnType<typeof getCurrentTierConfig>; pct: number;
  history: ReturnType<typeof getHistory>; currentUser?: User | null; onClaimDaily: () => void;
}> = ({ user, cfg, pct, history, currentUser, onClaimDaily }) => {
  const [claiming, setClaiming] = useState(false);
  const alreadyClaimedToday = user.lastDailyLogin === new Date().toISOString().slice(0, 10);

  const handleClaim = async () => {
    setClaiming(true);
    onClaimDaily();
    setTimeout(() => setClaiming(false), 400);
  };

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-3 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 px-5 py-5 text-white">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Credit balance</p>
            <p className="mt-1 text-4xl font-black tabular-nums">{user.credits.toLocaleString()}</p>
            <p className="mt-1 text-[11px] font-bold text-white/80">/ {cfg.maxCredits.toLocaleString()} max · tier {tierLabel(user.tier)}</p>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${tierColor(user.tier)}`}>
            {user.tier === 'paid' && <Crown className="h-3 w-3" />}
            {tierLabel(user.tier)}
          </span>
        </div>
        <div className="px-5 pb-5">
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Mini label="Earned" value={user.totalEarned.toLocaleString()} />
            <Mini label="Spent"  value={user.totalSpent.toLocaleString()} />
            <Mini label="Streak" value={user.dailyLoginStreak + 'd'} />
          </div>
          <button
            type="button"
            onClick={handleClaim}
            disabled={alreadyClaimedToday || claiming}
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black transition active:scale-[0.98] ${
              alreadyClaimedToday
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-600 hover:to-teal-600'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {alreadyClaimedToday ? `Claimed today · see you tomorrow` : `Claim +${cfg.dailyLogin} daily login`}
          </button>
        </div>
      </div>

      {/* Tier ladder */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Tier ladder</h3>
        <div className="mt-3 space-y-2">
          {(['anonymous', 'registered', 'paid'] as Tier[]).map(t => {
            const c = TIER_TABLE[t];
            const isCurrent = t === user.tier;
            return (
              <div key={t} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                isCurrent ? 'border-blue-300 bg-blue-50' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${tierColor(t)}`}>
                    {t === 'paid' && <Crown className="h-3 w-3" />}
                    {tierLabel(t)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700">{c.startingCredits} start · max {c.maxCredits.toLocaleString()}</span>
                </div>
                {isCurrent && <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">You</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Recent activity</h3>
          <span className="text-[10px] font-black text-slate-400">{history.length} entries</span>
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {history.slice(0, 8).map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 text-[11px]">
              <div className="min-w-0">
                <p className="truncate font-black text-slate-800">{t.description ?? t.type.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleString()}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums ${
                t.amount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {t.amount > 0 ? '+' : ''}{t.amount}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <p className="py-4 text-center text-[11px] text-slate-500">No transactions yet — convert a file to earn your first credit.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Mini: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 px-2 py-2">
    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-0.5 text-base font-black tabular-nums text-slate-900">{value}</p>
  </div>
);

// ─────────────────────────────────────────────────────── UpvoteTab

const UpvoteTab: React.FC<{ user: GamificationUser; cfg: ReturnType<typeof getCurrentTierConfig> }> = ({ user, cfg }) => {
  const pairs = useMemo(() => {
    // Suggested pairs to upvote (in Phase 1: top user-pickable categories).
    return [
      { category: 'CAD',         source: 'STL', target: 'OBJ' },
      { category: 'Documents',   source: 'PDF', target: 'DOCX' },
      { category: 'Images',      source: 'PNG', target: 'JPG' },
      { category: 'Video',       source: 'MP4', target: 'GIF' },
      { category: 'Audio',       source: 'MP3', target: 'WAV' },
      { category: 'Archives',    source: 'ZIP', target: 'TAR' },
    ];
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Help us prioritize</h3>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">Upvote the conversions you need. You earn +{cfg.rewards.upvote} credits each.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pairs.map(p => (
          <div key={`${p.category}-${p.source}-${p.target}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{p.category}</p>
                <p className="mt-1 text-base font-black text-slate-900">{p.source} → {p.target}</p>
                <p className="mt-1 text-[11px] text-slate-500">{getUpvoteCount(p.category, p.source, p.target)} upvotes total</p>
              </div>
              <UpvoteButton category={p.category} source={p.source} target={p.target} currentUser={user} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────── ReferTab

const ReferTab: React.FC<{ user: GamificationUser; cfg: ReturnType<typeof getCurrentTierConfig> }> = ({ user, cfg }) => {
  const link = getReferralLink(user.referralCode);
  const stats = getReferralStats(user.id);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Your referral link</h3>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">Earn {cfg.rewards.referralSignup} credits per signup · {cfg.rewards.referralConvert} per conversion.</p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-700">{link}</code>
          <button
            type="button"
            onClick={async () => { await copyReferralLink(link); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-black text-white hover:bg-slate-700"
          >
            {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatTile label="Clicks"   value={stats.clicks}   accent="text-slate-900" />
        <StatTile label="Signups"  value={stats.signups}  accent="text-blue-700" />
        <StatTile label="Converts" value={stats.converts} accent="text-emerald-700" />
        <StatTile label="Paid"     value={stats.paid}     accent="text-violet-700" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Milestones</h3>
        <div className="mt-3 space-y-2">
          {[
            { goal: 1,   reward: cfg.rewards.referralSignup * 1,                label: '1st referral' },
            { goal: 5,   reward: cfg.rewards.referralSignup * 5,                label: '5 referrals' },
            { goal: 10,  reward: cfg.rewards.referralSignup * 10 + 25,          label: '10 referrals' },
            { goal: 25,  reward: cfg.rewards.referralSignup * 25 + 100,         label: '25 referrals · Pro month free' },
            { goal: 50,  reward: cfg.rewards.referralSignup * 50 + 500,         label: '50 referrals · Pro year free' },
          ].map(m => {
            const done = stats.signups >= m.goal;
            return (
              <div key={m.goal} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] ${
                done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100'
              }`}>
                <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                  {done ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Lock className="h-3.5 w-3.5 text-slate-300" />}
                  {m.label}
                </span>
                <span className={`text-[10px] font-black ${done ? 'text-emerald-700' : 'text-slate-400'}`}>+{m.reward} cr</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatTile: React.FC<{ label: string; value: number; accent: string }> = ({ label, value, accent }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-1 text-xl font-black tabular-nums ${accent}`}>{value.toLocaleString()}</p>
  </div>
);

// ─────────────────────────────────────────────────────── ShareTab

const ShareTab: React.FC<{ user: GamificationUser; cfg: ReturnType<typeof getCurrentTierConfig>; currentUser?: User | null }> = ({ user, cfg, currentUser }) => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Share & earn</h3>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">One share per platform per day. Cooldown 24h.</p>
    </div>
    <ShareGrid user={user} cfg={cfg} />
  </div>
);

export default GamificationModal;