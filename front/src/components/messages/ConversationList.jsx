import { FiEdit } from 'react-icons/fi'
import SearchBar from '@/components/navigation/SearchBar'
import ConversationItem from '@/components/messages/ConversationItem'
import { useTranslation } from '@/hooks/useTranslation'

export default function ConversationList({
  searchId,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  conversations,
  selectedId,
  onSelect,
  onDelete,
  onNewConversation,
  emptyLabel,
}) {
  const { t } = useTranslation()

  return (
    <section className="flex h-full flex-col border-x border-[var(--color-border)] bg-[var(--color-bg-surface)] sm:border-x-0">
      <div className="shrink-0 border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <SearchBar
            id={searchId}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            rounded="rounded-full"
            className="flex-1"
          />
          {onNewConversation && (
            <button
              type="button"
              onClick={onNewConversation}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-2)] hover:text-[var(--color-text-primary)]"
              aria-label={t('pages.messages.newConversation')}
            >
              <FiEdit size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">{emptyLabel}</p>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  )
}
