/* ============================================================================
 * OmniConvert Design System — React primitives
 *
 * Built on tokens.css. Every prop and class reads from --color-* / --space-*
 * so a single theme change here cascades everywhere.
 *
 * Exports:
 *   <Eyebrow />          tracked uppercase label, often above a heading
 *   <Section />          vertical rhythm container with optional mesh bg
 *   <Surface />          generic card / panel with optional hover lift
 *   <Pill />             small inline chip / badge / tag
 *   <Stack />            vertical or horizontal flex with token-scale gaps
 *   <Button />           primary / secondary / ghost; size sm/md/lg
 *   <HeadingDisplay />   fluid hero h1
 *
 * Keep the API minimal — these are not a component library, they're a
 * shape contract. New variants go in component-local code, not here.
 * ========================================================================== */

import React, { forwardRef } from 'react';

/* ────────────────────────────────────────────────────────────────────────── */
/*  Eyebrow                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */
export type EyebrowTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: EyebrowTone;
  icon?: React.ReactNode;
}
const eyebrowToneClass: Record<EyebrowTone, string> = {
  neutral: 'text-fg-secondary',
  accent:  'text-fg-link',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
};
export const Eyebrow: React.FC<EyebrowProps> = ({
  tone = 'neutral', icon, className = '', children, ...rest
}) => (
  <span
    className={`ds-eyebrow inline-flex items-center gap-1.5 ${eyebrowToneClass[tone]} ${className}`}
    {...rest}
  >
    {icon}
    {children}
  </span>
);

/* ────────────────────────────────────────────────────────────────────────── */
/*  Section — vertical rhythm + optional mesh bg                             */
/* ────────────────────────────────────────────────────────────────────────── */
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Narrow = tighter padding, for in-page panels (vs page-level hero). */
  spacing?: 'page' | 'narrow';
  /** Whether to overlay the warm mesh gradient on top of the canvas. */
  mesh?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}
export const Section: React.FC<SectionProps> = ({
  spacing = 'page', mesh = false, as: As = 'section',
  className = '', children, ...rest
}) => {
  const cls = [
    spacing === 'page' ? 'ds-section' : 'ds-section-narrow',
    mesh ? 'ds-bg-mesh' : '',
    className,
  ].filter(Boolean).join(' ');
  return <As className={cls} {...rest}>{children}</As>;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Surface — card / panel wrapper with optional hover                       */
/* ────────────────────────────────────────────────────────────────────────── */
interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover lift + shadow. Use for clickable cards. */
  interactive?: boolean;
  /** Removes default padding — let the consumer add it. */
  flush?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}
export const Surface: React.FC<SurfaceProps> = ({
  interactive = false, flush = false, as: As = 'div',
  className = '', children, ...rest
}) => {
  const cls = [
    'ds-card',
    interactive ? 'cursor-pointer hover:ds-card-hover ds-focus-ring' : '',
    flush ? '' : 'p-5 md:p-6',
    className,
  ].filter(Boolean).join(' ');
  return (
    <As
      className={cls}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...rest}
    >
      {children}
    </As>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Pill — small inline chip / badge                                          */
/* ────────────────────────────────────────────────────────────────────────── */
export type PillTone =
  | 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
  icon?: React.ReactNode;
}
const pillCls: Record<PillTone, string> = {
  neutral: 'bg-surface-2 text-fg-secondary border-border',
  accent:  'bg-accent-soft text-fg-link border-border-accent',
  success: 'bg-success-soft text-success border-border',
  warning: 'bg-warning-soft text-warning border-border',
  danger:  'bg-danger-soft text-danger border-border',
};
export const Pill: React.FC<PillProps> = ({
  tone = 'neutral', icon, className = '', children, ...rest
}) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md',
      'text-2xs font-semibold border',
      'whitespace-nowrap',
      pillCls[tone],
      className,
    ].join(' ')}
    {...rest}
  >
    {icon}
    {children}
  </span>
);

/* ────────────────────────────────────────────────────────────────────────── */
/*  Stack — vertical or horizontal with token-scale gaps                      */
/* ────────────────────────────────────────────────────────────────────────── */
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}
const alignClass = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' };
const justifyClass = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly' };
const gapClass = { 0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12' };
export const Stack: React.FC<StackProps> = ({
  direction = 'col', gap = 3, align, justify, wrap = false,
  className = '', children, ...rest
}) => {
  const cls = [
    'flex',
    direction === 'row' ? 'flex-row' : 'flex-col',
    gapClass[gap],
    align ? alignClass[align] : '',
    justify ? justifyClass[justify] : '',
    wrap ? 'flex-wrap' : '',
    className,
  ].filter(Boolean).join(' ');
  return <div className={cls} {...rest}>{children}</div>;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Button — token-driven, three variants, three sizes                       */
/* ────────────────────────────────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

const variantCls: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg border border-accent ' +
    'hover:bg-accent-hover hover:border-accent-hover ' +
    'shadow-sm',
  secondary:
    'bg-surface text-fg-primary border border-border ' +
    'hover:bg-surface-2 hover:border-border-strong',
  ghost:
    'bg-transparent text-fg-secondary border border-transparent ' +
    'hover:bg-surface-2 hover:text-fg-primary',
};
const sizeCls: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'md', iconLeft, iconRight, loading = false,
      className = '', disabled, children, ...rest },
    ref
  ) {
    const cls = [
      'inline-flex items-center justify-center rounded-md font-semibold',
      'transition-all duration-normal ease-out-quint',
      'ds-focus-ring',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantCls[variant],
      sizeCls[size],
      className,
    ].join(' ');
    return (
      <button ref={ref} className={cls} disabled={disabled || loading} {...rest}>
        {loading ? <span aria-hidden className="animate-spin">⏳</span> : iconLeft}
        <span>{children}</span>
        {iconRight}
      </button>
    );
  }
);

/* ────────────────────────────────────────────────────────────────────────── */
/*  HeadingDisplay — fluid hero h1, family.co style                          */
/* ────────────────────────────────────────────────────────────────────────── */
interface HeadingDisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2';
  accent?: string; // wrap this substring in <span> for emphasis
}
export const HeadingDisplay: React.FC<HeadingDisplayProps> = ({
  as: As = 'h1', accent, className = '', children, ...rest
}) => {
  const text = typeof children === 'string' ? children : '';
  if (!accent || !text.includes(accent)) {
    return (
      <As className={`ds-heading-display ${className}`} {...rest}>
        {children}
      </As>
    );
  }
  const [before, after] = text.split(accent);
  return (
    <As className={`ds-heading-display ${className}`} {...rest}>
      {before}
      <span className="text-fg-link">{accent}</span>
      {after}
    </As>
  );
};
