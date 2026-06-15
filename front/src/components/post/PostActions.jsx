'use client';

import { FaRegComment, FaRetweet } from 'react-icons/fa';
import LikeButton from './LikeButton';
import { formatCount } from '@/utils/format';

export default function PostActions({
  commentCount,
  replies,
  liked,
  likeCount,
  onComment,
  onReply,
  onLike,
}) {
  return (
    <div className="flex items-center gap-4 text-[var(--color-text-secondary)] mt-2">
      <button
        onClick={onComment}
        className="group flex items-center gap-0.5 transition-colors hover:text-[var(--color-text-title)]"
        aria-label="Commenter"
      >
        <div className="group-hover:bg-[var(--color-bg-surface-2)] rounded-full p-1.5 transition-colors">
          <FaRegComment size={16} />
        </div>
        <span className="text-xs sm:text-sm">{formatCount(commentCount)}</span>
      </button>

      <button
        onClick={onReply}
        className="flex items-center gap-0.5 group hover:text-[var(--color-text-title)] transition-colors"
        aria-label="Reposter"
      >
        <div className="group-hover:bg-[var(--color-bg-surface-2)] rounded-full p-1.5 transition-colors">
          <FaRetweet size={17} />
        </div>
        <span className="text-xs sm:text-sm">{formatCount(replies)}</span>
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
