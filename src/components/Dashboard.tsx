import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { User, FileConversion, CloudIntegration } from '../types';
import { HardDrive, Cloud, Key, CheckCircle, RefreshCw, BarChart3, Database, History, HelpCircle, AlertCircle, Copy, Users, Award, Gift, Share2, ThumbsUp, Activity, Link as LinkIcon, Sparkles, Gem } from 'lucide-react';
import UpvoteButton from './gamification/UpvoteButton';
import ShareGrid from './gamification/ShareGrid';
import ActivityFeed from './gamification/ActivityFeed';
import { getUser, TIER_TABLE } from '../data/gamification';

interface DashboardProps {
  currentUser: User | null;
  conversions: FileConversion[];
  integrations: CloudIntegration[];
  onToggleIntegration: (provider: CloudIntegration['provider']) => void;
  onUpdateIntegration: (provider: CloudIntegration['provider'], updates: Partial<CloudIntegration>) => void;
  onOpenAuth?: () => void;
}

export default function Dashboard({
  currentUser,
  conversions,
  integrations,
  onToggleIntegration,
  onUpdateIntegration,
  onOpenAuth
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'cloud' | 'referral' | 'gamification'>('stats');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('omni_dashboard_active_tab');
    if (saved === 'referral') {
      localStorage.removeItem('omni_dashboard_active_tab');
      setActiveTab('referral');
    }
  }, [currentUser]);
  
  // Storage Connectors state forms
  const [editingProvider, setEditingProvider] = useState<CloudIntegration['provider'] | null>(null);
  const [formData, setFormData] = useState({ bucketOrFolder: '', apiKey: '', regionOrUsername: '' });

  if (!currentUser) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-6 text-center space-y-8 " id="dashboard-locked-screen">
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/5">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-md -z-10 animate-pulse" />
          <Key className="w-10 h-10" />
        </div>
        
        <div className="space-y-3 max-w-md mx-auto">
          <h2 className="text-2xl font-extrabold text-zinc-800 dark:text-white tracking-tight">Access Restricted</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The Personal Dashboard is reserved exclusively for registered members. Sign in or create a free account to track file conversions ledger, configure cloud storage connectors, and participate in our referral program.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/10 border border-indigo-500/10 text-xs text-indigo-300 max-w-sm mx-auto flex items-start gap-2.5 text-left leading-relaxed animate-pulse">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>Registered users get <strong>15 free daily conversions</strong> (upgraded from 5 guest conversions), persistent history logs, and workflow customization.</span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <button 
            onClick={onOpenAuth}
            className="w-full sm:flex-1 py-2.5 px-4 btn-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    const referralUrl = `${window.location.origin}?ref=${currentUser?.id || 'guest'}`;
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Group conversions by Category for Chart
  const categoryCountMap: Record<string, number> = {};
  conversions.forEach(c => {
    categoryCountMap[c.category] = (categoryCountMap[c.category] || 0) + 1;
  });

  const chartData = Object.keys(categoryCountMap).map(key => ({
    name: key,
    conversions: categoryCountMap[key]
  }));

  // Fallback default chart data if empty
  const defaultChartData = [
    { name: 'Documents', conversions: 4 },
    { name: 'Images', conversions: 7 },
    { name: 'Audio', conversions: 2 },
    { name: 'Spreadsheets', conversions: 3 },
  ];

  const actualChartData = chartData.length > 0 ? chartData : defaultChartData;

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  const startEditIntegration = (c: CloudIntegration) => {
    setEditingProvider(c.provider);
    setFormData({
      bucketOrFolder: c.bucketOrFolder,
      apiKey: c.apiKey,
      regionOrUsername: c.regionOrUsername || ''
    });
  };

  const saveIntegration = (provider: CloudIntegration['provider']) => {
    onUpdateIntegration(provider, {
      bucketOrFolder: formData.bucketOrFolder,
      apiKey: formData.apiKey,
      regionOrUsername: formData.regionOrUsername,
      enabled: true
    });
    setEditingProvider(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" id="dashboard-workspace">
      
      {/* Title section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-white" id="dashboard-heading">
          User Dashboard
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Monitor your daily conversion limits, connected cloud services, and processed files ledger.
        </p>
      </div>

      {/* Stats cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats-grid">
        <div className="p-5 rounded-2xl glass-card border border-zinc-200 dark:border-white/5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase font-mono">Usage Credits</p>
          <p className="text-2xl font-black text-zinc-850 dark:text-white mt-1.5 font-mono">
            {currentUser ? (currentUser.credits === 99999 ? 'Unlimited' : currentUser.credits) : '3 Daily'}
          </p>
          <span className="text-[10px] text-zinc-500 block mt-1">
            {currentUser ? `Signed in as ${currentUser.name}` : 'Anonymous Trial Session'}
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-zinc-200 dark:border-white/5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase font-mono">Processed Files</p>
          <p className="text-2xl font-black text-zinc-850 dark:text-white mt-1.5 font-mono">
            {conversions.length}
          </p>
          <span className="text-[10px] text-zinc-500 block mt-1">
            Across {chartData.length} unique file categories
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-zinc-200 dark:border-white/5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase font-mono">Platform Tier</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 capitalize">
            {currentUser?.plan || 'Anonymous'}
          </p>
          <span className="text-[10px] text-zinc-500 block mt-1">
            {currentUser?.plan === 'pro' || currentUser?.plan === 'enterprise' ? 'Pro support unlocked' : 'Upgrade to bypass limits'}
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-zinc-200 dark:border-white/5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase font-mono">Storage Integrations</p>
          <p className="text-2xl font-black text-zinc-850 dark:text-white mt-1.5 font-mono">
            {integrations.filter(i => i.enabled).length} / 4
          </p>
          <span className="text-[10px] text-zinc-500 block mt-1">
            Cloud files back up autonomously
          </span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-200 dark:border-white/5 pb-px" id="dashboard-tabs">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'stats' 
              ? 'border-indigo-500 text-indigo-600 dark:text-white' 
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Conversion Analytics
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-indigo-500 text-slate-900 dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4" />
            Conversions Ledger
          </div>
        </button>
        <button
          onClick={() => setActiveTab('cloud')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'cloud'
              ? 'border-indigo-500 text-slate-900 dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Cloud className="w-4 h-4" />
            Cloud Integrations
          </div>
        </button>
        <button
          onClick={() => setActiveTab('referral')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'referral'
              ? 'border-indigo-500 text-slate-900 dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Gift className="w-4 h-4" />
            Referrals & Rewards
          </div>
        </button>
        <button
          onClick={() => setActiveTab('gamification')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'gamification'
              ? 'border-indigo-500 text-slate-900 dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Earn · Upvote · Share
          </div>
        </button>
      </div>

      {/* Tabs panels */}
      <div id="dashboard-panel-container">
        
        {/* STATS VIEW */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 " id="dashboard-stats-panel">
            
            {/* Chart */}
            <div className="md:col-span-2 p-5 rounded-2xl glass-card border border-white/5 space-y-4 bg-white/2">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Conversions by Category</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Real-time tracker showing total documents, images and audio processed</p>
              </div>

              <div className="h-[240px] w-full text-xs font-mono" id="dashboard-recharts-bar">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actualChartData}>
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="conversions" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={36}>
                      {actualChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick tips & Limits progress info */}
            <div className="p-5 rounded-2xl glass-card border border-white/5 flex flex-col justify-between bg-white/2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Server Status</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Cloudflare Workers:</span>
                    <span className="text-emerald-400 font-bold font-mono">ACTIVE (Online)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Node API Gateway:</span>
                    <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Secure Storage cache:</span>
                    <span className="text-emerald-400 font-bold font-mono">SECURE</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                    <span className="text-zinc-400">Active Queue Delay:</span>
                    <span className="text-zinc-300 font-bold font-mono">2ms latency</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/10 text-xs text-indigo-300 flex gap-2 mt-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Anonymous conversions are kept for 24 hours in Cloud Cache. Upgrade to Pro/Enterprise to lock records indefinitely.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* LEDGER VIEW */}
        {activeTab === 'history' && (
          <div className="rounded-2xl glass-card border border-white/5 overflow-hidden bg-white/2" id="dashboard-history-panel">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-sm font-bold text-zinc-100">Processed Conversions Ledger</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Comprehensive chronological log of every file format compilation session</p>
            </div>

            {conversions.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <History className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-semibold">No conversion records recorded yet</p>
                <p className="text-xs text-zinc-600 mt-1">Convert files in the dashboard workspace to see detailed ledger data here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Resulting File</th>
                      <th className="p-4">Conversion Engine</th>
                      <th className="p-4">Credit Cost</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {conversions.map((conv, idx) => (
                      <tr key={idx} className="hover:bg-white/2 transition-colors">
                        <td className="p-4 text-zinc-400 font-mono">
                          {new Date(conv.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-zinc-100 block truncate max-w-[200px]">{conv.fileName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{(conv.fileSize / 1024).toFixed(1)} KB</span>
                        </td>
                        <td className="p-4 text-indigo-400 font-medium">
                          {conv.toolName}
                        </td>
                        <td className="p-4 font-mono font-bold text-zinc-300">
                          {conv.creditCost} Credits
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CLOUD CONNECTORS VIEW */}
        {activeTab === 'cloud' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 " id="dashboard-cloud-panel">
            
            {integrations.map((c) => (
              <div 
                key={c.provider}
                className="p-5 rounded-2xl glass-card border border-white/5 flex flex-col justify-between space-y-4 bg-white/2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-zinc-400 capitalize">
                      <Cloud className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-zinc-100 tracking-wider">{c.provider} Integration</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Stream outputs straight to your bucket</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleIntegration(c.provider)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      c.enabled 
                        ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'glass border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {c.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Integration Details / Editing */}
                {editingProvider === c.provider ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono mb-1">Bucket or Folder Name</label>
                      <input 
                        type="text" 
                        value={formData.bucketOrFolder}
                        onChange={(e) => setFormData(prev => ({ ...prev, bucketOrFolder: e.target.value }))}
                        className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                        placeholder="my-conversions-bucket"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono mb-1">Secure API / Key Token</label>
                      <input 
                        type="password" 
                        value={formData.apiKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                        placeholder="••••••••••••"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => saveIntegration(c.provider)}
                        className="flex-1 py-1.5 px-3 btn-primary text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Save Credentials
                      </button>
                      <button
                        onClick={() => setEditingProvider(null)}
                        className="py-1.5 px-3 glass text-zinc-300 hover:text-zinc-100 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Destination:</span>
                      <span className="font-mono text-zinc-300 font-bold">{c.bucketOrFolder || '(Not Configured)'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">API Handshake:</span>
                      <span className="font-mono text-zinc-300 font-bold">{c.apiKey ? '••••••••' : '(Missing)'}</span>
                    </div>
                    <button
                      onClick={() => startEditIntegration(c)}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 mt-2 block"
                    >
                      Configure Connection Settings →
                    </button>
                  </div>
                )}
              </div>
            ))}

          </div>
        )}

        {/* REFERRAL VIEW */}
        {activeTab === 'referral' && (
          <div className="space-y-6 " id="dashboard-referrals-panel">
            {/* Referral Hero Block */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 border border-indigo-500/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
                <div className="space-y-2 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-bold uppercase tracking-wider font-mono">
                    <Award className="w-3.5 h-3.5" /> Refer & Earn Program
                  </div>
                  <h3 className="text-xl font-bold text-white">Invite Friends. Earn Credits Together.</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Share your unique link. When your friends sign up, they get <span className="text-emerald-400 font-bold">+15 bonus credits</span>. When they upgrade to any premium subscription, you both get <span className="text-indigo-400 font-bold">+100 bonus credits</span> added instantly!
                  </p>
                </div>

                {/* Referral Link Copy Area */}
                <div className="w-full md:w-auto shrink-0 space-y-2">
                  <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Your Shareable Referral Link</span>
                  <div className="flex items-center gap-2 p-1.5 glass rounded-xl border border-white/5 bg-black/40 max-w-sm">
                    <span className="text-[11px] font-mono text-indigo-300 truncate pl-2 max-w-[200px]">
                      {window.location.origin}/?ref={currentUser?.id || 'trial'}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                        copiedLink 
                          ? 'bg-emerald-600 text-white' 
                          : 'btn-primary text-white hover:scale-105'
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>

                  {/* Share on Social Media */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 font-bold">Post/Share Link:</span>
                    {(() => {
                      const shareUrl = `${window.location.origin}/?ref=${currentUser?.id || 'trial'}`;
                      const shareText = `Convert files instantly on OmniConvert! Sign up through my link to get +15 bonus credits, and we both get +100 premium credits on subscription! 🚀`;
                      
                      return (
                        <div className="flex items-center gap-1 flex-wrap">
                          <a 
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white transition-colors border border-white/5 font-mono font-bold"
                            title="Post on X (Twitter)"
                          >
                            X
                          </a>
                          <a 
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-indigo-600/20 text-[10px] text-zinc-400 hover:text-indigo-400 transition-colors border border-white/5 font-mono font-bold"
                            title="Post to LinkedIn"
                          >
                            LinkedIn
                          </a>
                          <a 
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-600/20 text-[10px] text-zinc-400 hover:text-emerald-400 transition-colors border border-white/5 font-mono font-bold"
                            title="Share on WhatsApp"
                          >
                            WhatsApp
                          </a>
                          <a 
                            href={`https://www.reddit.com/submit?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-orange-600/20 text-[10px] text-zinc-400 hover:text-orange-400 transition-colors border border-white/5 font-mono font-bold"
                            title="Post on Reddit"
                          >
                            Reddit
                          </a>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Referral Counters */}
            {(() => {
              const savedUsersStr = localStorage.getItem('omni_users') || '[]';
              const allUsers: User[] = JSON.parse(savedUsersStr);
              const referredUsers = allUsers.filter(u => u.referredBy === currentUser?.id);
              const totalReferred = referredUsers.length;
              const upgradedReferred = referredUsers.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length;
              const referralCreditsEarned = upgradedReferred * 100;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="referral-stats-grid">
                    <div className="p-5 rounded-2xl glass-card border border-white/5 bg-white/2">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs text-zinc-400 font-semibold uppercase font-mono">Invited Friends</span>
                      </div>
                      <p className="text-2xl font-black text-white mt-2 font-mono">{totalReferred}</p>
                      <span className="text-[10px] text-zinc-500 block mt-1">Friends registered using your link</span>
                    </div>

                    <div className="p-5 rounded-2xl glass-card border border-white/5 bg-white/2">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Award className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase font-mono">Subscribed Friends</span>
                      </div>
                      <p className="text-2xl font-black text-white mt-2 font-mono">{upgradedReferred}</p>
                      <span className="text-[10px] text-zinc-500 block mt-1">Upgraded to Pro / Enterprise tier</span>
                    </div>

                    <div className="p-5 rounded-2xl glass-card border border-white/5 bg-white/2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Gift className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase font-mono">Referral Bonus Earned</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">+{referralCreditsEarned} Cr</p>
                      <span className="text-[10px] text-zinc-500 block mt-1">Added directly to your active credit balance</span>
                    </div>
                  </div>

                  {/* Referrals Table / Ledger list */}
                  <div className="rounded-2xl glass border border-white/5 overflow-hidden">
                    <div className="bg-black/30 border-b border-white/5 px-4 py-3 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
                      <span>Invited Referrals Ledger</span>
                      <span>{totalReferred} friends found</span>
                    </div>

                    {totalReferred === 0 ? (
                      <div className="p-12 text-center space-y-3">
                        <Users className="w-10 h-10 text-zinc-600 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-zinc-300">No friends invited yet</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">Share your custom referral link to start earning premium bonus credits.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {referredUsers.map((friend) => (
                          <div key={friend.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/1 transition-colors">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-zinc-200">{friend.name}</span>
                                <span className="font-mono text-[10px] text-zinc-500">
                                  ({friend.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")})
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Joined: {new Date(friend.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {/* Plan Badge */}
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono border ${
                                friend.plan === 'pro' 
                                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                                  : friend.plan === 'enterprise'
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                    : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                              }`}>
                                {friend.plan.toUpperCase()}
                              </span>

                              {/* Bonus Status */}
                              {friend.plan !== 'free' ? (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                                  <CheckCircle className="w-3 h-3" /> +100 Cr Awarded
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-500/5 border border-white/5 px-2 py-0.5 rounded-full font-mono">
                                  Pending upgrade
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* GAMIFICATION — credits, upvote, share, activity */}
        {activeTab === 'gamification' && (
          <DashboardGamificationPanel currentUser={currentUser} />
        )}

      </div>

    </div>
  );
}

// ───────────────────────────────────────────── Gamification panel

const SUGGESTED_PAIRS = [
  { category: 'CAD',         source: 'STL', target: 'OBJ' },
  { category: 'Documents',   source: 'PDF', target: 'DOCX' },
  { category: 'Images',      source: 'PNG', target: 'JPG' },
  { category: 'Audio',       source: 'MP3', target: 'WAV' },
  { category: 'Video',       source: 'MP4', target: 'GIF' },
  { category: 'Archives',    source: 'ZIP', target: 'TAR' },
];

const DashboardGamificationPanel: React.FC<{ currentUser?: User | null }> = ({ currentUser }) => {
  const gamUser = getUser(currentUser);
  const cfg = TIER_TABLE[gamUser.tier];

  return (
    <div className="space-y-5 " id="dashboard-gamification-panel">
      {/* Top: credit balance + daily claim */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-3 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 px-5 py-5 text-white">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Your credit balance</p>
              <p className="mt-1 text-4xl font-black tabular-nums">{gamUser.credits.toLocaleString()}</p>
              <p className="mt-1 text-[11px] font-bold text-white/80">Earned {gamUser.totalEarned.toLocaleString()} · Spent {gamUser.totalSpent.toLocaleString()} · Streak {gamUser.dailyLoginStreak}d</p>
            </div>
            <Gem className="h-8 w-8 text-white/40" />
          </div>
          <div className="flex flex-wrap items-center gap-3 px-5 py-4">
            <UpvoteButton
              category={SUGGESTED_PAIRS[0].category}
              source={SUGGESTED_PAIRS[0].source}
              target={SUGGESTED_PAIRS[0].target}
              currentUser={gamUser}
              showLabel
            />
            <span className="text-[11px] font-semibold text-slate-500">Help us prioritize the next CAD engine.</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-blue-600" /> Referral
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Earn {cfg.rewards.referralSignup} cr per signup · {cfg.rewards.referralConvert} per conversion.</p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Your code</p>
          <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-black text-slate-900">{gamUser.referralCode}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${gamUser.referralCode}`)}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700"
          >
            <Copy className="h-3 w-3" /> Copy invite link
          </button>
        </div>
      </div>

      {/* Upvote: grid of pairs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-blue-600" /> Upvote conversions
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">Earn +{cfg.rewards.upvote} cr per upvote · 10 / day limit.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SUGGESTED_PAIRS.map(p => (
            <UpvotePairCard key={`${p.category}-${p.source}-${p.target}`} category={p.category} source={p.source} target={p.target} user={gamUser} />
          ))}
        </div>
      </div>

      {/* Share + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-600" /> Share & earn
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">One share per platform per day. Each platform has its own reward tier.</p>
          <div className="mt-3">
            <ShareGrid user={gamUser} cfg={cfg} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" /> Activity
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Live credits, upvotes, shares.</p>
          <div className="mt-3 max-h-80 overflow-y-auto pr-1">
            <ActivityFeed userId={gamUser.id} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

const UpvotePairCard: React.FC<{ category: string; source: string; target: string; user: ReturnType<typeof getUser> }> = ({ category, source, target, user }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md">
    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{category}</p>
    <p className="mt-1 text-sm font-black text-slate-900">{source} → {target}</p>
    <div className="mt-2">
      <UpvoteButton category={category} source={source} target={target} currentUser={user} size="sm" />
    </div>
  </div>
);
