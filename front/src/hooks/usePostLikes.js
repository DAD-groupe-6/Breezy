import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'

export function usePostLikes(postId, initialLiked, initialCount) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!getToken()) {
      router.push('/login')
      return
    }
    if (loading) return

    setLoading(true)
    try {
      const { data } = liked
        ? await api.delete(`/post/${postId}/like`)
        : await api.post(`/post/${postId}/like`)
      setLiked(data.likedByMe)
      setCount(data.nb_like)
    } catch (err) {
      console.error('[usePostLikes] Échec du like/unlike du post', err)
    } finally {
      setLoading(false)
    }
  }

  return { liked, count, toggle }
}
