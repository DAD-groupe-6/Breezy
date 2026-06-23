import { useState } from 'react'
import { FiChevronLeft, FiSend } from 'react-icons/fi'
import UserInfo from '@/components/user/UserInfo'
import ChatBubble from '@/components/messages/ChatBubble'
import { useTranslation } from '@/hooks/useTranslation'

export default function ChatPanel({
  conversation,
  messages = [],
  onSendMessage,
  onBack,
  showBackButton = false,
  labels,
  className = '',
}) {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')

  const username =
    conversation.name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, '.') || t('common.unknownHandle')

  function handleSend() {
    if (!inputValue.trim()) return
    onSendMessage?.(inputValue)
    setInputValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <section className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg-primary)] ${className}`}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
              aria-label={labels.back}
            >
              <FiChevronLeft />
            </button>
          )}
          <UserInfo
            displayName={conversation.name}
            username={username}
            imageUrl={conversation.imageUrl}
            avatarSize={40}
            textContainerClassName="hidden"
          />
          <p className="font-semibold text-[var(--color-text-primary)]">{conversation.name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        {messages.map((message) => (
          <ChatBubble key={message.id} {...message} />
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-3 sm:px-5">
        <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.messagePlaceholder}
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-text-title)] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            aria-label={labels.send}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </section>
  )
}
