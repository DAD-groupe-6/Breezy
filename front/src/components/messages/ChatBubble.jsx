export default function ChatBubble({
  from,
  text,
  time,
  readAt,
  isFirstInGroup = true,
  isLastInGroup = true,
}) {
  const isMe = from === 'me'

  // Coins de bulle adaptés au regroupement : un groupe de messages consécutifs
  // forme un bloc visuel cohérent (coin « attaché » côté expéditeur).
  const groupCorner = isMe
    ? !isLastInGroup && 'rounded-br-md'
    : !isLastInGroup && 'rounded-bl-md'
  const groupCornerTop = isMe
    ? !isFirstInGroup && 'rounded-tr-md'
    : !isFirstInGroup && 'rounded-tl-md'

  return (
    <div
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${
        isFirstInGroup ? 'mt-2' : 'mt-0.5'
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${groupCorner || ''} ${groupCornerTop || ''} ${
          isMe
            ? 'bg-[var(--color-text-title)] text-white'
            : 'border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
        }`}
      >
        <p className="whitespace-pre-line break-words [overflow-wrap:anywhere]">{text}</p>
      </div>

      {isLastInGroup && (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]">
          <span>{time}</span>
          {isMe && (
            <span className={readAt ? 'text-[var(--color-text-title)] font-medium' : ''}>
              {readAt ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
