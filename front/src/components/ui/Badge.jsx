export default function Badge({
  count,
  children,
  className = '',
  style,
  dot = false,
}) {
  if (count !== undefined) {
    if (!count || count <= 0) return null

    return (
      <span className="min-w-[20px] rounded-[var(--radius-pill)] bg-red-500 px-[6px] py-[2px] text-center text-xs font-bold text-white shadow-[var(--shadow-sm)]">
        {count > 99 ? '99+' : count}
      </span>
    )
  }

  if (!children && !dot) return null

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${className}`}
      style={{
        backgroundColor: 'var(--color-accent-soft)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)',
        ...style,
      }}
    >
      {dot ? (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-text-title)' }} aria-hidden="true" />
      ) : null}
      {children}
    </span>
  )
}
