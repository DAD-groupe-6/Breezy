'use client';

import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';

export default function CommentSection({
  comments = [],
  onAddComment,
  onDelete,
  onLike,
}) {
  const [draft, setDraft] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;

    onAddComment?.(value);
    setDraft('');
  };

  return (
    <section
      className="mt-[var(--space-sm)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-[var(--space-sm)] shadow-[var(--shadow-sm)]"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="mb-[var(--space-sm)] flex gap-[var(--space-xs)]">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('comments.placeholder')}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-[var(--space-sm)] py-[10px] text-sm text-[var(--color-text-primary)] outline-none shadow-[var(--shadow-sm)] transition-[background-color,border-color,box-shadow,color] duration-200 placeholder:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-2)] hover:border-[var(--color-text-secondary)] focus:border-[var(--color-text-title)] focus:shadow-[var(--shadow-focus)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[var(--radius-md)] bg-[var(--color-text-title)] px-[var(--space-sm)] py-[10px] text-xs font-semibold text-white shadow-[var(--shadow-sm)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:scale-[0.99]"
        >
          {t('comments.submit')}
        </button>
      </form>

      <div className="space-y-[var(--space-xs)]">
        {comments.length === 0 && (
          <p className="text-xs text-[var(--color-text-secondary)]">{t('comments.empty')}</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-[var(--space-sm)] py-[10px]"
          >
            <div className="mb-[var(--space-2xs)] flex items-center justify-between gap-[var(--space-xs)] text-xs">
              <div className="flex items-center gap-[var(--space-xs)]">
                <span className="font-semibold text-[var(--color-text-primary)]">{comment.displayName}</span>
                <span className="text-[var(--color-text-secondary)]">@{comment.username}</span>
                <span className="text-[var(--color-text-secondary)]">{comment.timestamp}</span>
              </div>
              {comment.canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete?.(comment.id)}
                  className="shrink-0 rounded-[var(--radius-pill)] p-[var(--space-2xs)] text-[var(--color-text-secondary)] transition-[background-color,color,box-shadow] duration-200 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
                  aria-label="Supprimer le commentaire"
                >
                  <FiTrash2 size={13} />
                </button>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-primary)]">{comment.content}</p>
            <button
              type="button"
              onClick={() => onLike?.(comment.id)}
              className={`mt-[6px] flex items-center gap-[4px] rounded-[var(--radius-pill)] px-[6px] py-[2px] text-xs transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] ${comment.liked ? 'bg-rose-50 text-rose-500' : 'text-[var(--color-text-secondary)] hover:bg-rose-50 hover:text-rose-500'}`}
              aria-label="Aimer le commentaire"
            >
              {comment.liked ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
              {comment.nb_like > 0 && <span>{comment.nb_like}</span>}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
