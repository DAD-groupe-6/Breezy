export default function Badge({ count }) {
  if (!count || count <= 0) return null

  return (
    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
      {count > 99 ? '99+' : count}
    </span>
  )
}
