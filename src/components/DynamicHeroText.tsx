/* ============================================================================
 * DynamicHeroText — Animates the hero copy based on the picked file.
 *
 * When the user picks a file on the home page, this component swaps into a
 * tool-specific headline (e.g. "PDF to Word Converter"), subheadline, and
 * SEO meta. When no file is picked, it renders the generic "Any Format
 * Converter" message.
 *
 * Side effects:
 *   - Updates <title>
 *   - Updates <meta name="description">
 *   - Updates <meta name="keywords">
 *
 * Animation:
 *   - AnimatePresence wraps a motion.div that fades + slides in from above
 *     on key change. 300ms ease-out.
 *   - aria-live="polite" so screen-readers announce the new copy.
 * ========================================================================== */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getHeroMessage, getHeroMessageKey, type HeroMessage, type HeroMessageKey } from '../data/heroMessages';

interface DynamicHeroTextProps {
  /** Picked file name (drives the message key) */
  fileName: string | null | undefined;
  /** Override: force a key regardless of file name */
  forceKey?: HeroMessageKey;
}

/* The SEO site identity — used for the suffix on document.title */
const SITE_NAME = 'OmniConvert';

/* Static defaults so the SEO meta tags are never empty even before a
   message has been computed (e.g. SSR or first paint). */
const DEFAULT_MESSAGE: HeroMessage = (() => {
  // Re-resolve via the module to keep a single source of truth.
  return getHeroMessage(null);
})();

const MotionMode = { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };
const MotionDuration = 0.28;

const DynamicHeroText: React.FC<DynamicHeroTextProps> = ({ fileName, forceKey }) => {
  const key: HeroMessageKey = forceKey ?? getHeroMessageKey(fileName);
  const message: HeroMessage = key === 'default' ? DEFAULT_MESSAGE : getHeroMessage(fileName ?? '');

  /* Side effects: write SEO meta tags + document.title */
  const wroteRef = useRef<string>('');

  useEffect(() => {
    /* Bail if we just wrote the same key — prevents redundant DOM writes
       when the user re-picks a file with the same extension. */
    if (wroteRef.current === key) return;
    wroteRef.current = key;

    /* document.title */
    const titleFormat = message.label === 'Any Format'
      ? 'Convert Files Online — Free File Converter'
      : `${message.label} Converter — Free Online Conversion`;
    document.title = `${titleFormat} · ${SITE_NAME}`;

    /* <meta name="description"> */
    const desc = `${message.description} Free, browser-based, no signup.`;
    writeMeta('description', desc);

    /* <meta name="keywords"> */
    const kw = `free file converter, online conversion, ${message.label.toLowerCase()}, browser-based, no signup`;
    writeMeta('keywords', kw);

    /* Open Graph + Twitter card — set in index.html statically; we touch them
       only if missing so we don't fight the static defaults on first paint. */
    if (typeof document !== 'undefined') {
      const og = document.querySelector('meta[property="og:title"]');
      if (og) og.setAttribute('content', titleFormat);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);
      const tw = document.querySelector('meta[name="twitter:title"]');
      if (tw) tw.setAttribute('content', titleFormat);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', desc);
    }
  }, [key, message.label, message.description]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="region"
      aria-label="Page heading"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={MotionMode.initial}
          animate={MotionMode.animate}
          exit={MotionMode.exit}
          transition={{ duration: MotionDuration, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-blue-600 dark:text-blue-400">{message.headlineFrom}</span>
            <span className="ml-2 rounded-md bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-blue-600 dark:text-blue-400">
              {message.headlinePill}
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {message.subheadline}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ───── helpers ───── */

/** Update or create a `<meta>` tag by `name`. Idempotent. */
function writeMeta(name: string, content: string): void {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default DynamicHeroText;
