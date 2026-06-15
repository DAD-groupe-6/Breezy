'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/utils/api'
import Post from '@/components/Post'
import AuthButtons from '@/components/auth/AuthButtons'
import { useTranslation } from '@/hooks/useTranslation'
import { timeAgo } from '@/utils/time'
import { resolveAuthor } from '@/utils/authors'
import { FiSettings } from 'react-icons/fi'

export default function Home() {
  const { t } = useTranslation()
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
      setError(err.response?.data?.message || 'Impossible de charger le feed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 backdrop-blur">
        <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
          <h1 className="text-lg font-bold text-[var(--color-text-title)]">{t('pages.home.title')}</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              aria-label={t('nav.settings')}
              className="p-2 rounded-full hover:bg-[var(--color-bg-surface)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-title)]"
            >
              <FiSettings size={20} />
            </Link>
            <AuthButtons />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {posts.map((post) => (
            <Post
              key={post._id}
              postId={post._id}
              authorId={post.id_user}
              displayName={post.author?.pseudo || 'Utilisateur inconnu'}
              username={post.author?.pseudo_uniq || 'inconnu'}
              imageUrl={post.author?.img_profile || null}
              timestamp={timeAgo(post.createdAt)}
              content={post.content}
              likes={post.nb_like}
              liked={post.likedByMe}
              comments={post.commentsCount}
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
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
    </main>
  )
}
