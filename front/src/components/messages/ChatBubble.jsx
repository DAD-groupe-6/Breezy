export default function ChatBubble({ from, text, time }) {
  const isMe = from === 'me'

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-5 ${
          isMe
            ? 'bg-[var(--color-text-title)] text-white'
            : 'border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
        }`}
      >
        <p className="whitespace-pre-line">{text}</p>
        <p className={`mt-1 text-[11px] ${isMe ? 'text-white/80' : 'text-[var(--color-text-secondary)]'}`}>{time}</p>
      </div>
    </div>
  )
}
