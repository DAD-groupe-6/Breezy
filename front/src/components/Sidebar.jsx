'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiCompass, FiBell, FiMessageSquare, FiUser, FiEdit } from 'react-icons/fi'
import SidebarNavItem from './SidebarNavItem'
import UserInfo from "./UserInfo";
import CurrentUser from "@/components/CurrentUser";

const NAV_ITEMS = [
  { href: '/',              label: 'Accueil',       Icon: FiHome          },
  { href: '/explorer',      label: 'Explorer',      Icon: FiCompass       },
  { href: '/notifications', label: 'Notifications', Icon: FiBell,          badge: 3 },
  { href: '/messages',      label: 'Messages',      Icon: FiMessageSquare, badge: 2 },
  { href: '/profil',        label: 'Profil',        Icon: FiUser          },
]

export default function Sidebar({ user = null }) {
  const pathname = usePathname()

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
        <span>Nouvelle publication</span>
      </Link>

        <div className="mt-auto">
            <div className="p-3 rounded-xl hover:bg-[var(--color-bg-surface-2)] cursor-pointer transition-colors duration-200">
                <CurrentUser />
            </div>
        </div>

    </aside>
  )
}
