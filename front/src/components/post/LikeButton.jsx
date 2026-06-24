'use client';

import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { formatCount } from '@/utils/format';

export default function LikeButton({
  liked,
  count = 0,
  onClick,
  size = 16,
  withWrapper = false,
  hideZero = false,
  label = 'Aimer',
}) {
  const heart = liked ? <FaHeart size={size} /> : <FaRegHeart size={size} />;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group flex items-center gap-0.5 transition-colors ${liked ? 'text-rose-500' : 'text-[var(--color-text-secondary)] hover:text-rose-500'}`}
    >
      {withWrapper ? (
        <div className="rounded-full p-1.5 transition-colors group-hover:bg-[var(--color-like-hover-bg)] group-active:bg-[var(--color-like-hover-bg)]">
          {heart}
        </div>
      ) : (
        heart
      )}
      {!(hideZero && count === 0) && (
        <span className="text-xs sm:text-sm">{formatCount(count)}</span>
      )}
    </button>
  );
}
