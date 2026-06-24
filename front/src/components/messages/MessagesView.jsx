'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useMessages } from '@/hooks/useMessages'
import ConversationList from '@/components/messages/ConversationList'
import ChatPanel from '@/components/messages/ChatPanel'
import NewConversationModal from '@/components/messages/NewConversationModal'

export default function MessagesView({ initialRecipientId }) {
  const { t } = useTranslation()
  const [newConvOpen, setNewConvOpen] = useState(false)

  // La messagerie occupe exactement la hauteur du viewport : les messages
  // défilent en interne et la zone de saisie reste ancrée en bas. Les autres
  // pages reposent sur le scroll de la fenêtre, donc on verrouille la coquille
  // (hauteur + overflow) uniquement le temps que /messages est monté. On retire
  // aussi le pb-16 conservé par le layout (la NavbarMobile est masquée ici).
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const shell = main.parentElement
    main.classList.remove('pb-16')

    const prevHeight = shell?.style.height
    const prevOverflow = shell?.style.overflow
    if (shell) {
      shell.style.height = '100dvh'
      shell.style.overflow = 'hidden'
    }

    return () => {
      main.classList.add('pb-16')
      if (shell) {
        shell.style.height = prevHeight ?? ''
        shell.style.overflow = prevOverflow ?? ''
      }
    }
  }, [])

  const {
    selectedConversation,
    selectedId,
    messages,
    filteredConversations,
    selectConversation,
    startNewConversation,
    clearSelection,
    sendMessage,
    removeConversation,
    loadOlderMessages,
    hasMoreMessages,
    loadingOlderMessages,
  } = useMessages({ initialRecipientId })

  const labels = {
    empty: t('pages.messages.empty'),
    noConversationSelected: t('pages.messages.noConversationSelected'),
    messagePlaceholder: t('pages.messages.messagePlaceholder'),
    back: t('pages.messages.backToConversations'),
    attach: t('pages.messages.attachFile'),
    send: t('pages.messages.send'),
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">

        {/* Desktop (≥ 1024px) — deux colonnes */}
        <div className="hidden min-h-0 flex-1 overflow-hidden border-x border-[var(--color-border)] lg:flex">
          <aside className="flex w-[320px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] xl:w-[360px]">
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={selectConversation}
              onDelete={removeConversation}
              onNewConversation={() => setNewConvOpen(true)}
              emptyLabel={labels.empty}
            />
          </aside>

          {selectedConversation ? (
            <ChatPanel
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={sendMessage}
              onLoadOlder={loadOlderMessages}
              hasMoreMessages={hasMoreMessages}
              loadingOlderMessages={loadingOlderMessages}
              labels={labels}
            />
          ) : (
            <section className="flex flex-1 items-center justify-center bg-[var(--color-bg-primary)]">
              <p className="text-sm text-[var(--color-text-secondary)]">{labels.noConversationSelected}</p>
            </section>
          )}
        </div>

        {/* Mobile (< 1024px) — plein écran, une vue à la fois */}
        <div className="flex min-h-0 flex-1 flex-col lg:hidden">
          {!selectedConversation ? (
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={selectConversation}
              onDelete={removeConversation}
              onNewConversation={() => setNewConvOpen(true)}
              emptyLabel={labels.empty}
            />
          ) : (
            <ChatPanel
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={sendMessage}
              onBack={clearSelection}
              showBackButton
              onLoadOlder={loadOlderMessages}
              hasMoreMessages={hasMoreMessages}
              loadingOlderMessages={loadingOlderMessages}
              labels={labels}
            />
          )}
        </div>

      <NewConversationModal
        isOpen={newConvOpen}
        onClose={() => setNewConvOpen(false)}
        onSelectUser={(userId) => startNewConversation(userId).catch(() => {})}
      />
    </div>
  )
}
