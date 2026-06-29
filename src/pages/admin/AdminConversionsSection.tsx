import React, { useEffect, useMemo, useState } from 'react';
import { Activity, RefreshCw, ChevronDown } from 'lucide-react';
import { FileConversion } from '../../types';
import { getLocalConversions } from '../../data/localConversions';

type SortKey = 'timestamp' | 'fileName' | 'toolName' | 'status';
type StatusFilter = 'all' | 'completed' | 'processing' | 'failed';

const AdminConversionsSection: React.FC = () => {
  const [conversions, setConversions] = useState<FileConversion[]>([]);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('timestamp');

  useEffect(() => {
    const refresh = () => setConversions(getLocalConversions());
    refresh();
    const id = setInterval(() => { refresh(); setTick(t => t + 1); }, 5000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    let arr = [...conversions];
    if (statusFilter !== 'all') arr = arr.filter(c => c.status === statusFilter);
    if (query) {
      const q = query.toLowerCase();
      arr = arr.filter(c =>
        (c.fileName || '').toLowerCase().includes(q) ||
        (c.toolName || '').toLowerCase().includes(q)
      );
    }
    arr.sort((a, b) => {
      if (sort === 'timestamp') return Date.parse(b.timestamp) - Date.parse(a.timestamp);
      if (sort === 'fileName')  return a.fileName.localeCompare(b.fileName);
      if (sort === 'toolName')  return a.toolName.localeCompare(b.toolName);
      if (sort === 'status')    return a.status.localeCompare(b.status);
      return 0;
    });
    return arr;
  }, [conversions, statusFilter, query, sort, tick]);

  const byStatus = useMemo(() => ({
    all: conversions.length,
    completed: conversions.filter(c => c.status === 'completed').length,
    processing: conversions.filter(c => c.status === 'processing').length,
    failed: conversions.filter(c => c.status === 'failed').length,
  }), [conversions, tick]);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Conversions</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Realtime conversion logs from localStorage. Refreshes every 5 seconds.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </header>

      <div className="grid grid-cols-4 gap-3">
        {(['all', 'completed', 'processing', 'failed'] as StatusFilter[]).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl border p-3 text-left transition ${
              statusFilter === s
                ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100'
                : 'border-slate-200 bg-white hover:border-blue-200'
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{s}</p>
            <p className="mt-1 text-xl font-black tabular-nums text-slate-900">{byStatus[s].toLocaleString()}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter by file or tool name"
          className="flex-1 max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <button
          type="button"
          onClick={() => { setConversions(getLocalConversions()); setTick(t => t + 1); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <SortHeader label="When" sortKey="timestamp" current={sort} setSort={setSort} />
              <SortHeader label="File" sortKey="fileName" current={sort} setSort={setSort} />
              <SortHeader label="Tool" sortKey="toolName" current={sort} setSort={setSort} />
              <SortHeader label="Status" sortKey="status" current={sort} setSort={setSort} />
              <th className="px-4 py-2 text-right">Size</th>
              <th className="px-4 py-2 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 100).map((c, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 text-xs text-slate-700">
                  <div className="flex flex-col">
                    <span className="font-black">{new Date(c.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[10px] text-slate-500">{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-xs font-black text-slate-800 max-w-xs truncate">{c.fileName}</td>
                <td className="px-4 py-2 text-xs font-bold text-slate-700">{c.toolName}</td>
                <td className="px-4 py-2">
                  <StatusPill status={c.status} />
                </td>
                <td className="px-4 py-2 text-right text-xs text-slate-700 tabular-nums">
                  {c.fileSize ? formatBytes(c.fileSize) : '—'}
                </td>
                <td className="px-4 py-2 text-right text-xs text-slate-700 tabular-nums">
                  {c.processingTimeMs != null ? `${c.processingTimeMs} ms` : '—'}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-500">
                No conversions match. Trigger one in the converter and it'll show up here in realtime.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-slate-500">Showing {Math.min(100, sorted.length)} of {sorted.length}.</div>
    </div>
  );
};

const SortHeader: React.FC<{ label: string; sortKey: SortKey; current: SortKey; setSort: (s: SortKey) => void }> = ({ label, sortKey, current, setSort }) => (
  <th className="px-4 py-2 text-left">
    <button
      type="button"
      onClick={() => setSort(sortKey)}
      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider hover:text-blue-600 ${
        current === sortKey ? 'text-blue-700' : 'text-slate-500'
      }`}
    >
      {label}
      <ChevronDown className={`h-3 w-3 ${current === sortKey ? 'text-blue-600' : 'text-slate-400'}`} />
    </button>
  </th>
);

const StatusPill: React.FC<{ status: FileConversion['status'] }> = ({ status }) => {
  const map: Record<FileConversion['status'], string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-amber-100 text-amber-700',
    failed: 'bg-rose-100 text-rose-700',
    queued: 'bg-slate-100 text-slate-700',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${map[status]}`}>{status}</span>;
};

const formatBytes = (b: number): string => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB';
  return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

export default AdminConversionsSection;