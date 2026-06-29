import React, { useState } from 'react';
import {
  LayoutDashboard, BarChart3, Users, Activity, Settings, ShieldAlert, Gem,
} from 'lucide-react';
import AdminDashboardSection from './AdminDashboardSection';
import AdminAnalyticsSection from './AdminAnalyticsSection';
import AdminUsersSection from './AdminUsersSection';
import AdminConversionsSection from './AdminConversionsSection';
import AdminSettingsSection from './AdminSettingsSection';
import AdminGamificationSection from './AdminGamificationSection';

export type AdminSection = 'dashboard' | 'analytics' | 'users' | 'conversions' | 'gamification' | 'settings';

const NAV: Array<{ id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }> = [
  { id: 'dashboard',      label: 'Dashboard',     icon: LayoutDashboard, hint: 'High-level admin overview' },
  { id: 'analytics',      label: 'Analytics',     icon: BarChart3,       hint: 'Per-category conversion analytics' },
  { id: 'users',          label: 'Users',         icon: Users,           hint: 'Registered users, plans, credits' },
  { id: 'conversions',    label: 'Conversions',   icon: Activity,        hint: 'Realtime conversion logs' },
  { id: 'gamification',   label: 'Gamification',  icon: Gem,             hint: 'Credits, upvotes, referrals, shares' },
  { id: 'settings',       label: 'Settings',      icon: Settings,        hint: 'Hero preset + system config' },
];

interface AdminPanelProps {
  initialSection?: AdminSection;
  embedded?: boolean;
  onSectionChange?: (section: AdminSection) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialSection = 'dashboard', embedded, onSectionChange }) => {
  const [section, setSection] = useState<AdminSection>(initialSection);

  const handleSelect = (s: AdminSection) => {
    setSection(s);
    if (onSectionChange) onSectionChange(s);
  };

  const currentHint = NAV.find(n => n.id === section)?.hint ?? '';

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
        <div className="px-4 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Admin</h2>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">OmniConvert control room</p>
        </div>
        <nav className="flex-1 py-2">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold transition group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-[inset_3px_0_0_0_theme(colors.blue.600)]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                title={item.hint}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
          Restricted to admin@omniconvert.com.
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <header className="mb-3">
            <p className="text-[11px] font-semibold text-slate-500">{currentHint}</p>
          </header>
          {section === 'dashboard'      && <AdminDashboardSection />}
          {section === 'analytics'      && <AdminAnalyticsSection />}
          {section === 'users'          && <AdminUsersSection />}
          {section === 'conversions'    && <AdminConversionsSection />}
          {section === 'gamification'   && <AdminGamificationSection />}
          {section === 'settings'       && <AdminSettingsSection />}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;