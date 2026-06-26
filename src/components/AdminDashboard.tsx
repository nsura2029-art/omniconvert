import { useState, useEffect } from 'react';
import { User, PlanType, FileConversion } from '../types';
import { ShieldAlert, Users, TrendingUp, Cpu, Flame, CheckCircle, Ban, Award, Trash2, ArrowUpRight, DollarSign, Activity, AlertTriangle, Clock, BarChart3, ChevronRight, Zap, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  currentUser: User | null;
  conversions: FileConversion[];
  onUpdateUsersList: (users: User[]) => void;
  systemStats: {
    totalRevenue: number;
    conversionsCount: number;
  };
  activeHeroPreset: 'cyber' | 'bento';
  onChangeHeroPreset: (preset: 'cyber' | 'bento') => void;
}

export default function AdminDashboard({ 
  currentUser, 
  conversions, 
  onUpdateUsersList, 
  systemStats,
  activeHeroPreset,
  onChangeHeroPreset
}: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [systemPeakSimulated, setSystemPeakSimulated] = useState(false);
  const [chartTabLeft, setChartTabLeft] = useState<'tools' | 'peak'>('tools');
  const [chartTabRight, setChartTabRight] = useState<'conversion' | 'retention'>('conversion');
  const [referralLogs, setReferralLogs] = useState<any[]>([]);
  
  const [adminLogs, setAdminLogs] = useState<string[]>([
    'System core online. Port 3000 mapped successfully.',
    'Cloudflare workers queue dispatcher status: Healthy.',
    'Secure S3 cache partition size checked: 14.8 GB.'
  ]);

  // Load registered users & referrals on boot
  useEffect(() => {
    const savedUsersStr = localStorage.getItem('omni_users') || '[]';
    let loadedUsers: User[] = JSON.parse(savedUsersStr);

    // Seed default users if empty
    if (loadedUsers.length === 0) {
      loadedUsers = [
        { id: 'user_omni', name: 'Premium Member', email: 'user@omniconvert.com', plan: 'pro', credits: 450, maxDailyConversions: 100, dailyConversionsCount: 4, createdAt: '2026-05-12T00:00:00.000Z' },
        { id: 'user_2', name: 'Creative Designer', email: 'designer@gmail.com', plan: 'free', credits: 10, maxDailyConversions: 10, dailyConversionsCount: 2, createdAt: '2026-06-01T00:00:00.000Z', referredBy: 'user_omni', referredRewarded: true },
        { id: 'user_3', name: 'Archivist Master', email: 'archives@yahoo.com', plan: 'enterprise', credits: 99999, maxDailyConversions: 99999, dailyConversionsCount: 29, createdAt: '2026-06-18T00:00:00.000Z' }
      ];
      localStorage.setItem('omni_users', JSON.stringify(loadedUsers));
    }
    setUsers(loadedUsers);

    // Load referral logs
    let loadedRefLogs = JSON.parse(localStorage.getItem('omni_referral_logs') || '[]');
    if (loadedRefLogs.length === 0) {
      loadedRefLogs = [
        {
          id: 'reflog_1',
          referrerName: 'Premium Member',
          referrerEmail: 'user@omniconvert.com',
          referredName: 'Creative Designer',
          referredEmail: 'designer@gmail.com',
          timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          rewardCredits: 100
        }
      ];
      localStorage.setItem('omni_referral_logs', JSON.stringify(loadedRefLogs));
    }
    setReferralLogs(loadedRefLogs);
  }, []);

  const addAdminLog = (msg: string) => {
    setAdminLogs(prev => [`[ADMIN] ${msg}`, ...prev]);
  };

  const handleGrantCredits = (userId: string, amount: number) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        addAdminLog(`Granted +${amount} credits to user: ${u.email}`);
        return { ...u, credits: u.credits + amount };
      }
      return u;
    });
    setUsers(updated);
    onUpdateUsersList(updated);
    localStorage.setItem('omni_users', JSON.stringify(updated));
    confetti({ particleCount: 40, spread: 40 });
  };

  const handleToggleBan = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextBanState = !u.isBanned;
        addAdminLog(`${nextBanState ? 'Banned' : 'Unbanned'} user: ${u.email}`);
        return { ...u, isBanned: nextBanState };
      }
      return u;
    });
    setUsers(updated);
    onUpdateUsersList(updated);
    localStorage.setItem('omni_users', JSON.stringify(updated));
  };

  const handleUpgradeUserPlan = (userId: string, nextPlan: PlanType) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        addAdminLog(`Upgraded user ${u.email} plan to ${nextPlan.toUpperCase()}`);
        return { 
          ...u, 
          plan: nextPlan, 
          credits: nextPlan === 'pro' ? 500 : nextPlan === 'enterprise' ? 99999 : 10,
          maxDailyConversions: nextPlan === 'pro' ? 100 : nextPlan === 'enterprise' ? 99999 : 10
        };
      }
      return u;
    });
    setUsers(updated);
    onUpdateUsersList(updated);
    localStorage.setItem('omni_users', JSON.stringify(updated));
  };

  const handleResetDailyCounter = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        addAdminLog(`Reset daily conversion counter for user: ${u.email}`);
        return { ...u, dailyConversionsCount: 0 };
      }
      return u;
    });
    setUsers(updated);
    onUpdateUsersList(updated);
    localStorage.setItem('omni_users', JSON.stringify(updated));
  };

  const togglePeakSim = () => {
    const nextState = !systemPeakSimulated;
    setSystemPeakSimulated(nextState);
    addAdminLog(`System traffic load simulation toggled: ${nextState ? 'SPIKED (Simulating concurrent queue loads)' : 'NORMAL'}`);
  };

  // Analytics Calculations
  const upgradedCount = users.filter(u => u.plan !== 'free').length;
  const conversionRate = users.length > 0 ? Math.round((upgradedCount / users.length) * 100) : 33;
  
  // Calculate most popular tools from real + mock conversions
  const toolCountMap: Record<string, number> = {
    'PDF to DOCX': 34,
    'MP4 to MP3 Audio': 21,
    'PNG to WEBP Compress': 45,
    'PDF Password Unlock': 12,
    'SVG Vector Scaler': 28,
    'WAV Audio Booster': 19,
  };
  
  conversions.forEach(c => {
    if (c.toolName) {
      toolCountMap[c.toolName] = (toolCountMap[c.toolName] || 0) + 1;
    }
  });

  const popularToolsData = Object.keys(toolCountMap).map(name => ({
    name,
    conversions: toolCountMap[name]
  })).sort((a, b) => b.conversions - a.conversions).slice(0, 5);

  // Peak load times distribution (hourly concurrent queue loads)
  const peakTimesData = [
    { hour: '00:00', load: 12, queue: 1 },
    { hour: '03:00', load: 6, queue: 0 },
    { hour: '06:00', load: 15, queue: 1 },
    { hour: '09:00', load: 64, queue: 4 },
    { hour: '12:00', load: systemPeakSimulated ? 190 : 88, queue: systemPeakSimulated ? 18 : 6 },
    { hour: '15:00', load: systemPeakSimulated ? 245 : 94, queue: systemPeakSimulated ? 25 : 7 },
    { hour: '18:00', load: systemPeakSimulated ? 210 : 72, queue: systemPeakSimulated ? 19 : 5 },
    { hour: '21:00', load: systemPeakSimulated ? 135 : 42, queue: systemPeakSimulated ? 11 : 2 },
  ];

  // Subscription Upgrade Trends
  const subConversionData = [
    { month: 'Mar', standardUsers: 140, upgrades: 15, rate: 10 },
    { month: 'Apr', standardUsers: 195, upgrades: 28, rate: 14 },
    { month: 'May', standardUsers: 280, upgrades: 48, rate: 17 },
    { month: 'Jun', standardUsers: 390, upgrades: upgradedCount + 68, rate: conversionRate },
  ];

  // User retention rates trend (by weeks)
  const retentionData = [
    { week: 'Wk 1', rate: 96, label: '96% active' },
    { week: 'Wk 2', rate: 84, label: '84% active' },
    { week: 'Wk 3', rate: 76, label: '76% active' },
    { week: 'Wk 4', rate: 69, label: '69% active' },
  ];

  // Average credits consumed per user calculation
  const totalConversionsInList = conversions.length + 242;
  const averageCreditsUsed = Math.round(users.reduce((acc, u) => acc + (u.dailyConversionsCount * 6 + 10), 0) / (users.length || 1)) + 35;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" id="admin-workspace">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2" id="admin-heading">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            Admin Control Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Global state tracking. Inspect server queue latency, user conversion parameters and grant subscription overrides.
          </p>
        </div>

        <button
          onClick={togglePeakSim}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg border ${
            systemPeakSimulated 
              ? 'bg-amber-600/80 hover:bg-amber-500 text-white shadow-amber-600/15 border-amber-500/25 backdrop-blur-md' 
              : 'glass border-white/5 text-zinc-100 hover:bg-white/5'
          }`}
          id="toggle-load-btn"
        >
          <Flame className="w-4 h-4 shrink-0" />
          {systemPeakSimulated ? 'Stop Peak Load Simulation' : 'Simulate System Peak Traffic'}
        </button>
      </div>

      {/* Hero Layout Configuration for Admin */}
      <div className="p-4 rounded-2xl glass-card border border-indigo-500/15 bg-indigo-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="admin-hero-layout-config">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Home Hero Section Layout Setting
          </h2>
          <p className="text-[11px] text-zinc-400">
            Toggle the public interactive format compiler layout displayed to visitors on the landing page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onChangeHeroPreset('cyber');
              addAdminLog('Admin updated active public hero layout design to: Cyber Particle Stream');
            }}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border ${
              activeHeroPreset === 'cyber'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-500/40 shadow-lg shadow-indigo-600/10'
                : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cyber Particle Stream
          </button>
          <button
            onClick={() => {
              onChangeHeroPreset('bento');
              addAdminLog('Admin updated active public hero layout design to: Bento Grid Matcher');
            }}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border ${
              activeHeroPreset === 'bento'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-500/40 shadow-lg shadow-indigo-600/10'
                : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Bento Grid Matcher (Default)
          </button>
        </div>
      </div>

      {/* Admin stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-grid">
        <div className="p-5 rounded-2xl glass-card border border-white/5 bg-white/2">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-zinc-500" />
            <p className="text-xs text-zinc-400 font-semibold uppercase font-mono">Platform Users</p>
          </div>
          <p className="text-2xl font-black text-white mt-1.5 font-mono">{users.length + 12}</p>
          <span className="text-[10px] text-zinc-500 block mt-1">Active registered user records</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 bg-white/2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            <p className="text-xs text-indigo-400 font-semibold uppercase font-mono">System Conversions</p>
          </div>
          <p className="text-2xl font-black text-white mt-1.5 font-mono">{systemStats.conversionsCount + 392}</p>
          <span className="text-[10px] text-zinc-500 block mt-1">Processed cloud files successfully</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 bg-white/2">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-emerald-400 font-semibold uppercase font-mono">Platform Revenue</p>
          </div>
          <p className="text-2xl font-black text-white mt-1.5 font-mono">${systemStats.totalRevenue + 249}.00</p>
          <span className="text-[10px] text-zinc-500 block mt-1">SaaS recurring credit sales</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 bg-white/2">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-purple-400 font-semibold uppercase font-mono">Queue Latency</p>
          </div>
          <p className="text-2xl font-black text-indigo-300 mt-1.5 font-mono">
            {systemPeakSimulated ? '3,842 ms' : '1.8 ms'}
          </p>
          <span className="text-[10px] text-zinc-500 block mt-1">
            {systemPeakSimulated ? '🚨 High pressure concurrent delays' : '⚡ Lightning fast CF Workers'}
          </span>
        </div>
      </div>

      {/* ADVANCED USAGE & CONVERSION ANALYTICS SECTION */}
      <div className="space-y-4 p-5 rounded-2xl border border-white/5 bg-white/2" id="advanced-analytics-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Platform Growth & Usage Analytics
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">Global tracking of conversion metrics, retention loops, and user credits activity.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-500 font-mono">LIVE DATAFEED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* LEFT CHART: Tool Popularity vs. Peak load distribution */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-300">
                  {chartTabLeft === 'tools' ? 'Popular Conversions Distribution' : 'Hourly Processing Workload'}
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {chartTabLeft === 'tools' ? 'Top tools used across guest & premium cycles' : 'Server concurrent file conversion requests'}
                </p>
              </div>
              <div className="flex p-0.5 rounded-lg bg-black/40 border border-white/5">
                <button
                  onClick={() => setChartTabLeft('tools')}
                  className={`px-2 py-1 text-[10px] font-bold rounded font-mono transition-all cursor-pointer ${
                    chartTabLeft === 'tools' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Popular Tools
                </button>
                <button
                  onClick={() => setChartTabLeft('peak')}
                  className={`px-2 py-1 text-[10px] font-bold rounded font-mono transition-all cursor-pointer ${
                    chartTabLeft === 'peak' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Peak Load
                </button>
              </div>
            </div>

            <div className="h-[200px] w-full" id="admin-left-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                {chartTabLeft === 'tools' ? (
                  <BarChart data={popularToolsData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                    <XAxis type="number" stroke="#71717a" fontSize={9} fontStyle="italic" />
                    <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={9} width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#818cf8', fontSize: '10px' }}
                    />
                    <Bar dataKey="conversions" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                ) : (
                  <AreaChart data={peakTimesData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" stroke="#71717a" fontSize={9} />
                    <YAxis stroke="#71717a" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#c084fc', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="load" stroke="#c084fc" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={2} name="Requests/Hr" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT CHART: Conversion rates vs. Retention rates */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-300">
                  {chartTabRight === 'conversion' ? 'Subscription Upgrades' : 'Weekly User Retention Rate'}
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {chartTabRight === 'conversion' ? 'Historical SaaS upgrade volume (Pro & Enterprise)' : 'Customer retention curves over standard cohort cycles'}
                </p>
              </div>
              <div className="flex p-0.5 rounded-lg bg-black/40 border border-white/5">
                <button
                  onClick={() => setChartTabRight('conversion')}
                  className={`px-2 py-1 text-[10px] font-bold rounded font-mono transition-all cursor-pointer ${
                    chartTabRight === 'conversion' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Conversions
                </button>
                <button
                  onClick={() => setChartTabRight('retention')}
                  className={`px-2 py-1 text-[10px] font-bold rounded font-mono transition-all cursor-pointer ${
                    chartTabRight === 'retention' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Retention
                </button>
              </div>
            </div>

            <div className="h-[200px] w-full" id="admin-right-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                {chartTabRight === 'conversion' ? (
                  <AreaChart data={subConversionData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorUpgrades" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#71717a" fontSize={9} />
                    <YAxis stroke="#71717a" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="upgrades" stroke="#34d399" fillOpacity={1} fill="url(#colorUpgrades)" strokeWidth={2} name="Total Subscriptions" />
                  </AreaChart>
                ) : (
                  <LineChart data={retentionData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <XAxis dataKey="week" stroke="#71717a" fontSize={9} />
                    <YAxis stroke="#71717a" fontSize={9} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="rate" stroke="#818cf8" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Retention %" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Dynamic Referral Rewards Logs & Advanced Metrics summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/5">
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold block">Avg User Credit Burn</span>
            <p className="text-lg font-black text-white mt-1.5 font-mono">{averageCreditsUsed} credits <span className="text-zinc-400 font-normal text-xs">/ user</span></p>
            <span className="text-[9px] text-zinc-500 block mt-1">Reflects processing costs of multi-step pipeline actions</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold block">SaaS Conversion efficiency</span>
            <p className="text-lg font-black text-emerald-400 mt-1.5 font-mono">{conversionRate}% rate</p>
            <span className="text-[9px] text-zinc-500 block mt-1">Percentage of users converting to Pro / Enterprise tier</span>
          </div>

          {/* REFERRAL LOGS LIST FOR ADMIN */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-mono font-bold block flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" /> Recent Referral Loops
            </span>
            <div className="mt-2 space-y-1.5 max-h-[50px] overflow-y-auto pr-1">
              {referralLogs.length === 0 ? (
                <p className="text-[9px] text-zinc-500 italic">No referral loops recorded yet.</p>
              ) : (
                referralLogs.slice(0, 2).map((log, idx) => (
                  <div key={log.id || idx} className="text-[9px] text-zinc-400 leading-tight">
                    <strong className="text-zinc-200">{log.referrerName}</strong> referred <strong className="text-zinc-200">{log.referredName}</strong> <span className="text-emerald-400 font-bold">(+100 Cr awarded)</span>
                  </div>
                ))
              )}
            </div>
            <span className="text-[9px] text-zinc-500 block mt-1">Dynamic program tracking reward operations</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Users administration list */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl glass-card border border-white/5 overflow-hidden bg-white/2" id="admin-users-list">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <span className="text-xs font-bold text-zinc-100 font-mono">SaaS Registered Users Management</span>
              <span className="text-[10px] font-mono text-zinc-500">{users.length} Users Found</span>
            </div>

            <div className="divide-y divide-white/5">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/2 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-zinc-200">{u.name}</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase font-semibold">
                        {u.plan}
                      </span>
                      {u.isBanned && (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full uppercase font-semibold">
                          Banned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{u.email}</p>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-400 mt-2 font-mono">
                      <span>Credits: <strong>{u.credits === 99999 ? 'Unlimited' : u.credits}</strong></span>
                      <span>Daily: <strong>{u.dailyConversionsCount} / {u.maxDailyConversions}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <button
                      onClick={() => handleGrantCredits(u.id, 50)}
                      className="px-2.5 py-1.5 glass border-white/5 text-zinc-300 hover:text-white text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      +50 Credits
                    </button>
                    
                    <button
                      onClick={() => handleResetDailyCounter(u.id)}
                      className="px-2.5 py-1.5 glass border-white/5 text-zinc-300 hover:text-white text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Reset Daily
                    </button>

                    <button
                      onClick={() => handleUpgradeUserPlan(u.id, u.plan === 'pro' ? 'enterprise' : 'pro')}
                      className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      {u.plan === 'pro' ? 'Enterprise Boost' : 'Pro Upgrade'}
                    </button>

                    <button
                      onClick={() => handleToggleBan(u.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        u.isBanned 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Administration Log feeds */}
        <div className="space-y-4">
          <div className="rounded-2xl glass border border-white/5 overflow-hidden flex flex-col h-[320px]">
            <div className="bg-black/30 border-b border-white/5 px-4 py-3 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Global Admin Event Logs
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 font-mono text-[10px] text-zinc-500 space-y-2 leading-relaxed" id="admin-terminal-feed">
              {adminLogs.map((log, idx) => (
                <p key={idx} className={log.includes('[ADMIN]') ? 'text-indigo-400' : 'text-zinc-500'}>
                  {log}
                </p>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/20 text-xs text-rose-300 flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Sandbox Security Override:</span>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                As Chief Administrator, your database reads bypass client limits. Banned users lose authentication handshakes instantly.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
