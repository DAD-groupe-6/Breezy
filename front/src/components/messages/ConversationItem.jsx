import UserInfo from '@/components/user/UserInfo'
import { useTranslation } from '@/hooks/useTranslation'

export default function ConversationItem({ conversation, active, onSelect }) {
  const { t } = useTranslation()
  const username =
    conversation.name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, '.') || t('common.unknownHandle')

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 border-b border-[var(--color-border)] px-3 py-3 text-left transition-colors last:border-b-0 sm:px-4 sm:py-3 ${
        active ? 'bg-[var(--color-bg-surface-2)]' : 'hover:bg-[var(--color-bg-surface-2)]/70'
      }`}
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
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{conversation.name}</p>
          <span className="shrink-0 text-[11px] text-[var(--color-text-secondary)]">{conversation.time}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">{conversation.preview}</p>
      </div>
    </button>
  )
}
