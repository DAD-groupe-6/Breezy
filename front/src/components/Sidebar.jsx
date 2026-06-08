'use client'

import { usePathname } from 'next/navigation'
import { FiHome, FiCompass, FiBell, FiMessageSquare, FiUser, FiEdit } from 'react-icons/fi'
import SidebarNavItem from './SidebarNavItem'
import SidebarUser from './SidebarUser'

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
    <aside className="flex flex-col h-screen w-56 bg-white border-r border-gray-200 px-3 py-6 shrink-0">

      <h1 className="mb-8 px-3 text-2xl font-bold text-[#5B5EF4]">Breezy</h1>

      <nav className="flex flex-col gap-1 flex-1">
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

      <button className="mt-4 w-full py-2.5 bg-[#5B5EF4] hover:bg-[#4B4EE4] text-white text-sm font-semibold rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5EF4] focus-visible:ring-offset-2">
        <FiEdit size={16} className="shrink-0" />
        <span>Nouvelle publication</span>
      </button>

      <div className="mt-4">
        <SidebarUser user={user} />
      </div>

    </aside>
  )
}
