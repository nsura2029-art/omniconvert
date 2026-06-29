import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '../../pages/stubRouter';
import { ChevronRight, Activity, RefreshCw } from 'lucide-react';
import {
  CATEGORY_LIST, CategoryId,
  buildCategorySummary, buildPopularPairs, buildMatrix,
  buildProcessingBreakdown, buildUsageTimeline, buildAdvancedStats,
} from '../../data/dashboardAnalytics';
import { KpiGrid } from '../../components/dashboard/KpiCard';
import FromToMatrix from '../../components/dashboard/FromToMatrix';
import {
  PopularPairsTable, TrendingChart, ProcessingBreakdownPanel,
  TimeStatsPanel, UsageTimeline, AdvancedStatsPanel,
} from '../../components/dashboard/DashboardPanels';
import { getLocalConversions, StoredConversion } from '../../data/localConversions';
import { FileConversion } from '../../types';
import { Period } from '../../data/dashboardAnalytics';

const AdminAnalyticsSection: React.FC = () => {
  const [tick, setTick] = useState(0);
  const [realConversions, setRealConversions] = useState<FileConversion[]>([]);
  const [period, setPeriod] = useState<Period>('day');
  const [activeCat, setActiveCat] = useState<CategoryId | 'overview'>('overview');

  // Realtime: poll localStorage every 5 seconds. Real conversions blend
  // into the KPI cards so the admin sees actual usage, not seeded numbers.
  useEffect(() => {
    const refresh = () => setRealConversions(getLocalConversions());
    refresh();
    const id = setInterval(() => {
      refresh();
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Per-category conversion insights. Realtime conversion counts blended in from localStorage every 5s.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live · {realConversions.length.toLocaleString()} conversions in store
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_LIST.map(cat => {
          const catConversions = realConversions.filter(c => (c.category || '').toLowerCase() === cat.id);
          const isActive = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCat(cat.id)}
              className={`rounded-xl border bg-white p-4 text-left transition ${
                isActive ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">{cat.name}</h3>
                <ChevronRight className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-300'}`} />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-slate-500 line-clamp-2">{cat.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Mini label="Realtime" value={catConversions.length.toLocaleString()} accent="text-blue-700" />
                <Mini label="All-time" value={getAllTimeForCategory(cat.id).toLocaleString()} accent="text-slate-700" />
              </div>
            </button>
          );
        })}
      </div>

      {activeCat !== 'overview' && (
        <AnalyticsDetail
          categoryId={activeCat}
          period={period}
          setPeriod={setPeriod}
          realConversions={realConversions}
        />
      )}

      {activeCat === 'overview' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
          <Activity className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-bold">Pick a category above to drill in</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Realtime conversion counts blend with the seeded per-category analytics.</p>
        </div>
      )}
    </div>
  );
};

const AnalyticsDetail: React.FC<{
  categoryId: CategoryId;
  period: Period;
  setPeriod: (p: Period) => void;
  realConversions: FileConversion[];
}> = ({ categoryId, period, setPeriod, realConversions }) => {
  const meta = CATEGORY_LIST.find(c => c.id === categoryId)!;
  const summary = useMemo(() => buildCategorySummary(categoryId, realConversions), [categoryId, realConversions]);
  const popularPairs = useMemo(() => buildPopularPairs(categoryId), [categoryId]);
  const matrix = useMemo(() => buildMatrix(categoryId), [categoryId]);
  const breakdown = useMemo(() => buildProcessingBreakdown(categoryId), [categoryId]);
  const timeline = useMemo(() => buildUsageTimeline(categoryId, period), [categoryId, period]);
  const advanced = useMemo(() => buildAdvancedStats(categoryId, summary), [categoryId, summary]);

  const catReal = realConversions.filter(c => (c.category || '').toLowerCase() === categoryId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">{meta.name} analytics</h2>
        <span className="text-xs font-black text-slate-500">
          {catReal.length.toLocaleString()} realtime / {summary.totalConversions.toLocaleString()} all-time
        </span>
      </div>

      <KpiGrid summary={summary} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <FromToMatrix sources={matrix.sources} targets={matrix.targets} cells={matrix.cells} />
        <ProcessingBreakdownPanel breakdown={breakdown} />
      </div>

      <PopularPairsTable pairs={popularPairs} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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

const Mini: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-0.5 text-base font-black tabular-nums ${accent}`}>{value}</p>
  </div>
);

// For categories with no realtime data, fall back to the seeded number
// so admin sees something meaningful while polling settles.
const getAllTimeForCategory = (cat: CategoryId): number => {
  const real = (getLocalConversions() as StoredConversion[]).filter(c => (c.category || '').toLowerCase() === cat);
  return real.length;
};

export default AdminAnalyticsSection;