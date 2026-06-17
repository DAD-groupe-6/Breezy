export default function Badge({ count }) {
  if (!count || count <= 0) return null

  return (
    <span className="min-w-[20px] rounded-[var(--radius-pill)] bg-red-500 px-[6px] py-[2px] text-center text-xs font-bold text-white shadow-[var(--shadow-sm)]">
      {count > 99 ? '99+' : count}
    </span>
  )
}
