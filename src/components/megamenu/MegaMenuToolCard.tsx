import React from 'react';
import { MegaMenuTool } from '../../types/mega-menu';

interface Props {
  tool: MegaMenuTool;
  onNavigate?: (url: string) => void;
  size?: 'sm' | 'md';
}

/**
 * Atomic card for every mega-menu tool. Always rendered as an <a> tag
 * with the tool's `url` so crawlers + JS-disabled clients see all 65+
 * links in the initial HTML. No icons, no hot/new badges — clean
 * text-only label.
 */
const MegaMenuToolCard: React.FC<Props> = ({ tool, onNavigate }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
      className="group/megacard block rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      aria-label={`${tool.label} — ${tool.meta}`}
    >
      <p className="truncate text-[12px] font-black leading-tight text-slate-900 group-hover/megacard:text-blue-700">
        {tool.label}
      </p>
      <p className="mt-1 truncate font-mono text-[10px] text-slate-500">
        .{tool.source.toLowerCase()} → .{tool.target.toLowerCase()}
      </p>
    </a>
  );
};

export default MegaMenuToolCard;