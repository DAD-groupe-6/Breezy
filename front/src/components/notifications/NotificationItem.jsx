import UserInfo from '@/components/UserInfo'
import { timeAgo } from '@/utils/time'

export default function NotificationItem({ notification, t, locale }) {
  const displayName = notification.actor?.displayName || t('common.unknownUser')
  const username = notification.actor?.username || t('common.unknownHandle')
  const actionText = t(`pages.notifications.actions.${notification.type}`)
  const timestamp = notification.createdAt
    ? timeAgo(notification.createdAt, t, locale)
    : t('time.justNow')

  return (
    <li className="relative border-b border-[var(--color-border)] px-4 py-4 transition-colors hover:bg-[var(--color-bg-surface-2)] last:border-b-0">
      <div className="flex items-start gap-3 sm:gap-4">
        <UserInfo
          displayName={displayName}
          username={username}
          imageUrl={notification.actor?.imageUrl}
          avatarSize={40}
          className="min-w-0 flex-1 items-start"
          textContainerClassName="min-w-0"
          displayNameClassName="text-[13px] leading-5 sm:text-sm"
          usernameClassName="mt-0.5 text-[11px] sm:text-xs"
        />
      </div>

      <p className="mt-1 pl-[52px] pr-5 text-[13px] leading-5 text-[var(--color-text-secondary)] sm:text-sm">
        {actionText}
      </p>
      <p className="mt-0.5 pl-[52px] text-[11px] font-medium text-[var(--color-text-secondary)] sm:text-xs">
        {timestamp}
      </p>
    </li>
  )
}
