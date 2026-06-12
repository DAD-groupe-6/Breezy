'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function CommentSection({
  comments = [],
  onAddComment,
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
      className="mt-3 rounded-xl border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-primary)]/35 p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="mb-3 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('comments.placeholder')}
          className="w-full rounded-lg border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-text-title)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-[var(--color-text-title)] px-3 py-2 text-xs font-semibold text-white transition-colors hover:brightness-95"
        >
          {t('comments.submit')}
        </button>
      </form>

      <div className="space-y-2">
        {comments.length === 0 && (
          <p className="text-xs text-[var(--color-text-secondary)]">{t('comments.empty')}</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-lg border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-surface)] px-3 py-2"
          >
            <div className="mb-1 flex items-center gap-2 text-xs">
              <span className="font-semibold text-[var(--color-text-primary)]">{comment.displayName}</span>
              <span className="text-[var(--color-text-secondary)]">@{comment.username}</span>
              <span className="text-[var(--color-text-secondary)]">{comment.timestamp}</span>
            </div>
            <p className="text-sm text-[var(--color-text-primary)]">{comment.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
