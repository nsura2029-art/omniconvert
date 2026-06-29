import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Award, Gift, Ban, Trash2, Search, RefreshCw } from 'lucide-react';
import { User } from '../../types';

const PLANS = ['free', 'pro', 'enterprise'] as const;

const AdminUsersSection: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [tick, setTick] = useState(0);

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
                  <button
                    type="button"
                    onClick={() => removeUser(u.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-50"
                    title="Remove user"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-500">No users match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersSection;