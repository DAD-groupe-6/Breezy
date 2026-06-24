'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import Post from '@/components/post/Post'
import { timeAgo } from '@/utils/time'
import { resolveAuthor } from '@/utils/authors'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/providers/AuthProvider'

export default function Home() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { user, loading } = useAuth()
  const [posts, setPosts] = useState([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPosts = useCallback(async () => {
    if (!user?.id) return

    setFeedLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/post/recommendations/${user.id}`)
      const enriched = await Promise.all(
        data.posts.map(async (post) => ({
          ...post,
          author: await resolveAuthor(post.id_user),
        }))
      )
      setPosts(enriched)
    } catch (err) {
      setError(err.response?.data?.message || t('pages.home.loadError'))
    } finally {
      setFeedLoading(false)
    }
  }, [user?.id, t])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  if (loading) {
    return (
      <section className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <section className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="text-center">{t('common.loading')}</div>
        </section>
      </section>
    )
  }

  return (
    <section className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <section className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {posts.map((post) => (
            <Post
              key={post._id}
              postId={post._id}
              authorId={post.id_user}
              displayName={post.author?.pseudo || t('common.unknownUser')}
              username={post.author?.pseudo_uniq || t('common.unknownHandle')}
              imageUrl={post.author?.img_profile || null}
              timestamp={timeAgo(post.createdAt, t, locale)}
              content={post.content}
              images={post.images}
              video={post.video}
              likes={post.nb_like}
              liked={post.likedByMe}
              comments={post.commentsCount}
              onViewProfile={() => router.push(`/profil/${post.id_user}`)}
              onReport={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))}

            {loading && (
                <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              {t('pages.home.loading')}
                </p>
            )}

            {!loading && error && (
                <p className="px-4 py-6 text-center text-sm text-rose-500">{error}</p>
            )}

          {!loading && !error && posts.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              {t('pages.home.empty')}
            </p>
          )}
        </div>
      </section>
    </section>
  )
}
