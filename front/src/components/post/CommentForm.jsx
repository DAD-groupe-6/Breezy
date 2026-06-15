'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function CommentForm({ onSubmit }) {
  const [draft, setDraft] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;
    onSubmit?.(value);
    setDraft('');
  };

  return (
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
  );
}
