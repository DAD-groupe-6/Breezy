"use client"

import { useState } from 'react'
import { FiChevronLeft, FiSearch, FiPhone, FiVideo, FiPaperclip, FiSend } from 'react-icons/fi'

const conversations = [
  {
    id: 1,
    name: 'Amara Diallo',
    preview: 'On se retrouve à 18h ?',
    time: 'maintenant',
    accent: 'bg-[var(--color-text-title)]',
    messages: [
      { id: 1, from: 'them', text: 'Salut ! Tu vas bien ?', time: '10:02' },
      { id: 2, from: 'me', text: 'Oui super, et toi ?', time: '10:04' },
      { id: 3, from: 'them', text: 'Très bien ! Tu as vu mes nouvelles photos ?', time: '10:05' },
      { id: 4, from: 'me', text: 'Oui elles sont magnifiques !\nLe coucher de soleil était incroyable 😍', time: '10:07' },
      { id: 5, from: 'them', text: 'On se retrouve à 18h ?', time: '10:10' },
    ],
  },
  {
    id: 2,
    name: 'Lucas Martin',
    preview: 'Merci pour le partage !',
    time: '5 min',
    accent: 'bg-[var(--color-bg-surface-2)]',
    messages: [
      { id: 1, from: 'them', text: 'Merci pour le partage !', time: '09:20' },
    ],
  },
  {
    id: 3,
    name: 'Yuki Tanaka',
    preview: 'Super photo 😍',
    time: '1 h',
    accent: 'bg-[var(--color-text-title)]',
    messages: [
      { id: 1, from: 'them', text: 'Super photo 😍', time: '09:40' },
    ],
  },
  {
    id: 4,
    name: 'Omar Benali',
    preview: 'Tu viens ce weekend ?',
    time: 'hier',
    accent: 'bg-[var(--color-bg-surface-2)]',
    messages: [
      { id: 1, from: 'them', text: 'Tu viens ce weekend ?', time: '17:12' },
    ],
  },
  {
    id: 5,
    name: 'Sofia Reyes',
    preview: 'Bonne idée !',
    time: 'lun',
    accent: 'bg-[var(--color-bg-surface-2)]',
    messages: [
      { id: 1, from: 'them', text: 'Bonne idée !', time: '08:51' },
    ],
  },
]

function ConversationItem({ conversation, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`flex w-full items-center gap-3 border-b border-[var(--color-border)] px-3 py-3 text-left transition-colors last:border-b-0 sm:px-4 sm:py-3 ${
        active ? 'bg-[var(--color-bg-surface-2)]' : 'hover:bg-[var(--color-bg-surface-2)]/70'
      }`}
    >
      <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${conversation.accent} text-sm font-semibold text-[var(--color-text-secondary)]`}>
        {conversation.name
          .split(' ')
          .map((part) => part[0])
          .slice(0, 2)
          .join('')}
      </div>

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

function ChatBubble({ from, text, time }) {
  const isMe = from === 'me'

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-5 ${
        isMe
          ? 'bg-[var(--color-text-title)] text-white'
          : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
      }`}>
        <p className="whitespace-pre-line">{text}</p>
        <p className={`mt-1 text-[11px] ${isMe ? 'text-white/80' : 'text-[var(--color-text-secondary)]'}`}>{time}</p>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(null)

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) ?? null

  const handleSelect = (conversationId) => {
    setSelectedId(conversationId)
  }

  const handleBack = () => {
    setSelectedId(null)
  }

  return (
    <main className="min-h-full bg-transparent text-[var(--color-text-primary)]">
      <div className="flex min-h-full w-full flex-col">
        <div className="hidden min-h-[calc(100vh-1.5rem)] overflow-hidden border-x border-[var(--color-border)] bg-transparent sm:flex">
          <aside className="flex w-[320px] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] lg:w-[360px]">
            <div className="border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
              <h1 className="text-xl font-bold text-[var(--color-text-title)]">Messages</h1>
              <label className="mt-4 flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                <FiSearch className="shrink-0" />
                <span>Rechercher...</span>
              </label>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === selectedId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </aside>

          <section className="flex flex-1 flex-col bg-transparent">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-surface-2)] text-sm font-semibold text-[var(--color-text-secondary)]">
                      {selectedConversation.name
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">{selectedConversation.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]" aria-label="Appeler">
                      <FiPhone />
                    </button>
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]" aria-label="Appel vidéo">
                      <FiVideo />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                  {selectedConversation.messages.map((message) => (
                    <ChatBubble key={message.id} {...message} />
                  ))}
                </div>

                <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-3 sm:px-5">
                  <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-2">
                    <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]" aria-label="Joindre un fichier">
                      <FiPaperclip />
                    </button>
                    <input
                      type="text"
                      placeholder="Écrire un message..."
                      className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
                    />
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-text-title)] text-white transition-opacity hover:opacity-90" aria-label="Envoyer">
                      <FiSend />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center bg-transparent" />
            )}
          </section>
        </div>

        <div className="sm:hidden">
          {!selectedConversation ? (
            <section className="border-x border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <div className="border-b border-[var(--color-border)] px-4 py-4">
                <h1 className="text-xl font-bold text-[var(--color-text-title)]">Messages</h1>
                <label className="mt-4 flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  <FiSearch className="shrink-0" />
                  <span>Rechercher...</span>
                </label>
              </div>

              <div>
                {conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    active={conversation.id === selectedId}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </section>
          ) : (
            <section className="flex min-h-[calc(100vh-5rem)] flex-col border-x border-[var(--color-border)] bg-transparent">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
                    aria-label="Retour aux conversations"
                  >
                    <FiChevronLeft />
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-surface-2)] text-sm font-semibold text-[var(--color-text-secondary)]">
                    {selectedConversation.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)]">{selectedConversation.name}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                {selectedConversation.messages.map((message) => (
                  <ChatBubble key={message.id} {...message} />
                ))}
              </div>

              <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-3">
                <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-2">
                  <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]" aria-label="Joindre un fichier">
                    <FiPaperclip />
                  </button>
                  <input
                    type="text"
                    placeholder="Écrire un message..."
                    className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
                  />
                  <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-text-title)] text-white transition-opacity hover:opacity-90" aria-label="Envoyer">
                    <FiSend />
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
