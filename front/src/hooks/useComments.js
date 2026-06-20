import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import { getCurrentUserId } from '@/utils/auth'
import { resolveAuthor } from '@/utils/authors'
import { timeAgo } from '@/utils/time'
import { useTranslation } from '@/hooks/useTranslation'

// Nombre de commentaires/réponses récupérés par tranche (pagination serveur).
const PAGE_SIZE = 5

// Hook générique : gère les enfants directs d'un parent.
// - useComments(postId)    -> les commentaires d'un post (order 'desc' : récents en haut)
// - useComments(commentId, n, { order: 'asc' }) -> réponses (chronologique, nouvelles en bas)
export function useComments(parentId, initialCount, { order = 'desc' } = {}) {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const [list, setList] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [count, setCount] = useState(initialCount)

  const currentUserId = getCurrentUserId()

  const mapComment = useCallback(
    async (c) => {
      const author = await resolveAuthor(c.id_user)
      // Cible "↳ @pseudo" : on résout l'id_user visé en pseudo unique.
      let replyToName = null
      if (c.reply_to_user) {
        const target = await resolveAuthor(c.reply_to_user)
        replyToName = target?.pseudo_uniq || null
      }
      return {
        id: c._id,
        authorId: c.id_user,
        displayName: author?.pseudo || t('common.unknownUser'),
        username: author?.pseudo_uniq || t('common.unknownHandle'),
        timestamp: timeAgo(c.createdAt, t, locale),
        content: c.content,
        canDelete: String(c.id_user) === String(currentUserId),
        likesCount: c.nb_like,
        liked: c.likedByMe,
        repliesCount: c.commentsCount,
        replyToName,
      }
    },
    [t, locale, currentUserId]
  )

  const fetchPage = useCallback(
    async (p) => {
      setLoading(true)
      try {
        const { data } = await api.get(`/post/${parentId}/comments`, {
          params: { page: p, limit: PAGE_SIZE, order },
        })
        const mapped = await Promise.all(data.comments.map(mapComment))
        setList((prev) => (p === 1 ? mapped : [...prev, ...mapped]))
        setHasMore(data.hasMore)
        setPage(p)
        setLoaded(true)
      } catch (err) {
        console.error('[useComments] Échec du chargement des commentaires', err)
        if (p === 1) setList([])
      } finally {
        setLoading(false)
      }
    },
    [parentId, mapComment, order]
  )

  // Chargement de la 1re tranche, à la demande (lazy), une seule fois.
  const load = useCallback(() => {
    if (loaded) return
    fetchPage(1)
  }, [loaded, fetchPage])

  const loadMore = () => fetchPage(page + 1)

  // targetId = le noeud auquel on répond (par défaut le parent du hook).
  // Le serveur ré-ancre et calcule la cible "↳ @pseudo".
  const add = async (value, targetId) => {
    if (!getToken()) {
      router.push('/login')
      return
    }
    try {
      const { data } = await api.post(`/post/${targetId || parentId}/comments`, {
        content: value,
      })
      const mapped = await mapComment(data)
      // 'asc' (réponses) : la nouvelle va en bas ; 'desc' (commentaires) : en haut.
      setList((prev) => (order === 'asc' ? [...prev, mapped] : [mapped, ...prev]))
      setCount((prev) => (prev ?? 0) + 1)
    } catch (err) {
      console.error("[useComments] Échec de l'ajout du commentaire", err)
    }
  }

  const remove = async (commentId) => {
    try {
      await api.delete(`/post/${parentId}/comments/${commentId}`)
      setList((prev) => prev.filter((c) => c.id !== commentId))
      setCount((prev) => Math.max(0, (prev ?? 0) - 1))
    } catch (err) {
      console.error('[useComments] Échec de la suppression du commentaire', err)
    }
  }

  const like = async (commentId) => {
    if (!getToken()) {
      router.push('/login')
      return
    }
    const target = list.find((c) => c.id === commentId)
    if (!target) return
    try {
      const { data } = target.liked
        ? await api.delete(`/post/${parentId}/comments/${commentId}/like`)
        : await api.post(`/post/${parentId}/comments/${commentId}/like`)
      setList((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, liked: data.likedByMe, likesCount: data.nb_like }
            : c
        )
      )
    } catch (err) {
      console.error('[useComments] Échec du like/unlike du commentaire', err)
    }
  }

  return { list, count, hasMore, loading, load, loadMore, add, remove, like }
}
