"use client"

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import SearchBar from '@/components/navigation/SearchBar'
import Post from '../../../components/post/Post'
import ProfileCard from '@/components/profile/ProfileCard'
import ScrollToTopButton from '@/components/post/ScrollToTopButton'
import api from '@/utils/api'
import { getCurrentUserId } from '@/utils/auth'
import { resolveAuthor } from '@/utils/authors'
import { inferSearchKind, normalizeQueryForKind, normalizeSearchKind } from '@/utils/search'
import { timeAgo } from '@/utils/time'

const SEARCH_LIMIT = 10

function ExplorerPageInner({ urlQuery, urlKind, urlNav }) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(urlQuery)
  const [searchKind, setSearchKind] = useState(() => normalizeSearchKind(urlKind) || inferSearchKind(urlQuery))
  const [results, setResults] = useState([])
  const [searchType, setSearchType] = useState(null) // 'tag', 'profile', 'content'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const { t } = useTranslation()
  const searchTimeoutRef = useRef(null)
  const sentinelRef = useRef(null)
  const latestRequestIdRef = useRef(0)
  const latestNavRef = useRef(Number(urlNav) || 0)
  const allowOlderNavRef = useRef(false)
  // Permet d'accéder aux valeurs courantes depuis l'IntersectionObserver sans re-créer l'observer
  const stateRef = useRef({})
  stateRef.current = { query, searchType, searchPage, hasMore, isLoading }

  useEffect(() => {
    const handlePopState = () => {
      // Back/forward should be authoritative even if nav timestamp is older.
      allowOlderNavRef.current = true
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const incomingNav = Number(urlNav) || 0
    const allowOlderNav = allowOlderNavRef.current
    allowOlderNavRef.current = false

    if (incomingNav && incomingNav < latestNavRef.current && !allowOlderNav) {
      return
    }
    if (incomingNav) latestNavRef.current = incomingNav

    // Navigation/URL change: cancel pending work from previous query to avoid stale overwrites.
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    latestRequestIdRef.current += 1

    setQuery((prev) => (prev === urlQuery ? prev : urlQuery))
    setSearchKind(normalizeSearchKind(urlKind) || inferSearchKind(urlQuery))
    setResults([])
    setHasMore(false)
    setSearchPage(1)
    setError('')
    setIsLoading(false)
  }, [urlQuery, urlKind, urlNav])

  useEffect(() => {
    let cancelled = false
    api.get('/user/suggestions', { params: { userId: getCurrentUserId(), limit: 5 } })
      .then(res => { if (!cancelled) setSuggestions(res.data || []) })
      .catch(() => { if (!cancelled) setSuggestions([]) })
      .finally(() => { if (!cancelled) setSuggestionsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const determineSearchType = (q, explicitKind) => {
    if (!q.trim()) return null
    return normalizeSearchKind(explicitKind) || inferSearchKind(q)
  }

  const syncUrlFromQuery = useCallback((nextQuery, nextKind) => {
    const normalizedKind = normalizeSearchKind(nextKind)
    const normalizedQuery = nextQuery
    const currentKind = normalizeSearchKind(urlKind)

    if (normalizedQuery === urlQuery && normalizedKind === currentKind) return

    const params = new URLSearchParams()
    if (normalizedQuery.trim()) {
      params.set('q', normalizedQuery)
      if (normalizedKind) params.set('kind', normalizedKind)
    }
    if (latestNavRef.current) params.set('nav', String(latestNavRef.current))

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [router, pathname, urlQuery, urlKind])

  const handleSearchInputChange = (e) => {
    const nextQuery = e.target.value
    setQuery(nextQuery)
    // During free typing we let backend infer the kind from q.
    setSearchKind(null)
    syncUrlFromQuery(nextQuery, null)
  }

  const fetchResults = useCallback(async (searchQuery, p) => {
    const requestedKind = determineSearchType(searchQuery, searchKind)
    if (!requestedKind) return
    const requestId = ++latestRequestIdRef.current

    setIsLoading(true)
    if (p === 1) setError('')

    try {
      const { data } = await api.get('/post/search', {
        params: { q: searchQuery, kind: requestedKind, page: p, limit: SEARCH_LIMIT },
      })
      if (latestRequestIdRef.current !== requestId) return

      const contractKind = data?.query?.kind || data?.kind
      const responseKind = determineSearchType(searchQuery, contractKind) || requestedKind
      const items = Array.isArray(data?.results)
        ? data.results
        : (Array.isArray(data?.items) ? data.items : [])
      const hasMore = data?.pagination?.hasMore ?? data?.hasMore

      if (responseKind === 'profile') {
        setResults((prev) => (p === 1 ? items : [...prev, ...items]))
      } else {
        const enriched = await Promise.all(
          items.map(async (post) => ({ ...post, author: await resolveAuthor(post.id_user) }))
        )
        if (latestRequestIdRef.current !== requestId) return
        setResults((prev) => (p === 1 ? enriched : [...prev, ...enriched]))
      }

      setHasMore(Boolean(hasMore))
      setSearchPage(p)
    } catch (err) {
      if (latestRequestIdRef.current !== requestId) return
      console.error('[ExplorerPage] Erreur de recherche:', err)
      setError(t('pages.explorer.searchError') || 'Erreur lors de la recherche')
      if (p === 1) setResults([])
      setHasMore(false)
    } finally {
      if (latestRequestIdRef.current === requestId) setIsLoading(false)
    }
  }, [t, searchKind])

  // Recherche avec debounce — reset à la page 1 à chaque nouveau terme
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    const type = determineSearchType(query, searchKind)
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

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [query, searchKind, fetchResults])

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
            onChange={handleSearchInputChange}
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
              {searchType === 'tag' && `Résultats pour le tag : #${normalizeQueryForKind(query, 'tag')}`}
              {searchType === 'profile' && `Résultats pour le profil : @${normalizeQueryForKind(query, 'profile')}`}
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

function ExplorerPageContent() {
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const urlKind = searchParams.get('kind') || null
  const urlNav = searchParams.get('nav') || null

  return (
    <ExplorerPageInner
      urlQuery={urlQuery}
      urlKind={urlKind}
      urlNav={urlNav}
    />
  )
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={null}>
      <ExplorerPageContent />
    </Suspense>
  )
}
