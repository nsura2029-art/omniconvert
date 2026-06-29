import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp } from 'lucide-react';
import { GamificationUser } from '../../data/gamification';
import { castUpvote, getUpvoteCount, hasUserUpvoted, CastUpvoteResult } from './upvoteStore';

interface Props {
  category: string;
  source: string;
  target: string;
  currentUser: GamificationUser;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const UpvoteButton: React.FC<Props> = ({ category, source, target, currentUser, size = 'md', showLabel = false }) => {
  const [count, setCount] = useState(getUpvoteCount(category, source, target));
  const [upvoted, setUpvoted] = useState(hasUserUpvoted(currentUser.id, category, source, target));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCount(getUpvoteCount(category, source, target));
    setUpvoted(hasUserUpvoted(currentUser.id, category, source, target));
  }, [category, source, target, currentUser.id]);

  const handleClick = () => {
    if (busy || upvoted) return;
    setBusy(true);
    const r: CastUpvoteResult = castUpvote(currentUser, category, source, target);
    setBusy(false);
    if (r.ok) {
      setCount(r.count ?? count + 1);
      setUpvoted(true);
    }
  };

  const pad = size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs';

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={upvoted || busy}
      whileTap={{ scale: 0.92 }}
      className={`inline-flex items-center gap-1.5 rounded-lg border font-black transition ${
        upvoted
          ? 'border-blue-300 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
      } ${pad}`}
      title={upvoted ? `You upvoted this (+${count - 1})` : 'Upvote — earn credits'}
    >
      <motion.span
        key={String(upvoted)}
        initial={{ rotate: 0, scale: 1 }}
        animate={{ rotate: upvoted ? [0, -15, 12, -8, 0] : 0, scale: upvoted ? 1.18 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <ThumbsUp className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </motion.span>
      <span className="tabular-nums">{count}</span>
      {showLabel && <span className="hidden sm:inline">{upvoted ? 'Upvoted' : 'Upvote'}</span>}
    </motion.button>
  );
};

export default UpvoteButton;