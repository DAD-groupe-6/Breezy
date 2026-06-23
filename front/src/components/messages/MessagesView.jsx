'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useMessages } from '@/hooks/useMessages'
import ConversationList from '@/components/messages/ConversationList'
import ChatPanel from '@/components/messages/ChatPanel'
import NewConversationModal from '@/components/messages/NewConversationModal'

export default function MessagesView({ initialRecipientId }) {
  const { t } = useTranslation()
  const [newConvOpen, setNewConvOpen] = useState(false)

  const {
    selectedConversation,
    selectedId,
    messages,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    selectConversation,
    startNewConversation,
    clearSelection,
    sendMessage,
    removeConversation,
  } = useMessages({ initialRecipientId })

  const labels = {
    empty: t('pages.messages.empty'),
    searchPlaceholder: t('pages.messages.searchPlaceholder'),
    noConversationSelected: t('pages.messages.noConversationSelected'),
    messagePlaceholder: t('pages.messages.messagePlaceholder'),
    back: t('pages.messages.backToConversations'),
    attach: t('pages.messages.attachFile'),
    send: t('pages.messages.send'),
  }

  return (
    <main className="flex h-full flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="flex h-full w-full flex-col">
        {/* Desktop */}
        <div className="hidden flex-1 overflow-hidden border-x border-[var(--color-border)] bg-[var(--color-bg-primary)] sm:flex">
          <aside className="flex w-[320px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] lg:w-[360px]">
            <ConversationList
              searchId="messages-search-desktop"
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={labels.searchPlaceholder}
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
              labels={labels}
            />
          ) : (
            <section className="flex flex-1 items-center justify-center bg-[var(--color-bg-primary)]">
              <p className="text-sm text-[var(--color-text-secondary)]">{labels.noConversationSelected}</p>
            </section>
          )}
        </div>

        {/* Mobile */}
        <div className="flex flex-1 flex-col overflow-hidden sm:hidden">
          {!selectedConversation ? (
            <ConversationList
              searchId="messages-search-mobile"
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={labels.searchPlaceholder}
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
              labels={labels}
              className="border-x border-[var(--color-border)]"
            />
          )}
        </div>
      </div>

      <NewConversationModal
        isOpen={newConvOpen}
        onClose={() => setNewConvOpen(false)}
        onSelectUser={(userId) => startNewConversation(userId).catch(() => {})}
      />
    </main>
  )
}
