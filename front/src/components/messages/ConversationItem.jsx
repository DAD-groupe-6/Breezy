import { FiTrash2 } from 'react-icons/fi'
import UserInfo from '@/components/user/UserInfo'
import { useTranslation } from '@/hooks/useTranslation'

export default function ConversationItem({ conversation, active, onSelect, onDelete }) {
  const { t } = useTranslation()
  const username =
    conversation.name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, '.') || t('common.unknownHandle')

  const hasUnread = conversation.unreadCount > 0

  return (
    <div className={`group relative flex w-full items-center border-b border-[var(--color-border)] last:border-b-0 ${active ? 'bg-[var(--color-bg-surface-2)]' : 'hover:bg-[var(--color-bg-surface-2)]/70'}`}>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        aria-pressed={active}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left transition-colors sm:px-4"
      >
        <UserInfo
          displayName={conversation.name}
          username={username}
          imageUrl={conversation.imageUrl}
          avatarSize={40}
          className="shrink-0"
          textContainerClassName="hidden"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`truncate text-sm ${hasUnread ? 'font-bold text-[var(--color-text-primary)]' : 'font-semibold text-[var(--color-text-primary)]'}`}>
              {conversation.name}
            </p>
            <span className="shrink-0 text-[11px] text-[var(--color-text-secondary)]">{conversation.time}</span>
          </div>

          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className={`truncate text-sm ${hasUnread ? 'font-medium text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
              {conversation.preview}
            </p>
            {hasUnread && (
              <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[var(--color-text-title)] px-1 text-[11px] font-semibold text-white">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(conversation.id) }}
          className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] opacity-100 transition-opacity hover:bg-[var(--color-bg-surface-2)] hover:text-red-500 lg:opacity-0 lg:group-hover:opacity-100"
          aria-label={t('pages.messages.deleteConversation')}
        >
          <FiTrash2 size={15} />
        </button>
      )}
    </div>
  )
}
