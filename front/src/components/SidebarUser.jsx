import Image from 'next/image'

export default function SidebarUser({ user }) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[var(--color-bg-surface-2)] cursor-pointer transition-colors duration-200">
      <div className="w-8 h-8 rounded-full bg-[var(--color-bg-surface-2)] shrink-0 overflow-hidden">
        {user?.avatarUrl && (
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      {user && (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{user.displayName}</p>
          <p className="text-xs text-[var(--color-text-secondary)] truncate">{user.username}</p>
        </div>
      )}
    </div>
  )
}
