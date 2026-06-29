import React, { useMemo, useState } from 'react';
import { Link } from './stubRouter';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { KpiGrid, formatBytes, formatMs } from '../components/dashboard/KpiCard';
import FromToMatrix from '../components/dashboard/FromToMatrix';
import {
  PopularPairsTable, TrendingChart, ProcessingBreakdownPanel,
  TimeStatsPanel, UsageTimeline, AdvancedStatsPanel,
} from '../components/dashboard/DashboardPanels';
import {
  CATEGORY_LIST, CategoryId, Period,
  buildCategorySummary, buildPopularPairs, buildMatrix,
  buildProcessingBreakdown, buildUsageTimeline, buildAdvancedStats,
} from '../data/dashboardAnalytics';
import { getLocalConversions } from '../data/localConversions';
import { ChevronRight, ArrowLeft } from 'lucide-react';

const isCategoryId = (s: string | undefined): s is CategoryId =>
  !!s && CATEGORY_LIST.some(c => c.id === s);

interface DashboardProps {
  embedded?: boolean;
  categoryParam?: string;
  onNavigate?: (page: 'overview' | 'category', cat?: CategoryId) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ embedded, categoryParam, onNavigate }) => {
  const categoryId = embedded ? categoryParam : undefined;
  const isOverview = !categoryId;
  const activeCat: CategoryId | 'overview' =
    isCategoryId(categoryId) ? (categoryId as CategoryId) : 'overview';

  const [period, setPeriod] = useState<Period>('day');
  const realConversions = useMemo(() => getLocalConversions(), []);

  const breadcrumb = (
    <Breadcrumb active={activeCat} embedded={!!embedded} onNavigate={onNavigate} />
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50">
      <DashboardSidebar
        active={activeCat}
        embedded={!!embedded}
        onNavigate={onNavigate}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {breadcrumb}
          {isOverview
            ? <OverviewView realConversions={realConversions} embedded={!!embedded} onNavigate={onNavigate} />
            : <CategoryView categoryId={activeCat as CategoryId} period={period} setPeriod={setPeriod} realConversions={realConversions} embedded={!!embedded} onNavigate={onNavigate} />}
        </div>
      </main>
    </div>
  );
};

const Breadcrumb: React.FC<{ active: CategoryId | 'overview'; embedded?: boolean; onNavigate?: (page: 'overview' | 'category', cat?: CategoryId) => void }> = ({ active, embedded, onNavigate }) => {
  const isOverview = active === 'overview';
  const meta = CATEGORY_LIST.find(c => c.id === active);
  const linkEl = isOverview
    ? <span className="text-slate-900">Analytics</span>
    : <button type="button" onClick={() => (embedded && onNavigate ? onNavigate('overview') : null)} className="hover:text-blue-600">
        Analytics
      </button>;
  return (
    <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-4">
      {linkEl}
      {!isOverview && meta && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-900">{meta.name}</span>
        </>
      )}
    </nav>
  );
};

