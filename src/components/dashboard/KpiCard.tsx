import React from 'react';
import { CategorySummary } from '../../data/dashboardAnalytics';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  hint?: string;
  accent?: 'blue' | 'emerald' | 'rose' | 'amber' | 'slate' | 'violet';
}

const accentMap = {
  blue:    { ring: 'ring-blue-200',    text: 'text-blue-700',    bg: 'bg-blue-50' },
  emerald: { ring: 'ring-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  rose:    { ring: 'ring-rose-200',    text: 'text-rose-700',    bg: 'bg-rose-50' },
  amber:   { ring: 'ring-amber-200',   text: 'text-amber-700',   bg: 'bg-amber-50' },
  slate:   { ring: 'ring-slate-200',   text: 'text-slate-700',   bg: 'bg-slate-50' },
  violet:  { ring: 'ring-violet-200',  text: 'text-violet-700',  bg: 'bg-violet-50' },
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, unit, delta, hint, accent = 'blue' }) => {
  const a = accentMap[accent];
  return (
    <div className={`rounded-xl border border-slate-200 ${a.bg} p-4 ring-1 ring-inset ${a.ring}`}>
      <p className={`text-[10px] font-black uppercase tracking-wider ${a.text}`}>{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
        {value}
        {unit && <span className="ml-1 text-xs font-bold text-slate-500">{unit}</span>}
      </p>
      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
        {delta !== undefined && (
          <span className={`inline-flex items-center gap-0.5 font-black ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="font-semibold text-slate-500">{hint}</span>}
      </div>
    </div>
  );
};

export const KpiGrid: React.FC<{ summary: CategorySummary }> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label="Total conversions"
        value={summary.totalConversions.toLocaleString()}
        delta={12}
        hint="vs last week"
        accent="blue"
      />
      <KpiCard
        label="Unique users"
        value={summary.uniqueUsers.toLocaleString()}
        delta={6}
        hint="active in last 7d"
        accent="violet"
      />
      <KpiCard
        label="Success rate"
        value={summary.successRate}
        unit="%"
        delta={1}
        hint="last 30d"
        accent="emerald"
      />
      <KpiCard
        label="Avg time"
        value={(summary.avgTimeMs / 1000).toFixed(2)}
        unit="s"
        delta={-8}
        hint={`p95: ${(summary.p95TimeMs / 1000).toFixed(1)}s`}
        accent="amber"
      />
      <KpiCard
        label="Formats supported"
        value={summary.totalFormats}
        hint={`${summary.writableFormats} writable`}
        accent="slate"
      />
      <KpiCard
        label="Browser-feasible pairs"
        value={summary.browserFeasiblePairs.toLocaleString()}
        hint="no server roundtrip"
        accent="emerald"
      />
      <KpiCard
        label="Server-required pairs"
        value={summary.serverRequiredPairs.toLocaleString()}
        hint="needs Phase 2 gateway"
        accent="rose"
      />
      <KpiCard
        label="Bytes processed"
        value={formatBytes(summary.totalBytesProcessed)}
        delta={21}
        hint="lifetime"
        accent="blue"
      />
    </div>
  );
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const formatMs = (ms: number): string => {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
};

export default KpiCard;