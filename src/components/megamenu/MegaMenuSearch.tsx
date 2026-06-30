import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const MegaMenuSearch: React.FC<Props> = ({ value, onChange, placeholder }) => (
  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
    <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? 'Search all 65+ tools…'}
      className="flex-1 bg-transparent text-[12px] text-slate-700 placeholder:text-slate-400 outline-none"
      aria-label="Search conversion tools"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-slate-200"
        aria-label="Clear search"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </div>
);

export default MegaMenuSearch;