// ---------- OverviewView ---------------------------------------------------
const OverviewView: React.FC<{ realConversions: import('../types').FileConversion[]; embedded?: boolean; onNavigate?: (page: 'overview' | 'category', cat?: CategoryId) => void }> = ({ realConversions, embedded, onNavigate }) => {
  const summaries = useMemo(() => CATEGORY_LIST.map(c => buildCategorySummary(c.id, realConversions)), [realConversions]);
  const totals = useMemo(() => summaries.reduce((acc, s) => ({
    conversions: acc.conversions + s.totalConversions,
    users: acc.users + s.uniqueUsers,
    bytes: acc.bytes + s.totalBytesProcessed,
    pairs: acc.pairs + s.browserFeasiblePairs + s.serverRequiredPairs,
  }), { conversions: 0, users: 0, bytes: 0, pairs: 0 }), [summaries]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">OmniConvert Analytics</h1>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          Cross-category conversion insights, trending pairs, and processing-path analytics.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
        <BigStat label="Total conversions" value={totals.conversions.toLocaleString()} accent="text-blue-700" />
        <BigStat label="Unique users" value={totals.users.toLocaleString()} accent="text-violet-700" />
        <BigStat label="Pairs reachable" value={totals.pairs.toLocaleString()} accent="text-emerald-700" />
        <BigStat label="Bytes processed" value={formatBytes(totals.bytes)} accent="text-amber-700" />
      </div>

      <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-3">Per-category</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {summaries.map(s => {
          const card = (
            <div className="rounded-xl border border-slate-200 bg-white p-4 transition group-hover:border-blue-300 group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">{s.name}</h3>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
              </div>
              <p className="mt-1 text-[11px] font-semibold text-slate-500 line-clamp-2">{s.description}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Mini label="Conversions" value={s.totalConversions.toLocaleString()} />
                <Mini label="Users" value={s.uniqueUsers.toLocaleString()} />
                <Mini label="Success" value={s.successRate + '%'} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-2">
                <Mini label="Browser" value={s.browserFeasiblePairs.toString()} subtle />
                <Mini label="Server" value={s.serverRequiredPairs.toString()} subtle />
                <Mini label="Avg" value={formatMs(s.avgTimeMs)} subtle />
              </div>
            </div>
          );
          if (embedded && onNavigate) {
            return (
              <button key={s.id} type="button" onClick={() => onNavigate('category', s.id)} className="text-left block group">
                {card}
              </button>
            );
          }
          return (
            <Link key={s.id} to={`/dashboard/${s.id}`} className="block group">{card}</Link>
          );
        })}
      </div>
    </div>
  );
};

const BigStat: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-black tabular-nums ${accent}`}>{value}</p>
  </div>
);

const Mini: React.FC<{ label: string; value: string; subtle?: boolean }> = ({ label, value, subtle }) => (
  <div>
    <p className={`text-[10px] font-black uppercase tracking-wider ${subtle ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
    <p className={`mt-0.5 text-sm font-black tabular-nums ${subtle ? 'text-slate-600' : 'text-slate-900'}`}>{value}</p>
  </div>
);

// ---------- CategoryView ---------------------------------------------------
const CategoryView: React.FC<{
  categoryId: CategoryId; period: Period; setPeriod: (p: Period) => void;
  realConversions: import('../types').FileConversion[];
  embedded?: boolean; onNavigate?: (page: 'overview' | 'category', cat?: CategoryId) => void;
}> = ({ categoryId, period, setPeriod, realConversions, embedded, onNavigate }) => {
  const meta = CATEGORY_LIST.find(c => c.id === categoryId)!;
  const summary = useMemo(() => buildCategorySummary(categoryId, realConversions), [categoryId, realConversions]);
  const popularPairs = useMemo(() => buildPopularPairs(categoryId), [categoryId]);
  const matrix = useMemo(() => buildMatrix(categoryId), [categoryId]);
  const breakdown = useMemo(() => buildProcessingBreakdown(categoryId), [categoryId]);
  const timeline = useMemo(() => buildUsageTimeline(categoryId, period), [categoryId, period]);
  const advanced = useMemo(() => buildAdvancedStats(categoryId, summary), [categoryId, summary]);

  const backLink = embedded && onNavigate
    ? <button type="button" onClick={() => onNavigate('overview')} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600">
        <ArrowLeft className="h-3 w-3" /> Back to overview
      </button>
    : <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600">
        <ArrowLeft className="h-3 w-3" /> Back to overview
      </Link>;

  return (
    <div className="space-y-6">
      <header>
        {backLink}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{meta.name} analytics</h1>
        <p className="mt-1 text-sm font-semibold text-slate-600">{meta.description}</p>
      </header>

      <KpiGrid summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FromToMatrix sources={matrix.sources} targets={matrix.targets} cells={matrix.cells} />
        <ProcessingBreakdownPanel breakdown={breakdown} />
      </div>

      <PopularPairsTable pairs={popularPairs} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TrendingChart points={timeline} period={period} />
        <TimeStatsPanel
          avg={summary.avgTimeMs}
          median={summary.medianTimeMs}
          p95={summary.p95TimeMs}
          queueWaitMs={advanced.queueWaitMs}
          coldStartMs={advanced.coldStartMs}
        />
      </div>

      <UsageTimeline points={timeline} period={period} onPeriodChange={setPeriod} />

      <AdvancedStatsPanel stats={advanced} />
    </div>
  );
};

export default Dashboard;