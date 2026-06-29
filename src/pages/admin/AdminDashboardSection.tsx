import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Cpu, Flame, DollarSign, Activity, Zap, Award } from 'lucide-react';
import { User, FileConversion } from '../../types';
import { getLocalConversions } from '../../data/localConversions';

interface AdminDashboardSectionProps {
  // The full AdminDashboard component is still mounted at /admin (legacy route),
  // but the new admin panel uses this section to show the high-level KPIs.
  currentUser?: User | null;
  conversions?: FileConversion[];
  systemStats?: { totalRevenue: number; conversionsCount: number };
}

const AdminDashboardSection: React.FC<AdminDashboardSectionProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [conversions, setConversions] = useState<FileConversion[]>([]);
  const [tick, setTick] = useState(0);

  // Realtime: poll localStorage every 5 seconds
  useEffect(() => {
    const refresh = () => {
      setUsers(JSON.parse(localStorage.getItem('omni_users') || '[]'));
      setConversions(getLocalConversions());
    };
    refresh();
    const id = setInterval(() => {
      refresh();
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const proUsers = users.filter(u => u.plan === 'pro').length;
  const enterpriseUsers = users.filter(u => u.plan === 'enterprise').length;
  const totalCredits = users.reduce((s, u) => s + (u.credits || 0), 0);
  const last24h = conversions.filter(c => {
    const t = Date.parse(c.timestamp);
    return Date.now() - t < 24 * 60 * 60 * 1000;
  }).length;
  const successRate = conversions.length === 0 ? 0
    : Math.round((conversions.filter(c => c.status === 'completed').length / conversions.length) * 100);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          High-level admin overview. Realtime signal from localStorage; refreshes every 5s.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Total users"
          value={users.length.toLocaleString()}
          hint={`${proUsers} pro · ${enterpriseUsers} enterprise`}
          icon={Users}
          accent="text-blue-700"
          bg="bg-blue-50"
        />
        <KpiTile
          label="Conversions"
          value={conversions.length.toLocaleString()}
          hint={`${last24h} in last 24h`}
          icon={Activity}
          accent="text-emerald-700"
          bg="bg-emerald-50"
          realtime
        />
        <KpiTile
          label="Success rate"
          value={successRate + '%'}
          hint="lifetime"
          icon={TrendingUp}
          accent="text-violet-700"
          bg="bg-violet-50"
        />
        <KpiTile
          label="Credits in circulation"
          value={totalCredits.toLocaleString()}
          hint={`across ${users.length} users`}
          icon={Zap}
          accent="text-amber-700"
          bg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Latest conversions</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Realtime feed (top 8).</p>
          <div className="mt-3 divide-y divide-slate-100">
            {conversions.slice(0, 8).map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <span className={`h-2 w-2 rounded-full ${c.status === 'completed' ? 'bg-emerald-500' : c.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-black text-slate-800">{c.fileName}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{c.toolName} · {new Date(c.timestamp).toLocaleString()}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {c.status === 'completed' ? 'OK' : c.status === 'failed' ? 'FAIL' : '…'}
                </span>
              </div>
            ))}
            {conversions.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-500">No conversions yet. Trigger one in the converter to see it here.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Users snapshot</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Top 6 users by remaining credits.</p>
          <div className="mt-3 space-y-2">
            {[...users].sort((a, b) => (b.credits || 0) - (a.credits || 0)).slice(0, 6).map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                  {u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-black text-slate-800">{u.name}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{u.email}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                  u.plan === 'enterprise' ? 'bg-violet-100 text-violet-700'
                    : u.plan === 'pro' ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
                }`}>{u.plan}</span>
                <span className="w-16 text-right text-xs font-black tabular-nums text-slate-700">
                  {(u.credits || 0).toLocaleString()}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-500">No users registered yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-[11px] text-slate-500">
        Realtime: pulling from localStorage every 5s. Last tick: {new Date(tick * 5000 + Date.now() - Date.now()).toISOString().slice(11, 19)} (UTC).
        Real backend wiring (KV jobs, R2 artifacts) lands in Phase 2 — see skills/omniconvert-conversion-matrix.
      </div>
    </div>
  );
};

const KpiTile: React.FC<{
  label: string; value: string; hint?: string;
  icon: React.ComponentType<{ className?: string }>; accent: string; bg: string; realtime?: boolean;
}> = ({ label, value, hint, icon: Icon, accent, bg, realtime }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-4 relative overflow-hidden`}>
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
  </div>
);

export default AdminDashboardSection;