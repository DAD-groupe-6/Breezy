import { useState, useEffect, useCallback } from 'react'
import api from '@/utils/api'
import { resolveAuthor } from '@/utils/authors'
import { timeAgo } from '@/utils/time'
import { useTranslation } from '@/hooks/useTranslation'

// Nombre de posts récupérés par tranche (pagination serveur)
const PAGE_SIZE = 5

export function useUserPosts(userId) {
  const { t, locale } = useTranslation()
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const mapPost = useCallback(
    async (post) => {
      const author = await resolveAuthor(post.id_user)
      return {
        postId: post._id,
        authorId: post.id_user,
        displayName: author?.pseudo || t('common.unknownUser'),
        username: author?.pseudo_uniq || t('common.unknownHandle'),
        imageUrl: author?.img_profile || null,
        timestamp: timeAgo(post.createdAt, t, locale),
        content: post.content,
        images: post.images,
        video: post.video || null,
        likes: post.nb_like,
        liked: post.likedByMe,
        comments: post.commentsCount,
      }
    },
    [t, locale]
  )

  const fetchPage = useCallback(
    async (p) => {
      setLoading(true)
      try {
        const { data } = await api.get(`/post/user/${userId}`, {
          params: { page: p, limit: PAGE_SIZE },
        })
        const mapped = await Promise.all(data.posts.map(mapPost))
        setPosts((prev) => (p === 1 ? mapped : [...prev, ...mapped]))
        setHasMore(data.hasMore)
        setTotal(data.total ?? 0)
        setPage(p)
      } catch (err) {
        console.error('[useUserPosts] Échec du chargement des posts', err)
        if (p === 1) setPosts([])
      } finally {
        setLoading(false)
      }
    },
    [userId, mapPost]
  )

  // Première tranche au changement de profil
  useEffect(() => {
    fetchPage(1)
  }, [fetchPage])

  const loadMore = () => fetchPage(page + 1)
  const reset = useCallback(() => { setPosts([]); fetchPage(1) }, [fetchPage])
  const removePost = (id) => setPosts((prev) => prev.filter((p) => p.postId !== id))

  return { posts, hasMore, loading, loadMore, reset, removePost, total }
}
