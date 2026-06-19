"use client"

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import SearchBar from '../../../components/SearchBar'
import Post from '../../../components/post/Post'
import ProfileCard from '../../../components/profil/ProfileCard'
import api from '@/utils/api'
import { getCurrentUserId } from '@/utils/auth'
import { timeAgo } from '@/utils/time'

export default function ExplorerPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchType, setSearchType] = useState(null) // 'tag', 'profile', 'content'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const { t } = useTranslation()
  const searchTimeoutRef = useRef(null)

  // Récupérer 5 utilisateurs suggérés (au hasard, non suivis) au chargement
  useEffect(() => {
    let cancelled = false
    const fetchSuggestions = async () => {
      try {
        const userId = getCurrentUserId()
        const response = await api.get('/user/suggestions', {
          params: { userId, limit: 5 },
        })
        if (!cancelled) setSuggestions(response.data || [])
      } catch (err) {
        console.error('[ExplorerPage] Erreur lors du chargement des suggestions:', err)
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setSuggestionsLoading(false)
      }
    }
    fetchSuggestions()
    return () => {
      cancelled = true
    }
  }, [])

  // Retirer un utilisateur des suggestions une fois suivi
  const handleSuggestionFollow = (userId) => {
    setSuggestions((prev) => prev.filter((u) => u.id_user !== userId))
  }

  // Récupérer les informations de l'auteur pour un post
  const fetchAuthorInfo = async (authorId) => {
    try {
      const response = await api.get(`/user/${authorId}`)
      return {
        displayName: response.data.pseudo,
        username: response.data.pseudo_uniq,
        imageUrl: response.data.img_profile,
      }
    } catch (err) {
      console.error('[ExplorerPage] Erreur lors de la récupération de l\'auteur:', err)
      return null
    }
  }

  // Enrichir les posts avec les informations de l'auteur
  const enrichPostsWithAuthorInfo = async (posts) => {
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        // Si l'auteur n'est pas inclus, le récupérer
        if (!post.author && post.id_user) {
          const authorInfo = await fetchAuthorInfo(post.id_user)
          return {
            ...post,
            author: authorInfo,
          }
        }
        return post
      })
    )
    return enrichedPosts
  }
  const determineSearchType = (searchQuery) => {
    if (!searchQuery.trim()) return null
    
    if (searchQuery.startsWith('#')) return 'tag'
    if (searchQuery.startsWith('@')) return 'profile'
    return 'content'
  }

  // Effectuer la recherche
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      setSearchType(null)
      setError('')
      return
    }

    const type = determineSearchType(searchQuery)
    setSearchType(type)
    setIsLoading(true)
    setError('')

    try {
      let response
      
      if (type === 'tag') {
        // Recherche par tag: enlever le # et chercher
        const tag = searchQuery.slice(1).trim()
        if (!tag) {
          setResults([])
          setIsLoading(false)
          return
        }
        response = await api.get(`/post/search/tags/${encodeURIComponent(tag)}`)
      } else if (type === 'profile') {
        // Recherche par profil: enlever le @ et chercher
        const pseudo = searchQuery.slice(1).trim()
        if (!pseudo) {
          setResults([])
          setIsLoading(false)
          return
        }
        response = await api.get(`/user/search`, { params: { pseudo_uniq: pseudo } })
      } else {
        // Recherche par contenu
        response = await api.get(`/post/search/content`, { params: { keywords: searchQuery } })
      }

      // Limiter à 10 résultats
      const limitedResults = response.data.slice(0, 10)
      
      // Enrichir les posts avec les informations de l'auteur si c'est une recherche de posts
      if (type === 'content' || type === 'tag') {
        const enrichedResults = await enrichPostsWithAuthorInfo(limitedResults)
        setResults(enrichedResults)
      } else {
        setResults(limitedResults)
      }
    } catch (err) {
      console.error('[ExplorerPage] Erreur de recherche:', err)
      setError(t('pages.explorer.searchError') || 'Erreur lors de la recherche')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce la recherche
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleDelete = (postId) => {
    setResults(results.filter(item => (item._id || item.id) !== postId))
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[var(--color-bg-primary)] px-4 py-6 text-[var(--color-text-primary)] md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[var(--color-text-title)]/12 blur-3xl" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-[var(--color-bg-surface-2)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        <SearchBar
          id="explorer-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('pages.explorer.searchPlaceholder')}
          className="mt-8 w-full"
        />

        {/* Onglet Suggestions : affiché tant qu'aucune recherche n'est en cours */}
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
              <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
                <div className="divide-y divide-[var(--color-border)]">
                  {suggestions.map((user) => (
                    <ProfileCard
                      key={user.id_user}
                      userId={user.id_user}
                      displayName={user.pseudo}
                      username={user.pseudo_uniq}
                      imageUrl={user.img_profile}
                      bio={user.bio}
                      onFollowChange={handleSuggestionFollow}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Afficher l'état de chargement ou les erreurs */}
        {isLoading && (
          <div className="mt-6 text-center text-[var(--color-text-secondary)]">
            {t('pages.explorer.searching') || 'Recherche en cours...'}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-500">
            {error}
          </div>
        )}

        {/* Afficher les résultats */}
        {!isLoading && query.trim() && results.length === 0 && !error && (
          <div className="mt-6 text-center text-[var(--color-text-secondary)]">
            {t('pages.explorer.noResults') || 'Aucun résultat trouvé'}
          </div>
        )}

        {/* Afficher le type de recherche en cours */}
        {!isLoading && query.trim() && results.length > 0 && (
          <div className="mt-4 text-xs text-[var(--color-text-secondary)]">
            {searchType === 'tag' && `Résultats pour le tag: #${query.slice(1).trim()}`}
            {searchType === 'profile' && `Résultats pour le profil: @${query.slice(1).trim()}`}
            {searchType === 'content' && `Résultats pour: "${query}"`}
            {results.length < 10 && ` (${results.length} résultat${results.length > 1 ? 's' : ''})`}
            {results.length === 10 && ` (10 premiers résultats)`}
          </div>
        )}

        {/* Résultats de posts (contenu ou tags) */}
        {!isLoading && (searchType === 'content' || searchType === 'tag') && results.length > 0 && (
          <div className="mt-6 border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="divide-y divide-[var(--color-border)]">
              {results.map((post) => {
                // Utiliser _id comme ID du post (format MongoDB)
                const postId = post._id || post.id
                // Mapper les attributs du post pour le composant Post
                const displayName = post.author?.displayName || post.displayName || 'Utilisateur'
                const username = post.author?.username || post.username || 'user'
                const imageUrl = post.author?.imageUrl || post.imageUrl
                const authorId = post.author?.id || post.author?.id_user || post.id_user

                return (
                  <Post
                    key={postId}
                    postId={postId}
                    authorId={authorId}
                    displayName={displayName}
                    username={username}
                    imageUrl={imageUrl}
                    timestamp={timeAgo(post.createdAt || post.timestamp, t)}
                    content={post.content}
                    image={post.image}
                    video={post.video}
                    likes={post.likes || 0}
                    liked={post.liked || false}
                    comments={post.commentsCount || post.comments || 0}
                    onDelete={handleDelete}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Résultats de profils */}
        {!isLoading && searchType === 'profile' && results.length > 0 && (
          <div className="mt-6 border border-[var(--color-border)] rounded-2xl overflow-hidden">
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
      </div>
    </div>
  )
}
