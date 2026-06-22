'use client';

import { useTranslation } from '@/hooks/useTranslation';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import LoadMoreButton from './LoadMoreButton';

export default function CommentSection({
  comments = [],
  hasMore = false,
  onLoadMore,
  onAddComment,
  onDelete,
  onLike,
}) {
  const { t } = useTranslation();

  return (
    <section
      className="mt-3 rounded-xl border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-primary)]/35 p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <CommentForm onSubmit={onAddComment} />

      <div className="space-y-2">
        {comments.length === 0 && (
          <p className="text-xs text-[var(--color-text-secondary)]">{t('comments.empty')}</p>
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onDelete={onDelete}
            onLike={onLike}
          />
        ))}

        {hasMore && <LoadMoreButton onClick={onLoadMore} />}
      </div>
    </section>
  );
}
