'use client';

import { FaRegComment } from 'react-icons/fa';
import LikeButton from './LikeButton';
import { formatCount } from '@/utils/format';

export default function PostActions({
  commentCount,
  liked,
  likeCount,
  onComment,
  onLike,
}) {
  return (
    <div className="flex items-center gap-4 text-[var(--color-text-secondary)] mt-2">
      <button
        onClick={onComment}
        className="group flex items-center gap-0.5 transition-colors hover:text-[var(--color-text-title)]"
        aria-label="Commenter"
      >
        <div className="rounded-full p-1.5 transition-colors group-hover:bg-[var(--color-like-hover-bg)] group-active:bg-[var(--color-like-hover-bg)]">
          <FaRegComment size={16} />
        </div>
        <span className="text-xs sm:text-sm">{formatCount(commentCount)}</span>
      </button>

      <LikeButton
        liked={liked}
        count={likeCount}
        onClick={onLike}
        size={16}
        withWrapper
        label="Aimer"
      />
    </div>
  );
}
