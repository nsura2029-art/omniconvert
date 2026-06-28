import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Cloud,
  Database,
  FileText,
  KeyRound,
  LockKeyhole,
  Network,
  Search,
  Server,
  ShieldCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useId } from 'react';

interface SecurityPageProps {
  onBackToTools: () => void;
}

interface SecurityRow {
  title: string;
  text: string;
  icon: LucideIcon;
  certified?: {
    className: 'storage' | 'privacy' | 'compliance';
    stamp: string;
    label: string;
  };
}

const securityRows: SecurityRow[] = [
  {
    title: 'Storage',
    text: 'Production files should be retained only as long as needed for conversion, download, and recovery. Exact deletion windows should be published before launch.',
    icon: Database,
    certified: {
      className: 'storage',
      stamp: 'APPROVED',
      label: 'Approved storage'
    }
  },
  {
    title: 'Isolation',
    text: 'Conversion jobs should be scoped by user or session so source files, outputs, logs, and result links do not leak between customers.',
    icon: Server
  },
  {
    title: 'Transfer',
    text: 'Uploads, downloads, OAuth callbacks, and dashboard sessions should use HTTPS/TLS. Storage paths should never become the public security boundary.',
    icon: Network
  },
  {
    title: 'Privacy',
    text: 'OmniConvert should not sell, lease, or mine uploaded files. Privacy policy, subprocessors, GDPR request handling, and DPA support should be ready for business users.',
    icon: ShieldCheck,
    certified: {
      className: 'privacy',
      stamp: 'APPROVED',
      label: 'Approved privacy'
    }
  },
  {
    title: 'Access Control',
    text: 'Business accounts should use scoped permissions, OAuth-based cloud access, and reviewable activity logs before team or enterprise rollout.',
    icon: KeyRound
  },
  {
    title: 'Compliance',
    text: 'ISO 27001 and SOC 2 should remain roadmap items until independent audits are complete. The page should explain what is real now and what is planned next.',
    icon: CheckCircle2,
    certified: {
      className: 'compliance',
      stamp: 'APPROVED',
      label: 'Approved compliance'
    }
  }
];

function RubberStamp({ label }: { text: string; label: string }) {
  const stampId = useId().replace(/:/g, '');
  const topPathId = `${stampId}-quality`;
  const bottomPathId = `${stampId}-control`;

  return (
    <span className="security-rubber-stamp" aria-label={label}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id={topPathId} d="M 22 50 A 28 28 0 0 1 78 50" />
          <path id={bottomPathId} d="M 22 58 A 28 28 0 0 0 78 58" />
        </defs>
        <circle className="security-stamp-ring" cx="50" cy="50" r="42" />
        <circle className="security-stamp-inner" cx="50" cy="50" r="30" />
        <text className="security-stamp-arc">
          <textPath href={`#${topPathId}`} startOffset="50%" textAnchor="middle">
            QUALITY
          </textPath>
        </text>
        <text className="security-stamp-arc security-stamp-arc-bottom">
          <textPath href={`#${bottomPathId}`} startOffset="50%" textAnchor="middle">
            CONTROL
          </textPath>
        </text>
        <rect className="security-stamp-band" x="14" y="39" width="72" height="22" rx="2" />
        <line className="security-stamp-band-line" x1="12" y1="36" x2="88" y2="36" />
        <line className="security-stamp-band-line" x1="12" y1="64" x2="88" y2="64" />
        <text className="security-stamp-center" x="50" y="55" textAnchor="middle">APPROVED</text>
      </svg>
    </span>
  );
}

function HeroOrbital() {
  return (
    <div className="security-orbital" aria-hidden="true">
      <div className="security-file-stack">
        <div className="security-file security-file-one">
          <FileText className="h-5 w-5 text-blue-600" />
          <span />
          <span className="w-2/3" />
          <span className="w-4/5" />
        </div>
        <div className="security-file security-file-two">
          <FileText className="h-5 w-5 text-teal-600" />
          <span className="w-4/5" />
          <span />
          <span className="w-3/5" />
        </div>
        <div className="security-agent">
          <Bot className="h-5 w-5" />
        </div>
        <div className="security-search-lens">
          <Search className="h-7 w-7" />
        </div>
      </div>
      <div className="security-chip security-chip-one">TLS transfer</div>
      <div className="security-chip security-chip-two">Job isolation</div>
      <div className="security-chip security-chip-three">No data selling</div>
      <div className="security-chip security-chip-four">Retention policy</div>
    </div>
  );
}

