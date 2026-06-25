import UserInfo from '@/components/user/UserInfo'

export default function SidebarUser({ user }) {
  return (
    <div className="flex cursor-pointer items-center gap-[var(--space-xs)] rounded-[var(--radius-lg)] px-[var(--space-xs)] py-[var(--space-xs)] transition-[background-color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:shadow-[var(--shadow-sm)]">
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
