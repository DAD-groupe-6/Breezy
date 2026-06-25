'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Post from '@/components/post/Post'
import ScrollToTopButton from '@/components/post/ScrollToTopButton'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/providers/AuthProvider'
import { useRecommendedPosts } from '@/hooks/useRecommendedPosts'
import { timeAgo } from '@/utils/time'

export default function Home() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { user, loading } = useAuth()
  const { posts, hasMore, loading: feedLoading, loadMore, reset, removePost } = useRecommendedPosts(user?.id)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !feedLoading) loadMore()
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, feedLoading, loadMore])

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
              edited={post.edited}
              images={post.images}
              video={post.video}
              likes={post.nb_like}
              liked={post.likedByMe}
              comments={post.commentsCount}
              onViewProfile={() => router.push(`/profil/${post.id_user}`)}
              onReport={removePost}
              onDelete={removePost}
            />
          ))}

          {!feedLoading && posts.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              {t('pages.home.empty')}
            </p>
          )}

          {(feedLoading || hasMore) && (
            <div
              ref={sentinelRef}
              className={`${feedLoading ? 'py-2' : 'h-px'} text-center text-sm text-[var(--color-text-secondary)]`}
              aria-hidden={!feedLoading}
            >
              {feedLoading ? t('common.loading') : null}
            </div>
          )}
        </div>
      </section>

      <ScrollToTopButton onReset={reset} />
    </section>
  )
}
