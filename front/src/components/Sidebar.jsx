'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiCompass, FiBell, FiMessageSquare, FiEdit, FiSettings } from 'react-icons/fi'
import SidebarNavItem from './SidebarNavItem'
import CurrentUser from "@/components/CurrentUser";
import { useTranslation } from '@/hooks/useTranslation'

export default function Sidebar({ user = null }) {
  const pathname = usePathname()
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { href: '/',              label: t('nav.home'),          Icon: FiHome          },
    { href: '/explorer',      label: t('nav.explorer'),      Icon: FiCompass       },
    { href: '/notifications', label: t('nav.notifications'), Icon: FiBell,          badge: 3 },
    { href: '/messages',      label: t('nav.messages'),      Icon: FiMessageSquare, badge: 2 },
    { href: '/settings',      label: t('nav.settings'),      Icon: FiSettings      },
  ]

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] px-[var(--space-sm)] py-[var(--space-lg)] shadow-[var(--shadow-sm)] sm:flex sm:flex-col">

      <h1 className="mb-[var(--space-xl)] px-[var(--space-sm)] text-2xl text-[var(--color-text-title)] [font-weight:var(--font-weight-display)] [letter-spacing:var(--tracking-display)]">Breezy</h1>

      <nav className="flex flex-col gap-[var(--space-xs)]">
        {NAV_ITEMS.map(({ href, label, Icon, badge }) => (
          <SidebarNavItem
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            badge={badge}
            isActive={pathname === href}
          />
        ))}
      </nav>

      <Link
        href="/nouvelle-publication"
        className="mt-[var(--space-md)] flex w-full items-center justify-center gap-[var(--space-xs)] rounded-[var(--radius-pill)] border border-transparent bg-[var(--color-text-title)] px-[var(--space-md)] py-[10px] text-sm text-[var(--color-bg-surface)] shadow-[var(--shadow-sm)] transition-[background-color,box-shadow,transform] duration-200 [font-weight:var(--font-weight-title)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:scale-[0.99]"
      >
        <FiEdit size={16} className="shrink-0" />
        <span>{t('nav.newPost')}</span>
      </Link>

        <div className="mt-auto pt-[var(--space-md)]">
            <div className="rounded-[var(--radius-lg)] border border-transparent p-[var(--space-sm)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[var(--color-border)] hover:bg-[var(--color-accent-soft)] hover:shadow-[var(--shadow-sm)]">
                <CurrentUser />
            </div>
        </div>

    </aside>
  )
}
