'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import { getSocket } from '@/utils/socket'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const load = useCallback(async () => {
    if (!getToken()) return
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      console.error('[Notifications] chargement échoué', err)
    }
  }, [])

  useEffect(() => {
    load()
    const socket = getSocket()
    if (!socket) return

    const onNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev])
      setUnreadCount((count) => count + 1)
    }
    socket.on('notification', onNotification)
    return () => { socket.off('notification', onNotification) }
  }, [load])

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await api.patch('/notifications/read-all')
    } catch (err) {
      console.error('[Notifications] markAllRead échoué', err)
    }
  }, [unreadCount])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, reload: load }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications doit être utilisé dans <NotificationsProvider>')
  return ctx
}