export default function SecurityPage({ onBackToTools }: SecurityPageProps) {
  return (
    <div className="security-page animate-fade-in" id="security-page">
      <style>{`
        .security-page {
          color: #101114;
        }

        .security-orbital {
          min-height: 260px;
          border-radius: 24px;
          border: 1px solid rgba(16, 17, 20, 0.08);
          background:
            radial-gradient(circle at 50% 38%, rgba(37, 99, 235, 0.12), transparent 11rem),
            linear-gradient(145deg, rgba(223, 246, 255, 0.95), rgba(255, 255, 255, 0.9) 48%, rgba(232, 248, 237, 0.96));
          position: relative;
          overflow: hidden;
          box-shadow: 0 30px 90px rgba(37, 99, 235, 0.11);
          animation: securityPanelFloat 9s ease-in-out infinite;
        }

        .security-file-stack {
          position: absolute;
          inset: 50%;
          width: min(250px, 76%);
          height: 170px;
          transform: translate(-50%, -50%);
        }

        .security-file {
          position: absolute;
          width: 178px;
          min-height: 116px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.12);
          padding: 14px;
          display: grid;
          gap: 8px;
        }

        .security-file span {
          display: block;
          height: 7px;
          border-radius: 999px;
          background: #dbeafe;
        }

        .security-file-one {
          left: 0;
          top: 18px;
          transform: rotate(-5deg);
        }

        .security-file-two {
          right: 0;
          bottom: 12px;
          transform: rotate(5deg);
        }

        .security-file-two span {
          background: #ccfbf1;
        }

        .security-agent {
          position: absolute;
          left: 36px;
          bottom: 8px;
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 16px;
          background: #ffffff;
          color: #2563eb;
          border: 1px solid rgba(37, 99, 235, 0.16);
          box-shadow: 0 18px 40px rgba(37, 99, 235, 0.12);
          animation: securityAgentNod 4.8s ease-in-out infinite;
        }

        .security-search-lens {
          position: absolute;
          right: 40px;
          top: 22px;
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          color: #2563eb;
          border: 2px solid rgba(37, 99, 235, 0.22);
          box-shadow: 0 22px 50px rgba(37, 99, 235, 0.16);
          animation: securitySearchSweep 5.8s ease-in-out infinite;
        }

        .security-chip {
          position: absolute;
          border: 1px solid rgba(16, 17, 20, 0.1);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          padding: 8px 11px;
          color: #374151;
          font-size: 11px;
          font-weight: 900;
          box-shadow: 0 16px 35px rgba(16, 17, 20, 0.08);
          animation: securityChipFloat 6s ease-in-out infinite;
        }

        .security-chip-one { top: 20px; left: 20px; }
        .security-chip-two { top: 58px; right: 18px; animation-delay: -1.5s; }
        .security-chip-three { bottom: 28px; left: 24px; animation-delay: -3s; }
        .security-chip-four { bottom: 18px; right: 26px; animation-delay: -4.5s; }

        .security-row {
          position: relative;
          overflow: hidden;
        }

        .security-row-copy {
          position: relative;
        }

        .security-scan-line {
          position: absolute;
          left: 0;
          top: -28px;
          bottom: -28px;
          width: 2px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(13, 148, 136, 0), rgba(13, 148, 136, 0.92), rgba(13, 148, 136, 0));
          opacity: 0;
          box-shadow: 0 0 18px rgba(13, 148, 136, 0.28);
        }

        .security-rubber-stamp {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 104px;
          height: 104px;
          border-radius: 999px;
          color: #0d9488;
          background: rgba(255, 255, 255, 0.92);
          opacity: 0;
          transform: translate(-50%, -50%) rotate(-11deg) scale(1.34);
          box-shadow: 0 18px 36px rgba(13, 148, 136, 0.14);
          pointer-events: none;
        }

        .security-rubber-stamp svg {
          display: block;
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 0 rgba(37, 99, 235, 0.08));
        }

        .security-stamp-ring,
        .security-stamp-inner {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-dasharray: 2 3;
        }

        .security-stamp-inner {
          stroke-width: 2;
          opacity: 0.72;
        }

        .security-stamp-arc,
        .security-stamp-center {
          fill: currentColor;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }

        .security-stamp-arc { font-size: 8px; }
        .security-stamp-arc-bottom { font-size: 8px; }
        .security-stamp-center {
          fill: white;
          font-size: 10px;
          letter-spacing: 0.04em;
        }
        .security-stamp-band {
          fill: currentColor;
        }
        .security-stamp-band-line {
          stroke: currentColor;
          stroke-width: 3;
        }

        .security-row.cert-row .security-scan-line {
          animation: securityScanText 2.2s ease-in-out forwards;
        }

        .security-row.cert-row .security-rubber-stamp {
          animation: securityStampHit 0.62s cubic-bezier(.16, 1.1, .32, 1) forwards;
          animation-delay: 2.15s;
        }

        .security-row.privacy .security-scan-line { animation-delay: 2.8s; }
        .security-row.privacy .security-rubber-stamp { animation-delay: 4.95s; }
        .security-row.compliance .security-scan-line { animation-delay: 5.6s; }
        .security-row.compliance .security-rubber-stamp { animation-delay: 7.75s; }

        @keyframes securityPanelFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes securityAgentNod {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }

        @keyframes securitySearchSweep {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          32% { transform: translate3d(-94px, 56px, 0) scale(0.96); }
          64% { transform: translate3d(-32px, 92px, 0) scale(1.02); }
        }

        @keyframes securityChipFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }

        @keyframes securityScanText {
          0%, 100% { opacity: 0; left: 0; }
          6% { opacity: 1; left: 0; }
          28% { opacity: 1; left: calc(100% - 2px); }
          50% { opacity: 1; left: 0; }
          72% { opacity: 1; left: calc(100% - 2px); }
          94% { opacity: 1; left: 0; }
        }

        @keyframes securityStampHit {
          0% { opacity: 0; transform: translate(-50%, -68%) rotate(-11deg) scale(1.34); }
          48% { opacity: 1; transform: translate(-50%, -50%) rotate(-11deg) scale(0.9); }
          72%, 100% { opacity: 1; transform: translate(-50%, -50%) rotate(-11deg) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .security-orbital,
          .security-agent,
          .security-search-lens,
          .security-chip,
          .security-scan-line,
          .security-rubber-stamp {
            animation: none;
          }

          .security-rubber-stamp {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(-11deg) scale(1);
          }
        }

        @media (max-width: 640px) {
          .security-orbital { min-height: 250px; }
          .security-chip { font-size: 11px; }
          .security-rubber-stamp {
            left: 52%;
            top: 56%;
            width: 92px;
            height: 92px;
          }
        }
      `}</style>

      <nav className="sticky top-20 z-20 mb-4 flex items-center justify-start gap-2 bg-slate-50/85 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 backdrop-blur dark:bg-slate-900/85 dark:text-zinc-400">
        <button type="button" onClick={onBackToTools} className="inline-flex items-center gap-1 transition-colors hover:text-blue-700 dark:hover:text-blue-200">
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </button>
        <span>/</span>
        <span className="text-zinc-800 dark:text-zinc-200">Security & Compliance</span>
      </nav>

      <section className="grid items-center gap-6 border-b border-zinc-200/80 pb-8 pt-1 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div>
          <div className="mb-3 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">
            Designed for trust
          </div>
          <h1 className="max-w-4xl text-2xl font-extrabold leading-tight tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
            Files in. Files out. Nothing extra.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            A simple security promise for file conversion: process the job you asked for, protect the transfer, remove temporary files, and keep the business model away from customer data.
          </p>
        </div>

        <HeroOrbital />
      </section>

      <section className="grid gap-6 border-b border-zinc-200/80 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-3 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">
            Security model
          </div>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-zinc-950 dark:text-white">
            Simple checks. Clear proof.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Each point is written like a security page, not a landing page. The animation scans the real proof text, stamps it, then leaves the certified state visible.
          </p>
        </div>

        <div className="border-t border-zinc-200/80 dark:border-white/10">
          {securityRows.map(row => {
            const Icon = row.icon;
            const certifiedClass = row.certified?.className ?? '';

            return (
              <article
                key={row.title}
                className={`security-row grid gap-4 border-b border-zinc-200/80 py-7 dark:border-white/10 sm:grid-cols-[44px_150px_minmax(0,1fr)] sm:gap-6 ${row.certified ? `cert-row ${certifiedClass}` : ''}`}
              >
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-2xl border border-blue-600/20 text-blue-600 dark:border-blue-300/20 dark:text-blue-300">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-extrabold leading-tight text-zinc-950 dark:text-white">
                  {row.title}
                </h3>
                <div className="security-row-copy">
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {row.text}
                  </p>
                  {row.certified && (
                    <>
                      <span className="security-scan-line" aria-hidden="true" />
                      <RubberStamp text={row.certified.stamp} label={row.certified.label} />
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 py-8 lg:grid-cols-2 lg:items-center">
        <div className="border-l-4 border-blue-600 pl-6 text-lg font-extrabold leading-tight tracking-tight text-zinc-950 dark:text-white">
          A security page should make users calmer, not make the product look louder.
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>
            OmniConvert is currently a sandbox prototype. Production retention windows, DPAs, infrastructure controls, and independent audit evidence should be finalized before enterprise deployment.
          </p>
          <p>
            Cloud integrations should use scoped OAuth permissions for services like Google Drive, Dropbox, and OneDrive. Users should be able to disconnect providers and choose where converted files are saved.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:border-blue-300/20 dark:bg-blue-300/10 dark:text-blue-200">
              <LockKeyhole className="h-3.5 w-3.5" />
              TLS required
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-teal-700 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-200">
              <Cloud className="h-3.5 w-3.5" />
              Scoped cloud access
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
