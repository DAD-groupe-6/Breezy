'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { useMessages } from '@/hooks/useMessages'
import ConversationList from '@/components/messages/ConversationList'
import ChatPanel from '@/components/messages/ChatPanel'

export default function MessagesView({ conversations }) {
  const { t } = useTranslation()
  const {
    selectedConversation,
    selectedId,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    selectConversation,
    clearSelection,
  } = useMessages(conversations)

  const labels = {
    empty: t('pages.messages.empty'),
    searchPlaceholder: t('pages.messages.searchPlaceholder'),
    noConversationSelected: t('pages.messages.noConversationSelected'),
    messagePlaceholder: t('pages.messages.messagePlaceholder'),
    back: t('pages.messages.backToConversations'),
    call: t('pages.messages.call'),
    videoCall: t('pages.messages.videoCall'),
    attach: t('pages.messages.attachFile'),
    send: t('pages.messages.send'),
  }

  return (
    <main className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="flex min-h-full w-full flex-col">
        <div className="hidden min-h-[calc(100vh-1.5rem)] overflow-hidden border-x border-[var(--color-border)] bg-[var(--color-bg-primary)] sm:flex">
          <aside className="flex w-[320px] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] lg:w-[360px]">
            <ConversationList
              searchId="messages-search-desktop"
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={labels.searchPlaceholder}
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={selectConversation}
              emptyLabel={labels.empty}
            />
          </aside>

          {selectedConversation ? (
            <ChatPanel conversation={selectedConversation} labels={labels} />
          ) : (
            <section className="flex flex-1 items-center justify-center bg-[var(--color-bg-primary)]">
              <p className="text-sm text-[var(--color-text-secondary)]">{labels.noConversationSelected}</p>
            </section>
          )}
        </div>

        <div className="sm:hidden">
          {!selectedConversation ? (
            <ConversationList
              searchId="messages-search-mobile"
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={labels.searchPlaceholder}
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={selectConversation}
              emptyLabel={labels.empty}
            />
          ) : (
            <ChatPanel
              conversation={selectedConversation}
              onBack={clearSelection}
              showBackButton
              labels={labels}
              className="min-h-[calc(100vh-5rem)] border-x border-[var(--color-border)]"
            />
          )}
        </div>
      </div>
    </main>
  )
}
