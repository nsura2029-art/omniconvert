import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Sparkles, Crown, Calculator, HelpCircle, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { TIER_TABLE, Tier, tierLabel, tierColor, computeConversionCost } from '../data/gamification';
import { Link } from './stubRouter';

interface Props {
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onUpgradePlan?: (plan: 'free' | 'pro' | 'enterprise') => void;
}

const Pricing: React.FC<Props> = ({ currentUser, onOpenAuth, onUpgradePlan }) => {
  const [fileCount, setFileCount] = useState(3);
  const [sizeMB, setSizeMB] = useState(8);
  const [premium, setPremium] = useState(false);

  const tierOrder: Tier[] = ['anonymous', 'registered', 'paid'];
  const costAnonym = computeConversionCost({ toolCategory: 'Documents', inputFormat: 'PDF', totalSizeMB: sizeMB, fileCount, premiumFormat: premium });
  const costReg = computeConversionCost({ toolCategory: 'Documents', inputFormat: 'PDF', totalSizeMB: sizeMB, fileCount, premiumFormat: premium }, { id: 'demo', email: 'demo@x.com' } as any);
  const costPaid = computeConversionCost({ toolCategory: 'Documents', inputFormat: 'PDF', totalSizeMB: sizeMB, fileCount, premiumFormat: premium }, { id: 'demo', email: 'demo@x.com', plan: 'pro' } as any);

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
          <Sparkles className="h-3 w-3" /> Pricing & credits
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Pick a tier. Earn as you go.</h1>
        <p className="mt-3 text-base font-semibold text-slate-600">
          Start free as a guest. Sign up for more daily conversions. Go Pro for unlimited batch + priority queue + premium formats.
        </p>
      </header>

      {/* Tier cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {tierOrder.map(t => {
          const cfg = TIER_TABLE[t];
          const isCurrent = (t === 'registered' && currentUser) || (t === 'paid' && currentUser?.plan === 'pro');
          const isPro = t === 'paid';
          return (
            <motion.div
              key={t}
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm ${
                isPro ? 'border-violet-300 ring-2 ring-violet-100' : 'border-slate-200'
              }`}
            >
              {isPro && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  <Crown className="h-3 w-3" /> Recommended
                </span>
              )}
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${tierColor(t)}`}>
                {tierLabel(t)}
              </span>
              <p className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                {t === 'paid' ? '$9' : t === 'registered' ? '$0' : '$0'}
                <span className="ml-1 text-sm font-bold text-slate-500">/mo</span>
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">
                {cfg.startingCredits} starting credits · max {cfg.maxCredits.toLocaleString()}
              </p>
              <ul className="mt-4 space-y-2 text-[12px] font-bold text-slate-700">
                <Feature ok={true}>{cfg.dailyConversions === 9999 ? 'Unlimited' : cfg.dailyConversions} conversions / day</Feature>
                <Feature ok={true}>Batch up to {cfg.batchSize === 9999 ? 'unlimited' : cfg.batchSize} files</Feature>
                <Feature ok={true}>{cfg.maxFileSizeMB} MB max file size</Feature>
                <Feature ok={cfg.premiumFormats}>Premium formats</Feature>
                <Feature ok={cfg.priorityQueue}>Priority queue</Feature>
                <Feature ok={true}>{cfg.historyRetentionDays === 9999 ? 'Unlimited' : cfg.historyRetentionDays + 'd'} history retention</Feature>
                <Feature ok={true}>Daily login: +{cfg.dailyLogin}</Feature>
                <Feature ok={true}>Upvote reward: +{cfg.rewards.upvote}</Feature>
              </ul>
              <button
                type="button"
                onClick={() => {
                  if (t === 'anonymous') return;
                  if (!currentUser) onOpenAuth?.();
                  else onUpgradePlan?.(t === 'paid' ? 'pro' : 'free');
                }}
                disabled={isCurrent || t === 'anonymous'}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black transition active:scale-[0.98] ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : isPro
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md hover:from-violet-600 hover:to-purple-700'
                      : 'bg-slate-900 text-white hover:bg-slate-700'
                }`}
              >
                {isCurrent ? 'Your tier' : t === 'anonymous' ? 'Default' : t === 'registered' ? 'Sign up free' : 'Upgrade to Pro · Phase 2'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Credit cost calculator */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-900">Credit cost calculator</h2>
        </div>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">
          How many credits will your conversion cost? Live across all 3 tiers.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Slider label={`Files: ${fileCount}`} min={1} max={50} value={fileCount} onChange={setFileCount} />
            <Slider label={`Size: ${sizeMB} MB`} min={1} max={500} value={sizeMB} onChange={setSizeMB} />
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <input type="checkbox" checked={premium} onChange={e => setPremium(e.target.checked)} className="rounded" />
              Premium format (×2 cost)
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <CostCell label={tierLabel('anonymous')} value={costAnonym} accent="text-slate-700" />
            <CostCell label={tierLabel('registered')} value={costReg} accent="text-blue-700" />
            <CostCell label={tierLabel('paid')} value={costPaid} accent="text-violet-700" />
          </div>
        </div>
      </section>

      {/* Earn credits */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6">
        <h2 className="text-lg font-black text-slate-900">Earn credits, not just spend them</h2>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">
          Every tier gets rewarded for engagement. Sign-up bonus is one-time; the rest stack every day.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: 'Daily login',  v: '2 / 5 / 10' },
            { label: 'Upvote',       v: '1 / 2 / 5' },
            { label: 'LinkedIn',     v: '3 / 5 / 10' },
            { label: 'Reddit',       v: '3 / 5 / 10' },
            { label: 'Twitter',      v: '2 / 3 / 5' },
            { label: 'Facebook',     v: '2 / 3 / 5' },
            { label: 'WhatsApp',     v: '1 / 2 / 3' },
            { label: 'Telegram',     v: '1 / 2 / 3' },
          ].map(r => (
            <div key={r.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{r.label}</p>
              <p className="mt-0.5 text-base font-black tabular-nums text-slate-900">{r.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-bold text-slate-500">Format: anonymous / registered / paid reward.</p>
      </section>

      {/* FAQ */}
      <Faq />
    </div>
  );
};

const Feature: React.FC<{ ok: boolean; children: React.ReactNode }> = ({ ok, children }) => (
  <li className="flex items-start gap-2">
    {ok
      ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      : <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
    <span className={ok ? '' : 'text-slate-400 line-through'}>{children}</span>
  </li>
);

const Slider: React.FC<{ label: string; min: number; max: number; value: number; onChange: (v: number) => void }> = ({ label, min, max, value, onChange }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <input
      type="range"
      min={min} max={max} value={value}
      onChange={e => onChange(parseInt(e.target.value))}
      className="mt-1 w-full"
    />
  </div>
);

const CostCell: React.FC<{ label: string; value: number; accent: string }> = ({ label, value, accent }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-1 text-2xl font-black tabular-nums ${accent}`}>{value} cr</p>
  </div>
);

const FAQS = [
  { q: 'Do credits expire?', a: 'Free tier credits roll over up to your cap (20 for guests, 100 for registered). Pro credits do not expire while your subscription is active.' },
  { q: 'Can I get a refund?', a: 'If a conversion fails after the credit was spent, it is auto-refunded within 30 seconds with the original reason in your activity feed.' },
  { q: 'Can I transfer credits?', a: 'No. Credits are tied to your session/user and cannot be transferred. You can, however, earn bonus credits by referring friends.' },
  { q: 'What counts as anti-gaming?', a: 'Same-IP multi-account, share-spam, vote-rings, and bot-pattern activity. The admin dashboard surfaces suspicious patterns for review.' },
  { q: 'When does Stripe arrive?', a: 'Phase 2 lands after Cloudflare account access is provisioned (D1 + Workers + Stripe). Until then, Pro is shown as "Coming soon" and credits are earned via gamification only.' },
];

const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-black text-slate-900">Frequently asked</h2>
      </div>
      <div className="mt-4 divide-y divide-slate-100">
        {FAQS.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-3 py-3 text-left"
          >
            <span className="text-sm font-black text-slate-800">{f.q}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
        ) as unknown as any)}
        {FAQS.map((f, i) => open === i && (
          <p key={`a-${i}`} className="py-2 text-sm font-semibold text-slate-600">{f.a}</p>
        ))}
      </div>
    </section>
  );
};

export default Pricing;