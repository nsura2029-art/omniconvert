import React from 'react';
import { MegaMenuTool } from '../../types/mega-menu';
import FormatIcon from './FormatIcon';
import ToolBadge from './ToolBadge';

interface Props {
  tool: MegaMenuTool;
  onNavigate?: (url: string) => void;
  size?: 'sm' | 'md';
}

/**
 * Atomic card for every mega-menu tool. Always rendered as an <a> tag
 * with the tool's `url` so crawlers + JS-disabled clients see all 65+
 * links in the initial HTML.
 */
const MegaMenuToolCard: React.FC<Props> = ({ tool, onNavigate, size = 'md' }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow modifier-clicks (open in new tab) to use native behavior.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (onNavigate) {
      e.preventDefault();
      onNavigate(tool.url);
    }
  };

  return (
    <a
      href={tool.url}
      onClick={handleClick}
      className="group/megacard relative flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      aria-label={`${tool.label} — ${tool.meta}`}
    >
      <FormatIcon source={tool.source} target={tool.target} size={size === 'sm' ? 'sm' : 'md'} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-black leading-tight text-slate-900 group-hover/megacard:text-blue-700">
          {tool.label}
        </p>
        <p className="mt-1 truncate font-mono text-[10px] text-slate-500">
          .{tool.source.toLowerCase()} → .{tool.target.toLowerCase()}
        </p>
        {tool.badge ? (
          <div className="mt-1.5">
            <ToolBadge badge={tool.badge} />
          </div>
        ) : null}
      </div>
    </a>
  );
};

export default MegaMenuToolCard;