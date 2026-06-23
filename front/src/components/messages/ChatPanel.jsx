import { FiChevronLeft, FiPaperclip, FiPhone, FiSend, FiVideo } from 'react-icons/fi'
import UserInfo from '@/components/user/UserInfo'
import ChatBubble from '@/components/messages/ChatBubble'
import { useTranslation } from '@/hooks/useTranslation'

export default function ChatPanel({
  conversation,
  onBack,
  showBackButton = false,
  labels,
  className = '',
}) {
  const { t } = useTranslation()
  const username =
    conversation.name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, '.') || t('common.unknownHandle')

  return (
    <section className={`flex min-h-0 flex-1 flex-col bg-[var(--color-bg-primary)] ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
              aria-label={labels.back}
            >
              <FiChevronLeft />
            </button>
          ) : null}

          <UserInfo
            displayName={conversation.name}
            username={username}
            imageUrl={conversation.imageUrl}
            avatarSize={40}
            textContainerClassName="hidden"
          />

          <p className="font-semibold text-[var(--color-text-primary)]">{conversation.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
            aria-label={labels.call}
          >
            <FiPhone />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
            aria-label={labels.videoCall}
          >
            <FiVideo />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        {(conversation.messages ?? []).map((message) => (
          <ChatBubble key={message.id} {...message} />
        ))}
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-3 sm:px-5">
        <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
            aria-label={labels.attach}
          >
            <FiPaperclip />
          </button>
          <input
            type="text"
            placeholder={labels.messagePlaceholder}
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-text-title)] text-white transition-opacity hover:opacity-90"
            aria-label={labels.send}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </section>
  )
}
