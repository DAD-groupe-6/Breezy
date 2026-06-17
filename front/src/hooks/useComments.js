import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import { getCurrentUserId } from '@/utils/auth'
import { resolveAuthor } from '@/utils/authors'
import { timeAgo } from '@/utils/time'
import { useTranslation } from '@/hooks/useTranslation'

export function useComments(postId, initialCount) {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const [list, setList] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [count, setCount] = useState(initialCount)

  const currentUserId = getCurrentUserId()

  const mapComment = async (c) => {
    const author = await resolveAuthor(c.id_user)
    return {
      id: c._id,
      displayName: author?.pseudo || 'Utilisateur inconnu',
      username: author?.pseudo_uniq || 'inconnu',
      timestamp: timeAgo(c.createdAt, t, locale),
      content: c.content,
      canDelete: c.id_user === currentUserId,
      likesCount: c.nb_like,
      liked: c.likedByMe,
    }
  }

  const load = async () => {
    if (loaded) return
    try {
      const { data } = await api.get(`/post/${postId}/comments`)
      const mapped = await Promise.all(data.map(mapComment))
      setList(mapped)
      setLoaded(true)
    } catch {
      // ignore
    }
  }

  const add = async (value) => {
    if (!getToken()) {
      router.push('/login')
      return
    }
    try {
      const { data } = await api.post(`/post/${postId}/comments`, { content: value })
      const mapped = await mapComment(data)
      setList((prev) => [mapped, ...prev])
      setCount((prev) => prev + 1)
    } catch {
      // ignore
    }
  }

  const remove = async (commentId) => {
    try {
      await api.delete(`/post/${postId}/comments/${commentId}`)
      setList((prev) => prev.filter((c) => c.id !== commentId))
      setCount((prev) => Math.max(0, prev - 1))
    } catch {
      // ignore
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
        ? await api.delete(`/post/${postId}/comments/${commentId}/like`)
        : await api.post(`/post/${postId}/comments/${commentId}/like`)
      setList((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, liked: data.likedByMe, likesCount: data.nb_like }
            : c
        )
      )
    } catch {
      // ignore
    }
  }

  return { list, count, load, add, remove, like }
}
