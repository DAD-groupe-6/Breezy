import { FiEdit } from 'react-icons/fi'
import ConversationItem from '@/components/messages/ConversationItem'
import NavbarMobile from '@/components/navigation/NavbarMobile'
import { useTranslation } from '@/hooks/useTranslation'

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
  onNewConversation,
  emptyLabel,
}) {
  const { t } = useTranslation()

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--color-bg-surface)]">

      {/* En-tête — bouton nouvelle conversation (même hauteur que l'en-tête
          du fil de discussion pour aligner les deux colonnes sur desktop) */}
      {onNewConversation && (
        <div className="shrink-0 flex h-16 items-center justify-end border-b border-[var(--color-border)] px-4 lg:px-5">
          <button
            type="button"
            onClick={onNewConversation}
            className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-2)] hover:text-[var(--color-text-primary)]"
            aria-label={t('pages.messages.newConversation')}
          >
            <FiEdit size={14} />
            <span>{t('pages.messages.newConversation')}</span>
          </button>
        </div>
      )}

      {/* Liste des conversations — pb-24 sur téléphone pour ne pas masquer
          les dernières conversations derrière la NavbarMobile flottante */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-24 sm:pb-0">
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

      {/* Navbar mobile — permet de quitter la messagerie depuis la liste
          (masquée dès sm+, où la Sidebar prend le relais) */}
      <NavbarMobile forceShow />

    </section>
  )
}
