import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Linkedin, Twitter, Facebook, MessageCircle, Send, Mail, Link as LinkIcon } from 'lucide-react';
import { GamificationUser, TierConfig, SharePlatform } from '../../data/gamification';
import { canShare, lastShareTime, rewardFor, buildShareUrl, recordShare } from './shareStore';

interface Props {
  user: GamificationUser;
  cfg: TierConfig;
  conversionPair?: string | null;
  defaultMessage?: string;
}

const PLATFORMS: Array<{
  id: SharePlatform; label: string; Icon: React.ComponentType<{ className?: string }>;
  bg: string; fg: string; ring: string;
}> = [
  { id: 'linkedin',  label: 'LinkedIn',  Icon: Linkedin,     bg: 'bg-[#0A66C2]',  fg: 'text-white', ring: 'ring-[#0A66C2]/30' },
  { id: 'reddit',    label: 'Reddit',    Icon: MessageCircle, bg: 'bg-[#FF4500]', fg: 'text-white', ring: 'ring-[#FF4500]/30' },
  { id: 'twitter',   label: 'Twitter',   Icon: Twitter,      bg: 'bg-black',      fg: 'text-white', ring: 'ring-black/20' },
  { id: 'facebook',  label: 'Facebook',  Icon: Facebook,     bg: 'bg-[#1877F2]',  fg: 'text-white', ring: 'ring-[#1877F2]/30' },
  { id: 'whatsapp',  label: 'WhatsApp',  Icon: MessageCircle, bg: 'bg-[#25D366]', fg: 'text-white', ring: 'ring-[#25D366]/30' },
  { id: 'telegram',  label: 'Telegram',  Icon: Send,         bg: 'bg-[#229ED9]',  fg: 'text-white', ring: 'ring-[#229ED9]/30' },
  { id: 'email',     label: 'Email',     Icon: Mail,         bg: 'bg-slate-700',  fg: 'text-white', ring: 'ring-slate-700/30' },
];

const ShareGrid: React.FC<Props> = ({ user, cfg, conversionPair, defaultMessage }) => {
  const [cooldowns, setCooldowns] = useState<Record<SharePlatform, { ok: boolean; reason?: string; resetAt?: string }>>({} as any);

  useEffect(() => {
    const next: any = {};
    for (const p of PLATFORMS) {
      const r = canShare(user.id, p.id);
      const last = lastShareTime(user.id, p.id);
      next[p.id] = { ok: r.ok, reason: r.reason, resetAt: last };
    }
    setCooldowns(next);
  }, [user.id, user.credits]);

  const onShare = (p: typeof PLATFORMS[number]) => {
    if (!cooldowns[p.id]?.ok) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = conversionPair ? `${origin}/${conversionPair}` : origin;
    const text = defaultMessage ?? `I just converted files on OmniConvert — free, fast, no signup.`;
    const finalUrl = buildShareUrl(p.id, url, text);
    if (p.id === 'email') {
      window.location.href = finalUrl;
    } else {
      window.open(finalUrl, '_blank', 'noopener,noreferrer,width=620,height=540');
    }
    recordShare(user, p.id, url, conversionPair ?? null);
    // refresh cooldown state
    const r = canShare(user.id, p.id);
    const last = lastShareTime(user.id, p.id);
    setCooldowns(prev => ({ ...prev, [p.id]: { ok: r.ok, reason: r.reason, resetAt: last ?? undefined } }));
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {PLATFORMS.map(p => {
        const reward = rewardFor(user, p.id);
        const cd = cooldowns[p.id];
        const disabled = !cd?.ok;
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onShare(p)}
            disabled={disabled}
            whileHover={disabled ? {} : { y: -2 }}
            whileTap={disabled ? {} : { scale: 0.96 }}
            className={`group relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition ${
              disabled
                ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                : `border-slate-200 bg-white hover:border-transparent hover:shadow-lg ${p.ring}`
            }`}
            title={disabled ? `Cooldown — try again later` : `Share on ${p.label} · earn +${reward} cr`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-full transition ${
              disabled ? 'bg-slate-200 text-slate-400' : `${p.bg} ${p.fg}`
            }`}>
              <p.Icon className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider">{p.label}</span>
            <span className={`text-[10px] font-black tabular-nums ${disabled ? 'text-slate-400' : 'text-emerald-700'}`}>
              {disabled ? 'On cooldown' : `+${reward} cr`}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ShareGrid;