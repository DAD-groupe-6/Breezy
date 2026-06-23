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

function normalizeMessage(msg, myId) {
  return {
    id: msg._id,
    from: String(msg.senderId) === String(myId) ? 'me' : 'them',
    text: msg.content,
    time: formatTime(msg.createdAt),
  }
}

async function enrichConversation(conv, myId) {
  const otherId = conv.participants.find((p) => String(p) !== String(myId))
  let otherUser = { pseudo: 'Utilisateur', img_profile: null }
  try {
    const r = await api.get(`/user/${otherId}`)
    otherUser = r.data
  } catch {}
  return {
    id: conv._id,
    name: otherUser.pseudo,
    imageUrl: otherUser.img_profile,
    preview: conv.lastMessage || '',
    time: formatTime(conv.lastMessageAt),
    recipientId: otherId,
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
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const socketRef = useRef(null)
  const selectedIdRef = useRef(null)
  const myIdRef = useRef(myId)
  myIdRef.current = myId

  // Load conversations on mount
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

  // Socket.io connection
  useEffect(() => {
    if (!token) return
    const socket = createMessageSocket()

    socket.on('message_received', (msg) => {
      const normalized = normalizeMessage(msg, myIdRef.current)

      // Append to messages if this is the active conversation (deduplicate)
      if (selectedIdRef.current && String(msg.conversationId) === String(selectedIdRef.current)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === normalized.id)) return prev
          return [...prev, normalized]
        })
      }

      // Update preview or add new conversation to list
      setConversations((prev) => {
        const exists = prev.some((c) => String(c.id) === String(msg.conversationId))
        if (!exists) {
          // New conversation received — fetch and add it
          getConversation(msg.conversationId)
            .then(async (res) => {
              const enriched = await enrichConversation(res.data, myIdRef.current)
              setConversations((prev2) => {
                if (prev2.some((c) => String(c.id) === String(enriched.id))) return prev2
                return [{ ...enriched, preview: msg.content, time: formatTime(msg.createdAt) }, ...prev2]
              })
            })
            .catch(() => {})
          return prev
        }
        return prev.map((c) =>
          String(c.id) === String(msg.conversationId)
            ? { ...c, preview: msg.content, time: formatTime(msg.createdAt) }
            : c
        )
      })
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

    socketRef.current?.emit('join_conversation', conversationId)

    fetchMessages(conversationId)
      .then((res) => {
        const msgs = (res.data || []).map((m) => normalizeMessage(m, myIdRef.current))
        setMessages(msgs)
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false))

    markAsRead(conversationId).catch(() => {})
  }, [])

  // Auto-open conversation when ?with= is provided
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

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredConversations = useMemo(() => {
    if (!normalizedQuery) return conversations
    return conversations.filter((c) =>
      `${c.name} ${c.preview}`.toLowerCase().includes(normalizedQuery)
    )
  }, [conversations, normalizedQuery])

  const selectedConversation = useMemo(
    () => conversations.find((c) => String(c.id) === String(selectedId)) ?? null,
    [conversations, selectedId]
  )

  return {
    myId,
    selectedId,
    selectedConversation,
    messages,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    selectConversation,
    startNewConversation,
    clearSelection,
    sendMessage,
    removeConversation,
    loadingConversations,
    loadingMessages,
  }
}
