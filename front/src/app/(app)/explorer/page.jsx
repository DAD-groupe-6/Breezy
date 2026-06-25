"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import SearchBar from '@/components/navigation/SearchBar'
import Post from '../../../components/post/Post'
import ProfileCard from '@/components/profile/ProfileCard'
import ScrollToTopButton from '@/components/post/ScrollToTopButton'
import api from '@/utils/api'
import { getCurrentUserId } from '@/utils/auth'
import { resolveAuthor } from '@/utils/authors'
import { timeAgo } from '@/utils/time'

const SEARCH_LIMIT = 10

function readQueryFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('q') || ''
}

export default function ExplorerPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchType, setSearchType] = useState(null) // 'tag', 'profile', 'content'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const [followingIds, setFollowingIds] = useState(() => new Set())
  const { t } = useTranslation()
  const searchTimeoutRef = useRef(null)
  const sentinelRef = useRef(null)
  // Permet d'accéder aux valeurs courantes depuis l'IntersectionObserver sans re-créer l'observer
  const stateRef = useRef({})
  stateRef.current = { query, searchType, searchPage, hasMore, isLoading }

  useEffect(() => {
    const initialQuery = readQueryFromUrl()
    if (initialQuery) setQuery(initialQuery)

    const handlePopState = () => {
      setQuery(readQueryFromUrl())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    let cancelled = false
    const myId = getCurrentUserId()
    api.get('/user/suggestions', { params: { userId: myId, limit: 5 } })
      .then(res => { if (!cancelled) setSuggestions(res.data || []) })
      .catch(() => { if (!cancelled) setSuggestions([]) })
      .finally(() => { if (!cancelled) setSuggestionsLoading(false) })
    if (myId) {
      api.get(`/user/${myId}/following`)
        .then(res => { if (!cancelled) setFollowingIds(new Set((res.data?.following || []).map(String))) })
        .catch(() => {})
    }
    return () => { cancelled = true }
  }, [])

  const handleFollowChange = useCallback((userId, isFollowing) => {
    setFollowingIds((prev) => {
      const next = new Set(prev)
      if (isFollowing) next.add(String(userId))
      else next.delete(String(userId))
      return next
    })
  }, [])

  const determineSearchType = (q) => {
    if (!q.trim()) return null
    if (q.startsWith('#')) return 'tag'
    if (q.startsWith('@')) return 'profile'
    return 'content'
  }

  const fetchResults = useCallback(async (searchQuery, p) => {
    const type = determineSearchType(searchQuery)
    if (!type) return

    setIsLoading(true)
    if (p === 1) setError('')

    try {
      if (type === 'tag') {
        const tag = searchQuery.slice(1).trim()
        if (!tag) { setResults([]); return }
        const { data } = await api.get(`/post/search/tags/${encodeURIComponent(tag)}`, {
          params: { page: p, limit: SEARCH_LIMIT },
        })
        const enriched = await Promise.all(
          data.posts.map(async (post) => ({ ...post, author: await resolveAuthor(post.id_user) }))
        )
        setResults((prev) => (p === 1 ? enriched : [...prev, ...enriched]))
        setHasMore(data.hasMore)
        setSearchPage(p)
      } else if (type === 'profile') {
        const pseudo = searchQuery.slice(1).trim()
        if (!pseudo) { setResults([]); return }
        const { data } = await api.get(`/user/search`, { params: { pseudo_uniq: pseudo } })
        setResults(Array.isArray(data) ? data : [])
        setHasMore(false)
        setSearchPage(1)
      } else {
        const { data } = await api.get(`/post/search/content`, {
          params: { keywords: searchQuery, page: p, limit: SEARCH_LIMIT },
        })
        const enriched = await Promise.all(
          data.posts.map(async (post) => ({ ...post, author: await resolveAuthor(post.id_user) }))
        )
        setResults((prev) => (p === 1 ? enriched : [...prev, ...enriched]))
        setHasMore(data.hasMore)
        setSearchPage(p)
      }
    } catch (err) {
      console.error('[ExplorerPage] Erreur de recherche:', err)
      setError(t('pages.explorer.searchError') || 'Erreur lors de la recherche')
      if (p === 1) setResults([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [t])

  // Recherche avec debounce — reset à la page 1 à chaque nouveau terme
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    const type = determineSearchType(query)
    setSearchType(type)

    if (!query.trim()) {
      setResults([])
      setHasMore(false)
      setSearchPage(1)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      setResults([])
      setHasMore(false)
      setSearchPage(1)
      fetchResults(query, 1)
    }, 300)

    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [query, fetchResults])

  // Chargement automatique à l'approche du bas de la liste
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => {
      const { query: q, searchPage: p, hasMore: more, isLoading: loading } = stateRef.current
      if (entry.isIntersecting && more && !loading) fetchResults(q, p + 1)
    }, { threshold: 0.1 })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchResults])

  const handleDelete = (postId) => setResults((prev) => prev.filter((item) => (item._id || item.id) !== postId))

  return (
    <div className="relative min-h-full overflow-hidden bg-[var(--color-bg-primary)] px-4 py-6 text-[var(--color-text-primary)] md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[var(--color-text-title)]/12 blur-3xl" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-[var(--color-bg-surface-2)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        <div
          className="mt-8 rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
        >
          <SearchBar
            id="explorer-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('pages.explorer.searchPlaceholder')}
            className="w-full"
          />

          {/* Suggestions (aucune recherche en cours) */}
          {!query.trim() && (suggestionsLoading || suggestions.length > 0) && (
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {t('pages.explorer.suggestionsTitle')}
              </h2>
              {suggestionsLoading ? (
                <div className="text-center text-sm text-[var(--color-text-secondary)]">
                  {t('pages.explorer.searching')}
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
                  <div className="divide-y divide-[var(--color-border)]">
                    {suggestions.map((user) => (
                      <ProfileCard
                        key={user.id_user}
                        userId={user.id_user}
                        displayName={user.pseudo}
                        username={user.pseudo_uniq}
                        imageUrl={user.img_profile}
                        bio={user.bio}
                        initialFollowing={followingIds.has(String(user.id_user))}
                        onFollowChange={handleFollowChange}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-500">
              {error}
            </div>
          )}

          {!isLoading && query.trim() && results.length === 0 && !error && (
            <div className="mt-6 text-center text-[var(--color-text-secondary)]">
              {t('pages.explorer.noResults') || 'Aucun résultat trouvé'}
            </div>
          )}

          {!isLoading && query.trim() && results.length > 0 && (
            <div className="mt-4 text-xs text-[var(--color-text-secondary)]">
              {searchType === 'tag' && `Résultats pour le tag : #${query.slice(1).trim()}`}
              {searchType === 'profile' && `Résultats pour le profil : @${query.slice(1).trim()}`}
              {searchType === 'content' && `Résultats pour : "${query}"`}
            </div>
          )}

          {/* Résultats posts (contenu ou tags) */}
          {(searchType === 'content' || searchType === 'tag') && results.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border)]">
              <div className="divide-y divide-[var(--color-border)]">
                {results.map((post) => (
                  <Post
                    key={post._id}
                    postId={post._id}
                    authorId={post.id_user}
                    displayName={post.author?.pseudo || t('common.unknownUser')}
                    username={post.author?.pseudo_uniq || t('common.unknownHandle')}
                    imageUrl={post.author?.img_profile || null}
                    timestamp={timeAgo(post.createdAt, t)}
                    content={post.content}
                    images={post.images}
                    video={post.video}
                    likes={post.nb_like}
                    liked={post.likedByMe}
                    comments={post.commentsCount}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              <div ref={sentinelRef} className="py-2 text-center text-sm text-[var(--color-text-secondary)]">
                {isLoading && t('common.loading')}
              </div>
            </div>
          )}

          {/* Résultats profils */}
          {searchType === 'profile' && results.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border)]">
              <div className="divide-y divide-[var(--color-border)]">
                {results.map((user) => (
                  <ProfileCard
                    key={user.id_user}
                    userId={user.id_user}
                    displayName={user.pseudo}
                    username={user.pseudo_uniq}
                    imageUrl={user.img_profile}
                    bio={user.bio}
                    initialFollowing={followingIds.has(String(user.id_user))}
                    onFollowChange={handleFollowChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Spinner initial (aucun résultat encore affiché) */}
          {isLoading && results.length === 0 && (
            <div className="mt-6 text-center text-[var(--color-text-secondary)]">
              {t('pages.explorer.searching') || 'Recherche en cours...'}
            </div>
          )}
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  )
}
