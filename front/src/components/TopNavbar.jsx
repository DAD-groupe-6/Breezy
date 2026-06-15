"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiSettings } from 'react-icons/fi'
import AuthButtons from '@/components/auth/AuthButtons'
import { useTranslation } from '@/hooks/useTranslation'

const ROUTE_TITLE_KEYS = {
  '/': 'pages.home.title',
  '/explorer': 'pages.explorer.title',
  '/notifications': 'pages.notifications.title',
  '/messages': 'pages.messages.title',
  '/profil': 'nav.profil',
  '/settings': 'pages.settings.title',
  '/nouvelle-publication': 'nav.newPost',
}

export default function AppTopNavbar() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const titleKey = ROUTE_TITLE_KEYS[pathname] || 'nav.home'

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-surface)_86%,transparent)] shadow-[var(--shadow-sm)] backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] md:px-[var(--space-lg)]">
        <h1 className="text-lg text-[var(--color-text-title)] [font-weight:var(--font-weight-display)] [letter-spacing:var(--tracking-display)]">{t(titleKey)}</h1>
        <div className="flex items-center gap-[var(--space-sm)]">
          <Link
            href="/settings"
            aria-label={t('nav.settings')}
            className="rounded-[var(--radius-pill)] p-[var(--space-xs)] text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
          >
            <FiSettings size={20} />
          </Link>
          <AuthButtons />
        </div>
      </div>
    </header>
  )
}