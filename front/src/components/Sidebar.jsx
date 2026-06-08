'use client'

import { usePathname } from 'next/navigation'
import { FiHome, FiCompass, FiBell, FiMessageSquare, FiUser, FiEdit } from 'react-icons/fi'
import SidebarNavItem from './SidebarNavItem'
import UserInfo from "./UserInfo";

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
    <aside className="hidden md:flex flex-col sticky top-0 h-screen w-56 bg-white border-r border-gray-100 px-3 py-6 shrink-0 overflow-y-auto">

      <h1 className="mb-8 px-3 text-2xl font-bold text-indigo-600">Breezy</h1>

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

        <button className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">        <FiEdit size={16} className="shrink-0" />
        <span>Nouvelle publication</span>
      </button>

        <div className="mt-auto">
            <div className="p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200">
              <UserInfo
                  displayName={user?.name || "Lucas Martin"}
                  username={user?.pseudo || "lucas_m"}
                  imageUrl={user?.photo || "https://randomuser.me/api/portraits/men/32.jpg"}
                  avatarSize={40}
              />
          </div>
      </div>

    </aside>
  )
}
