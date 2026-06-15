import UserInfo from './UserInfo'

export default function SidebarUser({ user }) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[var(--color-bg-surface-2)] cursor-pointer transition-colors duration-200">
      {user && (
        <UserInfo
          displayName={user.displayName}
          username={user.username?.startsWith('@') ? user.username.slice(1) : user.username}
          imageUrl={user.avatarUrl}
          avatarSize={32}
          className="gap-2"
          displayNameClassName="text-sm font-semibold"
          usernameClassName="text-xs"
        />
      )}
    </div>
  )
}
