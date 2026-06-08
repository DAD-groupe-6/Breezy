import Image from 'next/image'

export default function SidebarUser({ user }) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200">
      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
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
          <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</p>
          <p className="text-xs text-slate-500 truncate">{user.username}</p>
        </div>
      )}
    </div>
  )
}
