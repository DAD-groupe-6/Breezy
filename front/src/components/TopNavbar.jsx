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
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
        <h1 className="text-lg font-bold text-[var(--color-text-title)]">{t(titleKey)}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            aria-label={t('nav.settings')}
            className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-title)]"
          >
            <FiSettings size={20} />
          </Link>
          <AuthButtons />
        </div>
      </div>
    </header>
  )
}