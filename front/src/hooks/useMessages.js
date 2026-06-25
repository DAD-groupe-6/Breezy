'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import {
  getConversations,
  getConversation,
  startConversation,
  deleteConversation as apiDeleteConversation,
  getMessages as fetchMessages,
  markAsRead,
} from '@/utils/messageApi'
import { createMessageSocket } from '@/utils/socket'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'maintenant'
  if (diffMin < 60) return `${diffMin} min`
  if (diffMs < 24 * 60 * 60 * 1000)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const days = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
  if (diffMs < 7 * 24 * 60 * 60 * 1000) return days[date.getDay()]
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

const MESSAGES_PAGE_SIZE = 50

function normalizeMessage(msg, myId) {
  return {
    id: msg._id,
    from: String(msg.senderId) === String(myId) ? 'me' : 'them',
    text: msg.content,
    time: formatTime(msg.createdAt),
    createdAt: msg.createdAt,
    readAt: msg.readAt || null,
  }
}

async function enrichConversation(conv, myId) {
  const otherId = conv.participants.find((p) => String(p) !== String(myId))
  let otherUser = { pseudo: 'Utilisateur', pseudo_uniq: null, img_profile: null }
  try {
    const r = await api.get(`/user/${otherId}`)
    otherUser = r.data
  } catch {}
  return {
    id: conv._id,
    name: otherUser.pseudo,
    username: otherUser.pseudo_uniq,
    imageUrl: otherUser.img_profile,
    preview: conv.lastMessage || '',
    time: formatTime(conv.lastMessageAt),
    recipientId: otherId,
    unreadCount: conv.unreadCount || 0,
  }
}

