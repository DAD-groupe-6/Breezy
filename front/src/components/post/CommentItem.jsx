'use client';

import { FiTrash2 } from 'react-icons/fi';
import LikeButton from './LikeButton';

export default function CommentItem({ comment, onDelete, onLike }) {
  return (
    <div className="rounded-lg border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-surface)] px-3 py-2">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-text-primary)]">{comment.displayName}</span>
          <span className="text-[var(--color-text-secondary)]">@{comment.username}</span>
          <span className="text-[var(--color-text-secondary)]">{comment.timestamp}</span>
        </div>
        {comment.canDelete && (
          <button
            type="button"
            onClick={() => onDelete?.(comment.id)}
            className="shrink-0 text-[var(--color-text-secondary)] transition-colors hover:text-rose-500"
            aria-label="Supprimer le commentaire"
          >
            <FiTrash2 size={13} />
          </button>
        )}
      </div>
      <p className="text-sm text-[var(--color-text-primary)]">{comment.content}</p>
      <div className="mt-1.5">
        <LikeButton
          liked={comment.liked}
          count={comment.likesCount}
          onClick={() => onLike?.(comment.id)}
          size={12}
          hideZero
          label="Aimer le commentaire"
        />
      </div>
    </div>
  );
}
