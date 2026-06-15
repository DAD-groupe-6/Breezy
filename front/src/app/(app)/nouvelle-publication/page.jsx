"use client"

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { FiArrowLeft, FiImage, FiMapPin, FiSmile, FiVideo } from 'react-icons/fi'
import { getToken } from '@/utils/cookie'

const MAX_LENGTH = 300

export default function NewPublicationPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [mediaType, setMediaType] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const canPublish = useMemo(
    () => content.trim().length > 0 && content.length <= MAX_LENGTH,
    [content]
  )

  async function handlePublish() {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await api.post('/post', { content })
      router.push('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur réseau, réessaie plus tard')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (!file) return

    if (mediaType === 'photo' && file.type.startsWith('image/')) {
      setSelectedFile(file)
    }

    if (mediaType === 'video' && file.type.startsWith('video/')) {
      setSelectedFile(file)
    }
  }

  const handleFileSelection = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
  }

  const activatePhoto = () => {
    setMediaType('photo')
    setSelectedFile(null)
    imageInputRef.current?.click()
  }

  const activateVideo = () => {
    setMediaType('video')
    setSelectedFile(null)
    videoInputRef.current?.click()
  }

  return (
    <main className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
              aria-label="Retour à l'accueil"
            >
              <FiArrowLeft />
            </Link>
            <h1 className="text-xl font-bold text-[var(--color-text-title)] md:text-2xl">Nouvelle publication</h1>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish || loading}
            className="rounded-full bg-[var(--color-text-title)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Publication...' : 'Publier'}
          </button>
        </header>

        {error && (
          <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-500">
            {error}
          </p>
        )}

        <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-sm md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-surface-2)] text-sm font-semibold text-[var(--color-text-secondary)]">
              ZZ
            </div>

            <div className="w-full">
              <label htmlFor="post-content" className="sr-only">
                Contenu de la publication
              </label>
              <textarea
                id="post-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Quoi de neuf ?"
                rows={8}
                className="w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-text-title)]"
              />

              {mediaType && (
                <div
                  className="mt-3 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-6 text-center"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {mediaType === 'photo' ? 'Deposez votre photo ici' : 'Deposez votre video ici'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    ou cliquez sur le bouton {mediaType === 'photo' ? 'Photo' : 'Video'} pour selectionner un fichier
                  </p>
                  {selectedFile && (
                    <p className="mt-3 text-xs font-medium text-[var(--color-text-title)]">
                      Fichier selectionne: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelection}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelection}
              />

              <button
                type="button"
                onClick={activatePhoto}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  mediaType === 'photo'
                    ? 'bg-[var(--color-text-title)] text-white'
                    : 'bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-title)]'
                }`}
              >
                <FiImage />
                Photo
              </button>
              <button
                type="button"
                onClick={activateVideo}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  mediaType === 'video'
                    ? 'bg-[var(--color-text-title)] text-white'
                    : 'bg-[var(--color-bg-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-title)]'
                }`}
              >
                <FiVideo />
                Video
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-surface-2)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]">
                <FiSmile />
                Emoji
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-surface-2)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]">
                <FiMapPin />
                Lieu
              </button>
            </div>

            <p className={`text-xs ${content.length > MAX_LENGTH ? 'text-rose-500' : 'text-[var(--color-text-secondary)]'}`}>{content.length}/{MAX_LENGTH}</p>
          </div>
        </section>
      </div>
    </main>
  )
}