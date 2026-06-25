import Link from 'next/link'
import Badge from '@/components/ui/Badge'

export default function SidebarNavItem({ href, label, Icon, badge, isActive }) {
  const linkClass = isActive
    ? 'border-[var(--color-border)] bg-[var(--color-accent-soft)] text-[var(--color-text-title)] font-semibold shadow-[var(--shadow-sm)]'
    : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] hover:shadow-[var(--shadow-sm)]'

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-[var(--space-sm)] rounded-[var(--radius-lg)] border px-[var(--space-sm)] py-[10px] text-sm transition-[background-color,color,box-shadow,border-color,transform] duration-200 cursor-pointer focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] ${linkClass}`}
    >
      <Icon size={20} className="shrink-0" />
      <span>{label}</span>
      {badge > 0 && <span className="ml-auto"><Badge count={badge} /></span>}
    </Link>
  )
}
