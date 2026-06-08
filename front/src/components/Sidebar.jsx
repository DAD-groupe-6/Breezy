'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FiHome, FiCompass, FiBell, FiMessageSquare, FiUser, FiEdit } from 'react-icons/fi'

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

      <h1 className="mb-8 px-3 text-2xl font-bold text-brand">Breezy</h1>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, Icon, badge }) => {
          const isActive = pathname === href
          const linkClass = isActive
            ? 'bg-brand/10 text-brand font-semibold'
            : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset ${linkClass}`}
            >
              <Icon size={20} className="shrink-0" />
              <span>{label}</span>
              {badge > 0 && (
                <span className="ml-auto bg-brand text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <button className="mt-4 w-full py-2.5 bg-brand hover:bg-[#4B4EE4] text-white text-sm font-semibold rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
        <FiEdit size={16} className="shrink-0" />
        <span>Nouvelle publication</span>
      </button>

      <div className="mt-4 flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
          {user?.avatarUrl && (
            <Image src={user.avatarUrl} alt={user.displayName} width={32} height={32} className="w-full h-full object-cover" />
          )}
        </div>
        {user && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user.username}</p>
          </div>
        )}
      </div>

    </aside>
  )
}
