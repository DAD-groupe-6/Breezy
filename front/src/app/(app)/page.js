'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/utils/api'
import Post from '@/components/Post'
import { timeAgo } from '@/utils/time'
import { resolveAuthor } from '@/utils/authors'

export default function Home() {
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
            author: await resolveAuthor(post.authorId),
          }))
      )
      setPosts(enriched)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger le feed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return (
    <section className="min-h-full bg-transparent text-[var(--color-text-primary)]">
      <section className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface-2)]">
          {posts.map((post) => (
            <Post
              key={post._id}
              postId={post._id}
              displayName={post.author?.pseudo || 'Utilisateur inconnu'}
              username={post.author?.pseudo_uniq || 'inconnu'}
              imageUrl={post.author?.img_profile || null}
              timestamp={timeAgo(post.createdAt)}
              content={post.content}
              likes={post.likesCount}
              liked={post.likedByMe}
              comments={post.commentsCount}
            />
          ))}

            {loading && (
                <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                  Chargement…
                </p>
            )}

            {!loading && error && (
                <p className="px-4 py-6 text-center text-sm text-rose-500">{error}</p>
            )}

          {!loading && !error && posts.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              Aucun post pour le moment. Soyez le premier à publier !
            </p>
          )}
        </div>
      </section>
    </section>
  )
}