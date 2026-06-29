import React from 'react';
import { Link } from '../../pages/stubRouter';
import {
  FileText, Table, Presentation, Image, Volume2, Video, Archive, Box,
  BookOpen, PenTool, Type, Layers, LayoutDashboard, Activity, ChevronRight,
} from 'lucide-react';
import { CATEGORY_LIST, CategoryId } from '../../data/dashboardAnalytics';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'file-text': FileText, 'table': Table, 'presentation': Presentation,
  image: Image, 'volume-2': Volume2, video: Video, archive: Archive,
  box: Box, 'book-open': BookOpen, 'pen-tool': PenTool, type: Type, layers: Layers,
};

interface DashboardSidebarProps {
  active: CategoryId | 'overview';
  embedded?: boolean;
  onNavigate?: (page: 'overview' | 'category', cat?: CategoryId) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ active, embedded, onNavigate }) => {
  const renderLink = (key: string, to: string | null, label: string, iconEl: React.ReactNode, isActive: boolean) => {
    if (embedded && onNavigate) {
      return (
        <button
          key={key}
          type="button"
          onClick={() => to === null ? onNavigate('overview') : onNavigate('category', to as CategoryId)}
          className={`flex w-full items-center gap-3 px-4 py-2 text-sm font-bold transition group ${
            isActive
              ? 'bg-blue-50 text-blue-700 shadow-[inset_3px_0_0_0_theme(colors.blue.600)]'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {iconEl}
          <span className="flex-1 text-left">{label}</span>
        </button>
      );
    }
    return (
      <Link
        key={key}
        to={to === null ? '/dashboard' : `/dashboard/${to}`}
        className={`flex items-center gap-3 px-4 py-2 text-sm font-bold transition group ${
          isActive
            ? 'bg-blue-50 text-blue-700 shadow-[inset_3px_0_0_0_theme(colors.blue.600)]'
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        {iconEl}
        <span className="flex-1">{label}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50" />
      </Link>
    );
  };

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Analytics</h2>
        </div>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">Per-category conversion insights</p>
      </div>
      <nav className="flex-1 py-2">
        {renderLink('overview', null, 'Overview', <Activity className="h-4 w-4" />, active === 'overview')}
        <div className="mt-3 px-4 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
          Categories
        </div>
        {CATEGORY_LIST.map(cat => {
          const Icon = ICON_MAP[cat.icon] || Box;
          return renderLink(
            cat.id,
            cat.id,
            cat.name,
            <Icon className="h-4 w-4" />,
            active === cat.id
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
        Seeded analytics shown. Real conversion counts blend in when present.
      </div>
    </aside>
  );
};

export default DashboardSidebar;