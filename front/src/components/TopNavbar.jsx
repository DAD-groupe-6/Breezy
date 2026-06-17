"use client"

import { usePathname } from 'next/navigation'
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
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-sm)]">
      <div className="flex w-full items-center justify-between px-[var(--space-md)] py-[var(--space-sm)] md:px-[var(--space-lg)]">
        <h1 className="text-lg text-[var(--color-text-title)] [font-weight:var(--font-weight-display)] [letter-spacing:var(--tracking-display)]">{t(titleKey)}</h1>
        <div className="flex items-center gap-[var(--space-sm)]">
          <AuthButtons />
        </div>
      </div>
    </header>
  )
}