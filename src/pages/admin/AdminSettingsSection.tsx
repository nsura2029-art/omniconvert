import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

interface AdminSettingsSectionProps {
  activeHeroPreset?: 'cyber' | 'bento';
  onChangeHeroPreset?: (p: 'cyber' | 'bento') => void;
}

const AdminSettingsSection: React.FC<AdminSettingsSectionProps> = ({ activeHeroPreset, onChangeHeroPreset }) => (
  <div className="space-y-5">
    <header>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Settings</h1>
      <p className="mt-1 text-sm font-semibold text-slate-600">System configuration. Realtime KV / R2 / Queues wiring lands in Phase 2.</p>
    </header>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
          <SettingsIcon className="h-4 w-4" /> Landing hero preset
        </h3>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">
          Switch between the cyber intro and the bento grid layouts for the public landing page.
        </p>
        <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          {(['cyber', 'bento'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onChangeHeroPreset?.(p)}
              className={`rounded-md px-3 py-1 text-xs font-black uppercase tracking-wider transition ${
                activeHeroPreset === p ? 'bg-white text-blue-700 shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Backend wiring (Phase 2)</h3>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">
          These come online once Cloudflare account access is available. See skills/omniconvert-conversion-matrix §6 for the deploy plan.
        </p>
        <ul className="mt-3 space-y-1 text-xs text-slate-700">
          <li className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
            <span>KV namespace JOBS</span><span className="text-[10px] font-black uppercase text-amber-700">Pending</span>
          </li>
          <li className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
            <span>KV namespace RATE</span><span className="text-[10px] font-black uppercase text-amber-700">Pending</span>
          </li>
          <li className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
            <span>R2 bucket ARTIFACTS</span><span className="text-[10px] font-black uppercase text-amber-700">Pending</span>
          </li>
          <li className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
            <span>Queue jobs-cad / jobs-docs / jobs-audio</span><span className="text-[10px] font-black uppercase text-amber-700">Pending</span>
          </li>
          <li className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
            <span>Gateway Worker omni-api</span><span className="text-[10px] font-black uppercase text-amber-700">Pending</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default AdminSettingsSection;