"use client"

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import Searchbar from '../../../components/Searchbar'

export default function ExplorerPage() {
  const [query, setQuery] = useState('')
  const { t } = useTranslation()

  return (
    <div className="relative min-h-full overflow-hidden bg-transparent px-4 py-6 text-[var(--color-text-primary)] md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[var(--color-text-title)]/12 blur-3xl" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-[var(--color-bg-surface-2)] blur-3xl" />
      </div>

      <Searchbar
        id="explorer-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('pages.explorer.searchPlaceholder')}
        className="mt-8"
      />
    </div>
  )
}
