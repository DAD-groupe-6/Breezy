'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/providers/AuthProvider';
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
  // Publier un commentaire passe par la permission `publish_post` (posts et réponses).
  const { hasPermission } = useAuth();
  const canPublish = hasPermission('publish_post');

  return (
    <section
      className="mt-3 rounded-xl border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-primary)]/35 p-3"
      onClick={(e) => e.stopPropagation()}
    >
      {canPublish && <CommentForm onSubmit={onAddComment} />}

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
