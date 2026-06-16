'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/utils/api'
import Post from '@/components/post/Post'
import { timeAgo } from '@/utils/time'
import { resolveAuthor } from '@/utils/authors'
import { useTranslation } from '@/hooks/useTranslation'

export default function Home() {
  const { t, locale } = useTranslation()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/post')
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
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return (
    <section className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <section className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
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
              image={post.image}
              likes={post.nb_like}
              liked={post.likedByMe}
              comments={post.commentsCount}
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
        </div>
      </section>
    </section>
  )
}
