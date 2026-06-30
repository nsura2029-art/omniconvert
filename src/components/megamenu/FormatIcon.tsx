import React from 'react';
import { ArrowRight } from 'lucide-react';
import { colorForFormat, iconLetter } from '../../lib/format-colors';

interface Props {
  source: string;
  target: string;
  size?: 'sm' | 'md';
}

const FormatIcon: React.FC<Props> = ({ source, target, size = 'md' }) => {
  const s = colorForFormat(source);
  const t = colorForFormat(target);
  const dim = size === 'sm' ? 'h-7 w-12 text-[9px]' : 'h-9 w-16 text-[10px]';
  const pad = size === 'sm' ? 'px-1 py-0.5' : 'px-2 py-1';

  return (
    <div className={`relative flex shrink-0 items-center gap-0.5 ${dim}`}>
      <span className={`flex-1 truncate rounded-md font-mono font-black uppercase ${pad} ${s.bg} ${s.fg}`}>
        {iconLetter(source)}
      </span>
      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-slate-300" strokeWidth={2.5} />
      <span className={`flex-1 truncate rounded-md font-mono font-black uppercase ${pad} ${t.bg} ${t.fg}`}>
        {iconLetter(target)}
      </span>
    </div>
  );
};

export default FormatIcon;