"use client"

import { useState } from 'react'
import { FiHash, FiSearch, FiTrendingUp } from 'react-icons/fi'

export default function ExplorerPage() {
  const [query, setQuery] = useState('')

  const suggestedTags = ['#design', '#react', '#ui', '#dev', '@maried', '@alexm']
  const trendingTopics = [
    { label: 'Product design', count: '1.2k' },
    { label: 'Frontend', count: '894' },
    { label: 'Work in progress', count: '312' },
  ]

  return (
    <div className="relative min-h-full overflow-hidden bg-[var(--color-bg-primary)] px-4 py-6 text-[var(--color-text-primary)] md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[var(--color-text-title)]/12 blur-3xl" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-[var(--color-bg-surface-2)] blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-surface)]/90 p-6 shadow-sm backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-1 text-sm font-medium text-[var(--color-text-secondary)]">
            <FiTrendingUp className="text-[var(--color-text-title)]" />
            Explorer les sujets du moment
          </div>

          <div className="mt-5 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-title)] md:text-4xl">
              Explorer
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)] md:text-base">
              Recherchez des posts par mot-clé, #tag ou @pseudo avec une interface assortie à la palette Breezy.
            </p>
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
                placeholder="Ex: design, #react, @maried"
                className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-text-title)] hover:text-[var(--color-text-title)]"
                >
                  <FiHash size={14} />
                  {tag}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
              Cette recherche sera reliée au back plus tard pour filtrer les posts par tags et mentions.
            </p>
          </div>
        </section>

        <aside className="space-y-4 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-surface)]/90 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-bold text-[var(--color-text-title)]">Tendances</h2>
          <div className="space-y-3">
            {trendingTopics.map((topic) => (
              <div
                key={topic.label}
                className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{topic.label}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Aujourd'hui</p>
                </div>
                <span className="rounded-full bg-[var(--color-bg-surface-2)] px-3 py-1 text-sm font-semibold text-[var(--color-text-title)]">
                  {topic.count}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
