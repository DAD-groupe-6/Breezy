'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NotificationsView from '@/components/notifications/NotificationsView'
import { useNotifications } from '@/providers/NotificationsProvider'
import { useAuth } from '@/providers/AuthProvider'
import { resolveAuthor } from '@/utils/authors'

// Mappe le type stocké → clé de traduction existante (pages.notifications.actions.*)
const TYPE_TO_ACTION = {
  like: 'likedPhoto',
  comment: 'commentedPhoto',
  follow: 'startedFollowing',
  mention: 'mentionedYou',
}

export default function NotificationsPage() {
  const router = useRouter()
  const { hasPermission, permsLoaded } = useAuth()
  const { notifications, markAllRead } = useNotifications()
  const [enriched, setEnriched] = useState([])

  // Notifications désactivées pour ce rôle (receive_notifications absente) → redirection profil.
  const notifsDisabled = permsLoaded && !hasPermission('receive_notifications')
  useEffect(() => {
    if (notifsDisabled) router.replace('/profil')
  }, [notifsDisabled, router])

  // Ouvrir la page = tout marquer comme lu.
  useEffect(() => {
    if (notifsDisabled) return
    markAllRead()
  }, [notifsDisabled, markAllRead])

  // Résoudre le pseudo/avatar de l'acteur pour chaque notif.
  useEffect(() => {
    let cancelled = false
    async function enrich() {
      const result = await Promise.all(
        notifications.map(async (n) => {
          const author = await resolveAuthor(n.actorId)
          return {
            id: n.id,
            type: TYPE_TO_ACTION[n.type] || n.type,
            createdAt: n.createdAt,
            actorId: n.actorId,
            actor: {
              displayName: author?.pseudo || null,
              username: author?.pseudo_uniq || null,
              imageUrl: author?.img_profile || null,
            },
          }
        })
      )
      if (!cancelled) setEnriched(result)
    }
    enrich()
    return () => { cancelled = true }
  }, [notifications])

  if (notifsDisabled) return null

  return <NotificationsView notifications={enriched} />
}
