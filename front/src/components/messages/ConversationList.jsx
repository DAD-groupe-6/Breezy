import SearchBar from '@/components/navigation/SearchBar'
import ConversationItem from '@/components/messages/ConversationItem'

export default function ConversationList({
  searchId,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  conversations,
  selectedId,
  onSelect,
  emptyLabel,
}) {
  return (
    <section className="flex h-full flex-col border-x border-[var(--color-border)] bg-[var(--color-bg-surface)] sm:border-x-0">
      <div className="border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
        <SearchBar
          id={searchId}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          rounded="rounded-full"
          className="mt-4"
        />
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
            />
          ))
        )}
      </div>
    </section>
  )
}
