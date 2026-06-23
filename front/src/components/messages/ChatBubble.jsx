export default function ChatBubble({ from, text, time, readAt }) {
  const isMe = from === 'me'

  return (
    <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${
          isMe
            ? 'bg-[var(--color-text-title)] text-white'
            : 'border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
        }`}
      >
        <p className="whitespace-pre-line break-words [overflow-wrap:anywhere]">{text}</p>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]">
        <span>{time}</span>
        {isMe && (
          <span className={readAt ? 'text-[var(--color-text-title)] font-medium' : ''}>
            {readAt ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  )
}
