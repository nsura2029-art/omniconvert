import React from 'react';
import { ArrowRight, Server, Globe, MonitorSmartphone, Database, Clock, Zap, Users } from 'lucide-react';
import {
  PopularPair, TimePoint, ProcessingBreakdown, AdvancedStats, Period,
} from '../../data/dashboardAnalytics';
import { formatBytes, formatMs } from './KpiCard';

// ---------- PopularPairs ----------------------------------------------------
export const PopularPairsTable: React.FC<{ pairs: PopularPair[] }> = ({ pairs }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Popular conversion pairs</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Top pairs by 30-day volume.</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 text-left">Source</th>
              <th className="px-3 py-2" />
              <th className="px-3 py-2 text-left">Target</th>
              <th className="px-3 py-2 text-right">Volume</th>
              <th className="px-3 py-2 text-right">Success</th>
              <th className="px-3 py-2 text-right">Avg time</th>
              <th className="px-3 py-2 text-center">Path</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono font-black text-slate-800">{p.source}</td>
                <td className="px-3 py-2 text-slate-400"><ArrowRight className="h-3.5 w-3.5" /></td>
                <td className="px-3 py-2 font-mono font-black text-slate-800">{p.target}</td>
                <td className="px-3 py-2 text-right font-bold tabular-nums text-slate-900">{p.count.toLocaleString()}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-black ${
                    p.successRate >= 96 ? 'bg-emerald-100 text-emerald-700'
                      : p.successRate >= 90 ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                  }`}>
                    {p.successRate}%
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-700">{formatMs(p.avgTimeMs)}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                    p.browserFeasible ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {p.browserFeasible
                      ? <><MonitorSmartphone className="h-3 w-3" /> Browser</>
                      : <><Server className="h-3 w-3" /> Server</>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- TrendingChart (line chart, hand-rolled SVG) --------------------
export const TrendingChart: React.FC<{ points: TimePoint[]; period: Period }> = ({ points, period }) => {
  const w = 600;
  const h = 180;
  const pad = { l: 36, r: 12, t: 16, b: 28 };
  const max = Math.max(1, ...points.map(p => p.count));
  const stepX = (w - pad.l - pad.r) / Math.max(1, points.length - 1);
  const xy = (i: number) => {
    const x = pad.l + i * stepX;
    const y = h - pad.b - (points[i].count / max) * (h - pad.t - pad.b);
    return [x, y] as const;
  };
  const linePath = points.map((_, i) => {
    const [x, y] = xy(i);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const areaPath = `${linePath} L ${(pad.l + (points.length - 1) * stepX).toFixed(1)} ${(h - pad.b).toFixed(1)} L ${pad.l.toFixed(1)} ${(h - pad.b).toFixed(1)} Z`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
            Trending conversions
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Volume over the last {period}.
          </p>
        </div>
        <div className="text-[11px] font-black text-slate-500">
          Peak: {Math.max(...points.map(p => p.count)).toLocaleString()}
        </div>
      </div>
      <div className="mt-4 overflow-hidden">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
          <defs>
            <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g, i) => {
            const y = pad.t + g * (h - pad.t - pad.b);
            return <line key={i} x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 4" />;
          })}
          {[0, 0.5, 1].map((g, i) => {
            const value = Math.round(max * (1 - g));
            const y = pad.t + g * (h - pad.t - pad.b);
            return (
              <text key={i} x={pad.l - 6} y={y + 3} fontSize="10" textAnchor="end" fill="#94a3b8" fontWeight="700">
                {value.toLocaleString()}
              </text>
            );
          })}
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => {
            const [x, y] = xy(i);
            return <circle key={i} cx={x} cy={y} r="2.5" fill="#2563eb" stroke="white" strokeWidth="1.5" />;
          })}
          {points.map((p, i) => {
            if (i % Math.max(1, Math.floor(points.length / 6)) !== 0 && i !== points.length - 1) return null;
            const [x, y] = xy(i);
            return (
              <text key={i} x={x} y={h - 8} fontSize="9" textAnchor="middle" fill="#94a3b8" fontWeight="700">
                {p.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ---------- ProcessingBreakdown ---------------------------------------------
export const ProcessingBreakdownPanel: React.FC<{ breakdown: ProcessingBreakdown }> = ({ breakdown }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Processing path</h3>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">
        How this category's conversions are executed.
      </p>
      <div className="mt-4 space-y-3">
        <BarRow label="Browser-feasible" value={breakdown.browserFeasible} color="bg-emerald-500" icon={MonitorSmartphone} />
        <BarRow label="Hybrid (browser + server fallback)" value={breakdown.hybrid} color="bg-blue-500" icon={Globe} />
        <BarRow label="Server-required" value={breakdown.serverRequired} color="bg-slate-400" icon={Server} />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
        Browser-feasible pairs run entirely in the user's browser via WASM / Canvas / SheetJS / ffmpeg.wasm —
        no upload, no server cost. Server-required pairs go through the Cloudflare Worker gateway (Phase 2)
        and the cloud engine proxy (LibreOffice, OpenCascade, Calibre).
      </div>
    </div>
  );
};

const BarRow: React.FC<{ label: string; value: number; color: string; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, color, icon: Icon }) => (
  <div>
    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
      <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-slate-500" /> {label}</span>
      <span className="tabular-nums">{value}%</span>
    </div>
    <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

// ---------- TimeStats -------------------------------------------------------
export const TimeStatsPanel: React.FC<{
  avg: number; median: number; p95: number; queueWaitMs: number; coldStartMs: number;
}> = ({ avg, median, p95, queueWaitMs, coldStartMs }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Latency breakdown</h3>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">
        Median / p95 conversion time and Worker overhead.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Avg"   value={formatMs(avg)}   icon={Clock} accent="text-blue-700" />
        <Stat label="Median"value={formatMs(median)}icon={Clock} accent="text-blue-700" />
        <Stat label="P95"   value={formatMs(p95)}   icon={Clock} accent="text-rose-700" />
        <Stat label="Queue wait" value={formatMs(queueWaitMs)} icon={Database} accent="text-slate-700" />
        <Stat label="Cold start" value={formatMs(coldStartMs)} icon={Zap} accent="text-amber-700" />
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent: string }> = ({ label, value, icon: Icon, accent }) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
      <Icon className={`h-3 w-3 ${accent}`} /> {label}
    </div>
    <p className={`mt-1 text-lg font-black tabular-nums ${accent}`}>{value}</p>
  </div>
);

// ---------- UsageTimeline ---------------------------------------------------
export const UsageTimeline: React.FC<{
  points: TimePoint[]; period: Period; onPeriodChange: (p: Period) => void;
}> = ({ points, period, onPeriodChange }) => {
  const total = points.reduce((s, p) => s + p.count, 0);
  const bytes = points.reduce((s, p) => s + p.bytes, 0);
  const peak = points.reduce((max, p) => p.count > max.count ? p : max, points[0]);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Usage timeline</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Conversion volume grouped by {period}.
          </p>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-black">
          {(['day', 'week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 rounded-md transition ${
                period === p ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total</p>
          <p className="mt-1 text-lg font-black text-slate-900 tabular-nums">{total.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Peak</p>
          <p className="mt-1 text-lg font-black text-slate-900 tabular-nums">{peak.label} · {peak.count}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Bytes</p>
          <p className="mt-1 text-lg font-black text-slate-900 tabular-nums">{formatBytes(bytes)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-px h-24">
        {points.map((p, i) => {
          const max = Math.max(1, ...points.map(q => q.count));
          const h = Math.max(2, (p.count / max) * 92);
          const isPeak = p === peak;
          return (
            <div
              key={i}
              title={`${p.label}: ${p.count} conversions · ${formatBytes(p.bytes)}`}
              className={`flex-1 rounded-t ${isPeak ? 'bg-blue-600' : 'bg-blue-300 hover:bg-blue-400'} transition-colors`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ---------- AdvancedStats ---------------------------------------------------
export const AdvancedStatsPanel: React.FC<{ stats: AdvancedStats }> = ({ stats }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Advanced analytics</h3>
        <span className="text-[10px] font-black uppercase tracking-wider text-violet-600">Phase 2 inputs</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdvStat label="Peak hour"          value={stats.peakHour}          icon={Clock} />
        <AdvStat label="Avg file size"      value={formatBytes(stats.avgFileSizeBytes)} icon={Database} />
        <AdvStat label="Error rate"         value={stats.errorRate + '%'}   icon={Zap} accent={stats.errorRate > 6 ? 'text-rose-700' : 'text-emerald-700'} />
        <AdvStat label="Cold start"         value={stats.coldStartMs + ' ms'} icon={Zap} />
        <AdvStat label="7-day retention"    value={stats.retention7d + '%'} icon={Users} />
        <AdvStat label="30-day retention"   value={stats.retention30d + '%'} icon={Users} />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
            Format popularity trend (7d delta)
          </p>
          <div className="space-y-1.5">
            {stats.formatPopularity.map(f => (
              <div key={f.format} className="flex items-center gap-3">
                <span className="w-14 font-mono text-xs font-black text-slate-700">{f.format}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${f.delta >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, Math.abs(f.delta) * 1.5 + 8)}%` }}
                  />
                </div>
                <span className={`w-12 text-right text-xs font-black tabular-nums ${f.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {f.delta >= 0 ? '+' : ''}{f.delta}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
            Top regions
          </p>
          <div className="space-y-1.5">
            {stats.geoTop.map(g => (
              <div key={g.region} className="flex items-center gap-3">
                <span className="w-28 text-xs font-bold text-slate-700">{g.region}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${g.share * 2}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-black tabular-nums text-slate-700">{g.share}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdvStat: React.FC<{ label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: string }> = ({ label, value, icon: Icon, accent = 'text-slate-700' }) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
      <Icon className={`h-3 w-3 ${accent}`} /> {label}
    </div>
    <p className={`mt-1 text-lg font-black tabular-nums ${accent}`}>{value}</p>
  </div>
);