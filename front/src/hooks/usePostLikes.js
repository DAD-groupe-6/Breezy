import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from '@/hooks/useTranslation'

export function usePostLikes(postId, initialLiked, initialCount) {
  const router = useRouter()
  const toast = useToast()
  const { t } = useTranslation()
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
      // 403 = le rôle de l'utilisateur n'a pas la permission `like_post`.
      const message = err.response?.status === 403 ? t('toasts.likeForbidden') : t('toasts.likeError')
      toast.error(message)
      console.error('[usePostLikes] Échec du like/unlike du post', err)
    } finally {
      setLoading(false)
    }
  }

  return { liked, count, toggle }
}
