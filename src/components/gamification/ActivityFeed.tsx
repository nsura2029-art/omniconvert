import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { User } from '../../types';
import { CreditTransaction, getHistory, onGamificationEvent } from '../../data/gamification';

interface Props {
  userId: string;
  currentUser?: User | null;
  filter?: 'all' | 'earn' | 'spend';
}

const colorFor = (amount: number): string => amount > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50';

const ActivityFeed: React.FC<Props> = ({ userId, currentUser, filter = 'all' }) => {
  const [items, setItems] = useState<CreditTransaction[]>(getHistory(50, currentUser));

  useEffect(() => {
    const refresh = () => setItems(getHistory(50, currentUser));
    refresh();
    const id = setInterval(refresh, 2000);
    const off = onGamificationEvent((event) => { if (event === 'tx' || event === 'reset' || event === 'admin_adjust') refresh(); });
    return () => { clearInterval(id); off(); };
  }, [currentUser]);

  const filtered = items.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'earn') return t.amount > 0;
    if (filter === 'spend') return t.amount < 0;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <Activity className="mx-auto h-7 w-7 text-slate-300" />
        <p className="mt-2 text-xs font-bold text-slate-500">No activity yet</p>
        <p className="mt-1 text-[11px] text-slate-400">Convert a file, upvote a pair, or share to start your feed.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <ul className="divide-y divide-slate-100">
        <AnimatePresence initial={false}>
          {filtered.slice(0, 25).map(t => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 240 }}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${colorFor(t.amount)}`}>
                {t.amount > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[11px] font-black text-slate-800">{t.description ?? t.type.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleString()}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums ${colorFor(t.amount)}`}>
                {t.amount > 0 ? '+' : ''}{t.amount}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default ActivityFeed;