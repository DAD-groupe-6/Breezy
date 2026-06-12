"use client"

import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useTranslation } from '@/hooks/useTranslation'

export default function ExplorerPage() {
  const [query, setQuery] = useState('')
  const { t } = useTranslation()

  return (
    <div className="p-6 text-[var(--color-text-primary)]">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('pages.explorer.title')}</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        {t('pages.explorer.subtitle')}
      </p>

      <div className="mt-6 max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-sm">
        <label htmlFor="explorer-search" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
          {t('pages.explorer.searchLabel')}
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-4 py-3 focus-within:border-[var(--color-text-title)] focus-within:ring-2 focus-within:ring-[var(--color-text-title)]/20">
          <FiSearch className="shrink-0 text-lg text-[var(--color-text-secondary)]" aria-hidden="true" />
          <input
            id="explorer-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('pages.explorer.searchPlaceholder')}
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
        </div>

        <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
          {t('pages.explorer.searchNote')}
        </p>
      </div>
    </div>
  )
}
