"use client"

import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'

export default function ExplorerPage() {
  const [query, setQuery] = useState('')

  return (
    <div className="relative min-h-full overflow-hidden bg-[var(--color-bg-primary)] px-4 py-6 text-[var(--color-text-primary)] md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[var(--color-text-title)]/12 blur-3xl" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-[var(--color-bg-surface-2)] blur-3xl" />
      </div>

      <div className="mt-8 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 md:p-5">
        <label htmlFor="explorer-search" className="mb-3 block text-sm font-semibold text-[var(--color-text-primary)]">
          Rechercher un contenu
        </label>

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 transition-colors focus-within:border-[var(--color-text-title)] focus-within:ring-2 focus-within:ring-[var(--color-text-title)]/20">
          <FiSearch className="shrink-0 text-lg text-[var(--color-text-secondary)]" aria-hidden="true" />
          <input
            id="explorer-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: mot clé, #tag, @username"
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
        </div>
      </div>
    </div>
  )
}
