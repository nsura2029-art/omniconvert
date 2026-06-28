import { ArrowRight, DatabaseZap, LockKeyhole, ShieldCheck, TimerReset } from 'lucide-react';

interface SecurityTrustBandProps {
  onOpenSecurity: () => void;
}

const trustPoints = [
  {
    icon: TimerReset,
    label: 'Automatic deletion',
    text: 'Temporary files are removed after processing according to the retention policy.'
  },
  {
    icon: LockKeyhole,
    label: 'Encrypted transfer',
    text: 'Production traffic should use HTTPS/TLS for uploads, downloads, and account sessions.'
  },
  {
    icon: DatabaseZap,
    label: 'No data selling',
    text: 'OmniConvert does not sell customer file data or mine uploads for advertising.'
  }
];

export default function SecurityTrustBand({ onOpenSecurity }: SecurityTrustBandProps) {
  return (
    <section
      className="glass-card border border-sky-200/80 dark:border-sky-500/15 rounded-3xl p-5 sm:p-6 shadow-sm"
      aria-labelledby="home-security-title"
    >
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.45fr_auto] lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Data Security
          </div>
          <h2 id="home-security-title" className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
            Built for private file conversion
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Files are processed for the conversion job you request, then removed according to the retention policy.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {trustPoints.map(point => {
            const Icon = point.icon;
            return (
              <div key={point.label} className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <Icon className="mb-3 h-4 w-4 text-sky-600 dark:text-sky-300" />
                <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">{point.label}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">{point.text}</p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenSecurity}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-xs font-black text-sky-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 dark:border-sky-500/20 dark:bg-white/[0.04] dark:text-sky-200 dark:hover:bg-sky-500/10"
        >
          Security & Compliance
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
