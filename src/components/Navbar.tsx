import { useState } from 'react';
import { Sparkles, User as UserIcon, LogOut, ShieldAlert, Library, Route, BarChart3, CreditCard, ChevronDown, HelpCircle, Sun, Moon, Gift, Activity, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { TOOLS } from '../data/tools';
import { colorForFormat } from '../lib/format-colors';
import type { Category } from '../data/tools';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentPage: string;
  onChangePage: (page: string) => void;
  remainingDailyLimit: number;
  onOpenOnboarding: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectToolCategory: (category: string) => void;
}

export default function Navbar({
  currentUser,
  onOpenAuth,
  onLogout,
  currentPage,
  onChangePage,
  remainingDailyLimit,
  onOpenOnboarding,
  theme,
  onToggleTheme,
  categories,
  selectedCategory,
  onSelectToolCategory
}: NavbarProps) {
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const isAdmin = currentUser?.email === 'admin@omniconvert.com';
  const cadCategory = categories.find(category => category.id === 'CAD');
  const menuCategories = cadCategory
    ? [cadCategory, ...categories.filter(category => category.id !== 'CAD')]
    : categories;
  const totalToolCount = categories.reduce((total, category) => total + category.count, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav" id="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div
            onClick={() => onChangePage('home')}
            className="flex items-center gap-2 cursor-pointer group"
            id="navbar-logo"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl btn-primary text-white shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 transition-colors">
                OmniConvert
              </span>
              <span className="block text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold font-mono tracking-wider -mt-1 uppercase">
                SaaS Engine
              </span>
            </div>
          </div>

          {/* Navigation Links — Mega Menu */}
          <nav
            className="hidden md:flex items-center gap-1 glass p-1 rounded-xl relative"
            id="navbar-nav"
            onMouseLeave={() => setToolsMenuOpen(false)}
          >
            {/* Existing legacy Tools menu — kept untouched */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setToolsMenuOpen(open => !open)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  (currentPage === 'tools' || currentPage === 'category')
                    ? 'bg-zinc-800/10 dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300/30 dark:border-white/10 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                id="navbar-all-tools-menu-trigger"
              >
                Tools
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              <div className={`absolute left-0 top-full pt-2 transition-all duration-150 z-50 ${toolsMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'}`}>
                <div className="w-[760px] max-w-[calc(100vw-2rem)] glass rounded-2xl p-3 shadow-2xl border border-slate-200 dark:border-white/10" id="navbar-all-tools-category-menu">
                  {/* Compact header — no row, just label + count */}
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Converters
                    </p>
                    <p className="text-[10px] font-bold tabular-nums text-slate-500">
                      {totalToolCount} tools · 12 categories
                    </p>
                  </div>

                  {/* Categories grid — 4 columns × 3 rows = 12 tiles. No scroll. */}
                  <div className="grid grid-cols-4 gap-1.5" id="navbar-all-tools-category-grid">
                    {menuCategories.map(category => {
                      const isCad = category.id === 'CAD';
                      const isSelected = selectedCategory === category.id;
                      // Top converter preview for this category
                      const topTool = TOOLS.find(tool => tool.category === category.id);
                      const srcColor = topTool ? colorForFormat(topTool.input.split(/[,\s]+/)[0]) : null;
                      const dstColor = topTool ? colorForFormat(topTool.output.split(/[,\s]+/)[0]) : null;
                      const srcLabel = topTool ? topTool.input.split(/[,\s]+/)[0].toUpperCase() : '';
                      const dstLabel = topTool ? topTool.output.split(/[,\s]+/)[0].toUpperCase() : '';

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            onSelectToolCategory(category.id);
                            setToolsMenuOpen(false);
                          }}
                          className={`group/cat flex flex-col items-stretch gap-1 rounded-lg border px-2 py-2 text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50 border-blue-200 dark:bg-white/10 dark:border-white/10'
                              : isCad
                                ? 'bg-sky-50 border-sky-200 dark:bg-sky-400/10 dark:border-sky-400/20 hover:bg-sky-100'
                                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]'
                          }`}
                        >
                          <span className={`text-[11px] font-black tracking-tight truncate ${
                            isSelected
                              ? 'text-blue-800 dark:text-white'
                              : isCad
                                ? 'text-sky-800 dark:text-sky-200'
                                : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {isCad ? 'CAD' : category.name}
                          </span>

                          {topTool && srcColor && dstColor ? (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tabular-nums">
                              <span className={`rounded px-1 py-px ${srcColor.bg} ${srcColor.fg}`}>{srcLabel}</span>
                              <ArrowRight className="h-2.5 w-2.5 text-slate-400" strokeWidth={2.5} />
                              <span className={`rounded px-1 py-px ${dstColor.bg} ${dstColor.fg}`}>{dstLabel}</span>
                            </span>
                          ) : null}

                          <span className="text-[9px] font-bold tabular-nums text-slate-500 dark:text-slate-400">
                            {category.count} tools
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onChangePage('workflows')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPage === 'workflows'
                  ? 'bg-zinc-800/10 dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300/30 dark:border-white/10 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              Custom Workflows
            </button>

            <button
              onClick={() => onChangePage('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPage === 'dashboard'
                  ? 'bg-zinc-800/10 dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300/30 dark:border-white/10 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => isAdmin ? onChangePage('analytics') : null}
              disabled={!isAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPage === 'analytics' || currentPage.startsWith('analytics:')
                  ? 'bg-zinc-800/10 dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300/30 dark:border-white/10 shadow-sm'
                  : isAdmin
                    ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    : 'text-zinc-400/40 dark:text-zinc-600/40 cursor-not-allowed'
              }`}
              title={isAdmin ? 'Per-category conversion analytics' : 'Admin only'}
            >
              <Activity className="w-3.5 h-3.5" />
              Analytics
            </button>

            <button
              onClick={() => onChangePage('billing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPage === 'billing'
                  ? 'bg-zinc-800/10 dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-300/30 dark:border-white/10 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pricing & Shop
            </button>

            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 hover:bg-zinc-500/10 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Quick Tour
            </button>

            {isAdmin && (
              <button
                onClick={() => onChangePage('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 border border-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    : 'bg-transparent'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}

          </nav>

          {/* User Auth Info & Credit Badges */}
          <div className="flex items-center gap-3" id="navbar-actions">
            
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl glass hover:bg-zinc-500/10 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              id="theme-toggle-btn"
            >
              {theme === 'light' ? (
                <Moon className="w-4.5 h-4.5" />
              ) : (
                <Sun className="w-4.5 h-4.5" />
              )}
            </button>

            {/* Limit Banner */}
            <div className="hidden sm:flex flex-col items-end text-right">
              {currentUser ? (
                currentUser.plan === 'pro' || currentUser.plan === 'enterprise' ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full capitalize">
                      {currentUser.plan} Plan
                    </span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {currentUser.credits === 99999 ? 'Unlimited' : `${currentUser.credits} cr`}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono">Free Daily Balance</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {remainingDailyLimit} / 15 left
                    </span>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-mono">Guest Daily Balance</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-500">
                    {remainingDailyLimit} / 5 left
                  </span>
                </div>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-white/10">
                <div className="relative group cursor-pointer">
                  <div className="flex items-center gap-1.5 glass hover:bg-zinc-500/10 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl transition-colors">
                    <div className="w-5 h-5 rounded-full btn-primary flex items-center justify-center text-white text-[10px] font-bold uppercase">
                      {currentUser.name.substring(0, 2)}
                    </div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 max-w-[90px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 glass rounded-xl py-1 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
                    <div className="px-3 py-2 border-b border-zinc-200 dark:border-white/5 text-left">
                      <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-300 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-450 truncate mt-0.5">{currentUser.email}</p>
                    </div>
                    
                    <button
                      onClick={() => onChangePage('dashboard')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-500/10 dark:hover:bg-white/5 transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      Dashboard & Usage
                    </button>

                    <button
                      onClick={() => isAdmin ? onChangePage('analytics') : null}
                      disabled={!isAdmin}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                        isAdmin
                          ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-500/10 dark:hover:bg-white/5 cursor-pointer'
                          : 'text-zinc-400/40 dark:text-zinc-600/40 cursor-not-allowed'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      Per-Category Analytics{!isAdmin && ' (admin only)'}
                    </button>

                    <button
                      onClick={() => onChangePage('billing')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-500/10 dark:hover:bg-white/5 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      Subscription Settings
                    </button>

                    <button
                      onClick={() => {
                        localStorage.setItem('omni_dashboard_active_tab', 'referral');
                        onChangePage('dashboard');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/10 transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Refer & Earn +100 Cr
                    </button>
                    
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-t border-zinc-200 dark:border-white/5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 btn-primary active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer animate-pulse"
                id="navbar-signin-btn"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Nav Header */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-zinc-200 dark:border-white/5 bg-slate-100/60 dark:bg-slate-950/40 backdrop-blur-md px-2" id="mobile-navbar-links">
        <button
          onClick={() => onSelectToolCategory('All')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            (currentPage === 'tools' || currentPage === 'category') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Library className="w-4 h-4" />
          Tools
        </button>
        <button
          onClick={() => onChangePage('workflows')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentPage === 'workflows' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Route className="w-4 h-4" />
          Workflows
        </button>
        <button
          onClick={() => onChangePage('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentPage === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => isAdmin ? onChangePage('analytics') : null}
          disabled={!isAdmin}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentPage === 'analytics' || currentPage.startsWith('analytics:')
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : isAdmin
                ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                : 'text-zinc-400/40 dark:text-zinc-600/40 cursor-not-allowed'
          }`}
          title={isAdmin ? 'Analytics' : 'Admin only'}
        >
          <Activity className="w-4 h-4" />
          Analytics
        </button>
        <button
          onClick={() => onChangePage('billing')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentPage === 'billing' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Billing
        </button>
      </div>
    </header>
  );
}
