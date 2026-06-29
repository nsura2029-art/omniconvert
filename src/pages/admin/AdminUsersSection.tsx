import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Award, Gift, Ban, Trash2, Search, RefreshCw, Gem, Crown, History, Eye } from 'lucide-react';
import { User } from '../../types';
import {
  GamificationUser, adminAdjustCredits, adminSetTier, adminBan, adminUnban,
  getHistory, tierLabel, tierColor,
} from '../../data/gamification';
import { getReferralStats } from '../../components/gamification/referralStore';
import { motion, AnimatePresence } from 'motion/react';

const PLANS = ['free', 'pro', 'enterprise'] as const;
const TIERS = ['anonymous', 'registered', 'paid'] as const;

const AdminUsersSection: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [tick, setTick] = useState(0);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refresh = () => setUsers(JSON.parse(localStorage.getItem('omni_users') || '[]'));
    refresh();
    const id = setInterval(() => { refresh(); setTick(t => t + 1); }, 5000);
    return () => clearInterval(id);
  }, []);

  const filtered = users.filter(u =>
    !query ||
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  const persist = (next: User[]) => {
    setUsers(next);
    localStorage.setItem('omni_users', JSON.stringify(next));
  };

  const setPlan = (id: string, plan: typeof PLANS[number]) => {
    persist(users.map(u => u.id === id ? { ...u, plan } : u));
  };

  const adjustCredits = (id: string, delta: number) => {
    persist(users.map(u => u.id === id ? { ...u, credits: Math.max(0, (u.credits || 0) + delta) } : u));
  };

  const removeUser = (id: string) => {
    if (!confirm('Remove this user? This cannot be undone.')) return;
    persist(users.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">Registered users, plans, credits. Realtime from localStorage.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live · {users.length} users
        </span>
      </header>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => { setUsers(JSON.parse(localStorage.getItem('omni_users') || '[]')); setTick(t => t + 1); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Plan</th>
              <th className="px-4 py-2 text-left">Tier</th>
              <th className="px-4 py-2 text-right">Credits</th>
              <th className="px-4 py-2 text-right">Daily</th>
              <th className="px-4 py-2 text-left">Joined</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                      {u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-800">{u.name}</p>
                      <p className="text-[10px] font-semibold text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.plan}
                    onChange={e => setPlan(u.id, e.target.value as typeof PLANS[number])}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-black uppercase"
                  >
                    {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${tierColor('registered')}`}>
                    <Crown className="h-3 w-3" />
                    {tierLabel('registered')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustCredits(u.id, -10)}
                      className="h-6 w-6 rounded border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50"
                    >-</button>
                    <span className="w-12 text-center text-xs font-black tabular-nums text-slate-900">
                      {(u.credits || 0).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustCredits(u.id, +10)}
                      className="h-6 w-6 rounded border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50"
                    >+</button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-xs font-bold text-slate-700 tabular-nums">
                  {(u.dailyConversionsCount || 0).toLocaleString()} / {u.maxDailyConversions?.toLocaleString() ?? '∞'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDrawerUserId(u.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                      title="View activity"
                    >
                      <Eye className="h-3 w-3" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => removeUser(u.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-50"
                      title="Remove user"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-500">No users match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {drawerUserId && (
          <UserDrawer
            userId={drawerUserId}
            users={users}
            onClose={() => setDrawerUserId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ──────────────────────────────────────────────────── per-user drawer

const UserDrawer: React.FC<{ userId: string; users: User[]; onClose: () => void }> = ({ userId, users, onClose }) => {
  const u = users.find(x => x.id === userId);
  if (!u) return null;
  const txs = getHistory(50);
  const refStats = getReferralStats(userId);
  const [creditDelta, setCreditDelta] = useState(0);
  const [reason, setReason] = useState('');
  const [tier, setTier] = useState<'anonymous' | 'registered' | 'paid'>('registered');
  const [banned, setBanned] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 24, stiffness: 240 }}
        onClick={e => e.stopPropagation()}
        className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <header className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black tracking-tight text-slate-900">{u.name}</h3>
            <button onClick={onClose} className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-50">Close</button>
          </div>
          <p className="text-[11px] font-semibold text-slate-500">{u.email} · {u.id}</p>
        </header>
        <div className="space-y-5 p-5">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Gamification tier</h4>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {TIERS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTier(t); adminSetTier(userId, t); }}
                  className={`rounded-lg border px-2 py-2 text-[10px] font-black uppercase ${tier === t ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {tierLabel(t)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Credit adjustment</h4>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={creditDelta}
                onChange={e => setCreditDelta(parseInt(e.target.value) || 0)}
                placeholder="Δ credits"
                className="w-24 rounded-md border border-slate-200 px-2 py-1 text-xs"
              />
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason (required)"
                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
              />
              <button
                type="button"
                disabled={!creditDelta || !reason.trim()}
                onClick={() => { adminAdjustCredits(userId, creditDelta, reason); setCreditDelta(0); setReason(''); }}
                className="rounded-md bg-slate-900 px-3 py-1 text-xs font-black text-white hover:bg-slate-700 disabled:opacity-50"
              >Apply</button>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Referral stats</h4>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              <Mini label="Clicks"   v={refStats.clicks} />
              <Mini label="Signups"  v={refStats.signups} />
              <Mini label="Converts" v={refStats.converts} />
              <Mini label="Paid"     v={refStats.paid} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Recent transactions</h4>
            <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-100">
              {txs.length === 0 && <p className="p-3 text-center text-[11px] text-slate-500">No transactions.</p>}
              {txs.slice(0, 20).map(t => (
                <div key={t.id} className="flex items-center justify-between border-b border-slate-50 px-3 py-2 text-[11px] last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-800">{t.description ?? t.type}</p>
                    <p className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums ${t.amount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Ban controls</h4>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => { adminBan(userId, 'Admin ban via Users drawer'); setBanned(true); }}
                className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-50"
              ><Ban className="h-3 w-3" /> Ban</button>
              <button
                type="button"
                onClick={() => { adminUnban(userId); setBanned(false); }}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs font-black text-emerald-600 hover:bg-emerald-50"
              >Unban</button>
              <span className={`text-[10px] font-black uppercase ${banned ? 'text-rose-700' : 'text-emerald-700'}`}>{banned ? 'Banned' : 'Active'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Mini: React.FC<{ label: string; v: number }> = ({ label, v }) => (
  <div className="rounded-lg bg-slate-50 px-2 py-2">
    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-0.5 text-base font-black tabular-nums text-slate-900">{v.toLocaleString()}</p>
  </div>
);

export default AdminUsersSection;