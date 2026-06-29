import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gem, ThumbsUp, Plus, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { getUser, getBalance, getCurrentTierConfig, onGamificationEvent, GamificationUser, claimDailyLogin } from '../../data/gamification';
import GamificationModal from './GamificationModal';

interface Props {
  currentUser?: User | null;
}

const FloatingCreditPill: React.FC<Props> = ({ currentUser }) => {
  const [user, setUser] = useState<GamificationUser | null>(null);
  const [pulse, setPulse] = useState(0);   // bumps on every credit event
  const [open, setOpen] = useState(false);
  const [showClaimToast, setShowClaimToast] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setUser(getUser(currentUser));
  }, [currentUser]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    // Cross-tab + same-tab event subscription
    const off = onGamificationEvent((event, payload) => {
      if (event === 'tx' || event === 'user' || event === 'admin_adjust') {
        refresh();
        setPulse(p => p + 1);
      } else if (event === 'toast') {
        const t = (payload as any)?.description ?? 'Credit earned!';
        setShowClaimToast(t);
        setTimeout(() => setShowClaimToast(null), 2400);
      }
    });
    return () => off();
  }, [refresh]);

  if (!user) return null;
  const cfg = getCurrentTierConfig(currentUser);
  const pct = Math.min(100, Math.round((user.credits / cfg.maxCredits) * 100));

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {showClaimToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2 text-xs font-black text-white shadow-2xl shadow-slate-900/40 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            {showClaimToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating pill */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={false}
        animate={pulse > 0 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/95 px-4 py-2.5 text-xs font-black text-white shadow-2xl shadow-slate-900/40 backdrop-blur hover:bg-slate-800"
        aria-label="Open gamification dashboard"
        data-testid="floating-credit-pill"
      >
        <span className="inline-flex items-center gap-1">
          <Gem className="h-3.5 w-3.5 text-cyan-300" />
          {user.credits}
        </span>
        <span className="h-3 w-px bg-white/20" />
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/70">
          <ThumbsUp className="h-3 w-3" />
          {Math.round((user.totalEarned ?? 0) / 8)}
        </span>
        <span className="ml-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
          <Plus className="h-3.5 w-3.5" />
        </span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <GamificationModal
            currentUser={currentUser}
            onClose={() => setOpen(false)}
            onClaimDaily={() => {
              const r = claimDailyLogin(currentUser);
              if (r.credited) {
                setShowClaimToast(`+${r.amount} daily login · streak day ${r.streak}`);
                setTimeout(() => setShowClaimToast(null), 2400);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCreditPill;