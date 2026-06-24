'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { FiChevronLeft, FiSend } from 'react-icons/fi'
import Avatar from '@/components/user/Avatar'
import ChatBubble from '@/components/messages/ChatBubble'
import { useTranslation } from '@/hooks/useTranslation'

// Deux messages appartiennent au même groupe s'ils viennent du même expéditeur
// et sont espacés de moins de 5 minutes.
const GROUP_GAP_MS = 5 * 60 * 1000
function sameGroup(prev, next) {
  if (!prev || !next || prev.from !== next.from) return false
  const prevTime = new Date(prev.createdAt).getTime()
  const nextTime = new Date(next.createdAt).getTime()
  if (Number.isNaN(prevTime) || Number.isNaN(nextTime)) return false
  return nextTime - prevTime < GROUP_GAP_MS
}

export default function ChatPanel({
  conversation,
  messages = [],
  onSendMessage,
  onBack,
  showBackButton = false,
  onLoadOlder,
  hasMoreMessages = false,
  loadingOlderMessages = false,
  labels,
  className = '',
}) {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')

  const scrollRef = useRef(null)
  const topSentinelRef = useRef(null)
  const prevConvIdRef = useRef(null)
  const prevScrollHeightRef = useRef(0)
  const prevFirstIdRef = useRef(null)
  const prevLenRef = useRef(0)
  const nearBottomRef = useRef(true)

  const username =
    conversation.name
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, '.') || t('common.unknownHandle')

  // Positionnement du scroll après chaque mise à jour des messages :
  // - changement de conversation → on va en bas (message le plus récent)
  // - ajout en tête (messages plus anciens) → on préserve la position visible
  // - nouveau message en bas → on suit seulement si on était déjà en bas
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const prevHeight = prevScrollHeightRef.current
    const curFirstId = messages[0]?.id ?? null
    const grew = messages.length > prevLenRef.current
    const prependedOlder = grew && prevFirstIdRef.current && curFirstId !== prevFirstIdRef.current

    if (prevConvIdRef.current !== conversation.id) {
      el.scrollTop = el.scrollHeight
      if (messages.length > 0) prevConvIdRef.current = conversation.id
    } else if (prependedOlder) {
      // Le contenu ajouté au-dessus décale la vue : on compense pour rester
      // ancré sur le message précédemment visible.
      el.scrollTop = el.scrollTop + (el.scrollHeight - prevHeight)
    } else if (nearBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }

    prevScrollHeightRef.current = el.scrollHeight
    prevFirstIdRef.current = curFirstId
    prevLenRef.current = messages.length
  }, [messages, conversation.id])

  // Scroll infini inversé : on charge les messages plus anciens quand le haut
  // de la liste devient visible.
  useEffect(() => {
    const sentinel = topSentinelRef.current
    const root = scrollRef.current
    if (!sentinel || !root) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreMessages && !loadingOlderMessages) {
          onLoadOlder?.()
        }
      },
      // rootMargin haut : on précharge avant d'atteindre tout en haut.
      { root, threshold: 0, rootMargin: '300px 0px 0px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMoreMessages, loadingOlderMessages, onLoadOlder])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  function handleSend() {
    if (!inputValue.trim()) return
    onSendMessage?.(inputValue)
    setInputValue('')
    // L'envoi doit ramener l'utilisateur en bas quand le message revient.
    nearBottomRef.current = true
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <section className={`flex min-h-0 flex-1 flex-col bg-[var(--color-bg-primary)] ${className}`}>
      {/* Header */}
      <div className="z-10 flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 sm:px-5">
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
            aria-label={labels.back}
          >
            <FiChevronLeft />
          </button>
        )}
        <Avatar imageUrl={conversation.imageUrl} size={40} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-text-primary)]">{conversation.name}</p>
          <p className="truncate text-xs text-[var(--color-text-secondary)]">@{username}</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
      >
        <div ref={topSentinelRef} className="h-px" />
        {loadingOlderMessages && (
          <p className="py-1 text-center text-xs text-[var(--color-text-secondary)]">
            {t('common.loading')}
          </p>
        )}
        {messages.map((message, i) => (
          <ChatBubble
            key={message.id}
            {...message}
            isFirstInGroup={!sameGroup(messages[i - 1], message)}
            isLastInGroup={!sameGroup(message, messages[i + 1])}
          />
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
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-text-title)] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            aria-label={labels.send}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </section>
  )
}
