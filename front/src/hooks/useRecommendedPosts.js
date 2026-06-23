import { useState, useEffect, useCallback } from 'react'
import api from '@/utils/api'
import { resolveAuthor } from '@/utils/authors'
import { timeAgo } from '@/utils/time'
import { useTranslation } from '@/hooks/useTranslation'

const PAGE_SIZE = 10

export function useRecommendedPosts(userId) {
  const { t, locale } = useTranslation()
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)

  const mapPost = useCallback(
    async (post) => {
      const author = await resolveAuthor(post.id_user)
      return {
        ...post,
        author,
        timestamp: timeAgo(post.createdAt, t, locale),
      }
    },
    [t, locale]
  )

  const fetchPage = useCallback(
    async (p) => {
      if (!userId) return
      setLoading(true)
      try {
        const { data } = await api.get(`/post/recommendations/${userId}`, {
          params: { page: p, limit: PAGE_SIZE },
        })
        const mapped = await Promise.all(data.posts.map(mapPost))
        setPosts((prev) => (p === 1 ? mapped : [...prev, ...mapped]))
        setHasMore(data.hasMore)
        setPage(p)
      } catch (err) {
        console.error('[useRecommendedPosts] Échec du chargement', err)
        if (p === 1) setPosts([])
      } finally {
        setLoading(false)
      }
    },
    [userId, mapPost]
  )

  useEffect(() => {
    fetchPage(1)
  }, [fetchPage])

  const loadMore = () => fetchPage(page + 1)

  // Recharge depuis la page 1 (ex. : bouton "retour en haut")
  const reset = useCallback(() => {
    setPosts([])
    fetchPage(1)
  }, [fetchPage])

  const removePost = (id) => setPosts((prev) => prev.filter((p) => p._id !== id))

  return { posts, hasMore, loading, loadMore, reset, removePost }
}
