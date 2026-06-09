import Link from 'next/link'
import Badge from '@/components/ui/Badge'

export default function SidebarNavItem({ href, label, Icon, badge, isActive }) {
  const linkClass = isActive
    ? 'bg-[#5B5EF4]/10 text-[#5B5EF4] font-semibold'
    : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5EF4] focus-visible:ring-inset ${linkClass}`}
    >
      <Icon size={20} className="shrink-0" />
      <span>{label}</span>
      <span className="ml-auto"><Badge count={badge} /></span>
    </Link>
  )
}
