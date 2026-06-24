'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getToken } from '@/utils/cookie'
import { getConversations } from '@/utils/messageApi'
import { createMessageSocket } from '@/utils/socket'

const MessagesContext = createContext(null)

const totalUnread = (convs) => (convs || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0)

export function MessagesProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  // Vrai quand /messages est ouverte : la page pilote alors le compteur exact,
  // donc le socket global cesse d'incrémenter (évite le double comptage).
  const activeRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!getToken()) return
    try {
      const { data } = await getConversations()
      setUnreadCount(totalUnread(data))
    } catch (err) {
      console.error('[Messages] compteur non lus échoué', err)
    }
  }, [])

  useEffect(() => {
    const token = getToken()
    if (!token) return
    let myId = null
    try { myId = String(jwtDecode(token).id) } catch {}

    refresh()
    const socket = createMessageSocket()
    // Message reçu d'un autre utilisateur hors de la page → un non-lu de plus.
    const onMessage = (msg) => {
      if (!activeRef.current && String(msg.senderId) !== myId) {
        setUnreadCount((c) => c + 1)
      }
    }
    socket.on('message_received', onMessage)
    return () => {
      socket.off('message_received', onMessage)
      socket.disconnect()
    }
  }, [refresh])

  const setActive = useCallback((value) => { activeRef.current = value }, [])

  return (
    <MessagesContext.Provider value={{ unreadCount, setUnreadCount, setActive, refresh }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessagesBadge() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessagesBadge doit être utilisé dans <MessagesProvider>')
  return ctx
}