export function useMessages({ initialRecipientId } = {}) {
  const token = getToken()
  const myId = useMemo(() => {
    try {
      return token ? String(jwtDecode(token).id) : null
    } catch {
      return null
    }
  }, [token])

  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false)

  const socketRef = useRef(null)
  const selectedIdRef = useRef(null)
  const myIdRef = useRef(myId)
  myIdRef.current = myId
  const messagesPageRef = useRef(1)
  const loadingOlderRef = useRef(false)

  // Chargement des conversations au montage
  useEffect(() => {
    if (!myId) return
    setLoadingConversations(true)
    getConversations()
      .then(async (res) => {
        const convs = res.data || []
        const enriched = await Promise.all(convs.map((c) => enrichConversation(c, myId)))
        setConversations(enriched)
      })
      .catch(() => setConversations([]))
      .finally(() => setLoadingConversations(false))
  }, [myId])

  // Connexion socket.io
  useEffect(() => {
    if (!token) return
    const socket = createMessageSocket()

    socket.on('message_received', (msg) => {
      const normalized = normalizeMessage(msg, myIdRef.current)
      const isActive = selectedIdRef.current && String(msg.conversationId) === String(selectedIdRef.current)
      const isFromMe = normalized.from === 'me'

      // Ajouter aux messages si la conv est active (déduplique)
      if (isActive) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === normalized.id)) return prev
          return [...prev, normalized]
        })

        // La conversation est déjà ouverte : le message est lu immédiatement.
        // On le signale au serveur (mise à jour BDD + accusé de lecture pour
        // l'expéditeur) sans attendre un rechargement de la page.
        if (!isFromMe) {
          socket.emit('mark_read', { conversationId: msg.conversationId })
        }
      }

      // Mettre à jour l'aperçu et le compteur de non-lus
      setConversations((prev) => {
        const exists = prev.some((c) => String(c.id) === String(msg.conversationId))
        if (!exists) {
          getConversation(msg.conversationId)
            .then(async (res) => {
              const enriched = await enrichConversation(res.data, myIdRef.current)
              setConversations((prev2) => {
                if (prev2.some((c) => String(c.id) === String(enriched.id))) return prev2
                return [{
                  ...enriched,
                  preview: msg.content,
                  time: formatTime(msg.createdAt),
                  unreadCount: isFromMe ? 0 : 1,
                }, ...prev2]
              })
            })
            .catch(() => {})
          return prev
        }
        return prev.map((c) => {
          if (String(c.id) !== String(msg.conversationId)) return c
          return {
            ...c,
            preview: msg.content,
            time: formatTime(msg.createdAt),
            // N'incrémente le compteur que si le message vient de l'autre et que la conv n'est pas active
            unreadCount: (!isFromMe && !isActive) ? (c.unreadCount || 0) + 1 : c.unreadCount,
          }
        })
      })
    })

    // Quand l'autre participant ouvre la conversation → mes messages sont lus → passer à ✓✓
    socket.on('messages_read', ({ conversationId }) => {
      if (String(conversationId) === String(selectedIdRef.current)) {
        const readAt = new Date().toISOString()
        setMessages((prev) =>
          prev.map((m) => (m.from === 'me' && !m.readAt ? { ...m, readAt } : m))
        )
      }
    })

    socketRef.current = socket
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  const selectConversation = useCallback((conversationId) => {
    const id = String(conversationId)
    setSelectedId(id)
    selectedIdRef.current = id
    setMessages([])
    setLoadingMessages(true)
    messagesPageRef.current = 1
    setHasMoreMessages(false)

    // Réinitialiser le compteur non-lus localement
    setConversations((prev) =>
      prev.map((c) => String(c.id) === id ? { ...c, unreadCount: 0 } : c)
    )

    socketRef.current?.emit('join_conversation', conversationId)

    fetchMessages(conversationId, 1)
      .then((res) => {
        const batch = res.data || []
        // Le back renvoie la page la plus récente (ordre décroissant) → on
        // ré-inverse pour afficher du plus ancien au plus récent.
        const msgs = batch.map((m) => normalizeMessage(m, myIdRef.current)).reverse()
        setMessages(msgs)
        setHasMoreMessages(batch.length === MESSAGES_PAGE_SIZE)
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false))

    markAsRead(conversationId).catch(() => {})
  }, [])

  // Charge la page suivante (messages plus anciens) et les ajoute en tête
  const loadOlderMessages = useCallback(async () => {
    const conversationId = selectedIdRef.current
    if (!conversationId || loadingOlderRef.current) return
    loadingOlderRef.current = true
    setLoadingOlderMessages(true)

    const nextPage = messagesPageRef.current + 1
    try {
      const res = await fetchMessages(conversationId, nextPage)
      const batch = res.data || []
      const older = batch.map((m) => normalizeMessage(m, myIdRef.current)).reverse()
      if (older.length > 0) {
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id))
          const deduped = older.filter((m) => !existing.has(m.id))
          return [...deduped, ...prev]
        })
        messagesPageRef.current = nextPage
      }
      setHasMoreMessages(batch.length === MESSAGES_PAGE_SIZE)
    } catch {
      // on conserve l'état courant en cas d'échec
    } finally {
      loadingOlderRef.current = false
      setLoadingOlderMessages(false)
    }
  }, [])

  // Auto-ouverture depuis ?with=
  useEffect(() => {
    if (!initialRecipientId || !myId) return
    startConversation(initialRecipientId)
      .then(async (res) => {
        const enriched = await enrichConversation(res.data, myId)
        setConversations((prev) => {
          if (prev.some((c) => String(c.id) === String(enriched.id))) return prev
          return [enriched, ...prev]
        })
        selectConversation(res.data._id)
      })
      .catch(() => {})
  }, [initialRecipientId, myId, selectConversation])

  const sendMessage = useCallback((content) => {
    if (!content?.trim() || !selectedIdRef.current || !socketRef.current) return
    socketRef.current.emit('send_message', {
      conversationId: selectedIdRef.current,
      content: content.trim(),
    })
  }, [])

  const startNewConversation = useCallback(async (recipientId) => {
    const res = await startConversation(recipientId)
    const enriched = await enrichConversation(res.data, myIdRef.current)
    setConversations((prev) => {
      if (prev.some((c) => String(c.id) === String(enriched.id))) return prev
      return [enriched, ...prev]
    })
    selectConversation(res.data._id)
  }, [selectConversation])

  const removeConversation = useCallback(async (conversationId) => {
    await apiDeleteConversation(conversationId)
    setConversations((prev) => prev.filter((c) => String(c.id) !== String(conversationId)))
    if (String(selectedIdRef.current) === String(conversationId)) {
      setSelectedId(null)
      selectedIdRef.current = null
      setMessages([])
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
    selectedIdRef.current = null
    setMessages([])
  }, [])

  const selectedConversation = useMemo(
    () => conversations.find((c) => String(c.id) === String(selectedId)) ?? null,
    [conversations, selectedId]
  )

  return {
    myId,
    selectedId,
    selectedConversation,
    messages,
    filteredConversations: conversations,
    selectConversation,
    startNewConversation,
    clearSelection,
    sendMessage,
    removeConversation,
    loadOlderMessages,
    hasMoreMessages,
    loadingOlderMessages,
    loadingConversations,
    loadingMessages,
  }
}
