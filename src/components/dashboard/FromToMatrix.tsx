import React from 'react';
import { MatrixCell } from '../../data/dashboardAnalytics';

interface FromToMatrixProps {
  sources: string[];
  targets: string[];
  cells: MatrixCell[];
}

const FromToMatrix: React.FC<FromToMatrixProps> = ({ sources, targets, cells }) => {
  const max = Math.max(1, ...cells.map(c => c.count));
  const lookup = new Map<string, MatrixCell>();
  cells.forEach(c => lookup.set(`${c.source}|${c.target}`, c));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">From → To matrix</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Conversion volume by source-target pair. Green tint = browser-feasible, slate = server-required.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500" />Browser</span>
          <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-slate-300" />Server</span>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="border-separate border-spacing-0 text-[10px] font-mono font-black uppercase">
          <thead>
            <tr>
              <th className="px-2 py-1 text-right text-slate-400">from \ to</th>
              {targets.map(t => (
                <th key={t} className="px-2 py-1 text-slate-500 font-black">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map(s => (
              <tr key={s}>
                <th className="px-2 py-1 text-right text-slate-500 font-black whitespace-nowrap">{s}</th>
                {targets.map(t => {
                  if (s === t) {
                    return <td key={t} className="px-2 py-1 text-slate-200">·</td>;
                  }
                  const cell = lookup.get(`${s}|${t}`);
                  if (!cell) return <td key={t} className="px-2 py-1" />;
                  const intensity = Math.min(1, cell.count / max);
                  const bg = cell.browserFeasible
                    ? `rgba(16, 185, 129, ${0.08 + intensity * 0.85})`
                    : `rgba(100, 116, 139, ${0.04 + intensity * 0.5})`;
                  const text = intensity > 0.5 ? 'text-white' : 'text-slate-700';
                  return (
                    <td
                      key={t}
                      title={`${s} -> ${t}: ${cell.count} conversions (${cell.browserFeasible ? 'browser-feasible' : 'server-required'})`}
                      className={`px-2 py-1 ${text} text-center tabular-nums rounded`}
                      style={{ background: bg }}
                    >
                      {cell.count}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FromToMatrix;