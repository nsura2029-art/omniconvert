import React, { useEffect, useRef, useState } from 'react';
import { MEGA_MENU_DATA, findCategory } from '../../lib/mega-menu-data';
import MegaMenuAllTools from './MegaMenuAllTools';
import MegaMenuCategory from './MegaMenuCategory';
import MegaMenuMore from './MegaMenuMore';

export type MegaMenuVariant = 'all-tools' | 'category' | 'more';

interface Props {
  variant: MegaMenuVariant;
  categoryId?: string;       // for variant='category'
  moreIds?: string[];        // for variant='more'
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (url: string) => void;
}

/**
 * Container for all mega-menu variants. Owns the hover bridge gap,
 * z-index, and pointer-events so the inner variant components stay
 * presentational.
 */
const MegaMenu: React.FC<Props> = ({
  variant,
  categoryId,
  moreIds,
  open,
  onOpenChange,
  onNavigate,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  // Hover-close delay so users can move the cursor into the menu without
  // it closing prematurely.
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => onOpenChange(false), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onOpenChange]);

  const body = (() => {
    if (variant === 'all-tools') return <MegaMenuAllTools onNavigate={onNavigate} />;
    if (variant === 'more')      return <MegaMenuMore categoryIds={moreIds} onNavigate={onNavigate} />;
    const cat = categoryId ? findCategory(categoryId) : undefined;
    if (cat) return <MegaMenuCategory category={cat} onNavigate={onNavigate} />;
    return null;
  })();

  if (!body) return null;

  return (
    <div
      ref={ref}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      className={`pointer-events-auto absolute top-full left-1/2 z-[60] mt-2 -translate-x-1/2 transition-all duration-200 ${
        open
          ? 'opacity-100 translate-y-0 visible'
          : 'opacity-0 -translate-y-2 invisible pointer-events-none'
      }`}
      role="menu"
      aria-label={
        variant === 'all-tools' ? 'All conversion tools'
          : variant === 'more' ? 'More categories'
          : findCategory(categoryId ?? '')?.name ?? 'Menu'
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)]">
        {body}
      </div>
    </div>
  );
};

export default MegaMenu;
export { MEGA_MENU_DATA };