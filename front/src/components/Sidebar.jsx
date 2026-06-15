'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiCompass, FiBell, FiMessageSquare, FiUser, FiEdit, FiSettings } from 'react-icons/fi'
import SidebarNavItem from './SidebarNavItem'
import CurrentUser from "@/components/CurrentUser";
import { useTranslation } from '@/hooks/useTranslation'

export default function Sidebar({ user = null }) {
  const pathname = usePathname()
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { href: '/',              label: t('nav.home'),          Icon: FiHome          },
    { href: '/explorer',      label: t('nav.explorer'),      Icon: FiCompass       },
    { href: '/notifications', label: t('nav.notifications'), Icon: FiBell,         },
    { href: '/messages',      label: t('nav.messages'),      Icon: FiMessageSquare },
    { href: '/profil',        label: t('nav.profil'),        Icon: FiUser          },
    { href: '/settings',      label: t('nav.settings'),      Icon: FiSettings      },
  ]

  return (
    <aside className="hidden sm:flex flex-col sticky top-0 h-screen w-56 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] px-3 py-6 shrink-0 overflow-y-auto">

      <h1 className="mb-8 px-3 text-2xl font-bold text-[var(--color-text-title)]">Breezy</h1>

      <nav className="flex flex-col gap-1">
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
        className="mt-4 w-full py-2.5 bg-[var(--color-text-title)] hover:opacity-90 text-[var(--color-bg-surface)] text-sm font-semibold rounded-full cursor-pointer transition-opacity duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text-title)] focus-visible:ring-offset-2"
      >
        <FiEdit size={16} className="shrink-0" />
        <span>{t('nav.newPost')}</span>
      </Link>

        <div className="mt-auto">
            <div className="p-3 rounded-xl hover:bg-[var(--color-bg-surface-2)] cursor-pointer transition-colors duration-200">
                <CurrentUser />
            </div>
        </div>

    </aside>
  )
}
