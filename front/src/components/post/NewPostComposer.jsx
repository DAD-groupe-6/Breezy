"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiImage, FiVideo } from 'react-icons/fi'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import { getCurrentUserId } from '@/utils/auth'
import { useTranslation } from '@/hooks/useTranslation'
import Avatar from '@/components/Avatar'
import Button from '@/components/ui/Button'

const MAX_LENGTH = 300

export default function NewPostComposer() {
  const router = useRouter()
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [mediaType, setMediaType] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [author, setAuthor] = useState(null)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) {
      setAuthor(null)
      return
    }

    api.get(`/user/${userId}`)
      .then((res) => setAuthor(res.data))
      .catch(() => setAuthor(null))
  }, [])

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
      setError(err.response?.data?.message || t('pages.newPost.networkError'))
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
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        {error && (
          <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-500">
            {error}
          </p>
        )}

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <Avatar imageUrl={author?.img_profile || null} size={44} />
            </div>

            <div className="w-full">
              <label htmlFor="post-content" className="sr-only">
                {t('pages.newPost.contentLabel')}
              </label>
              <textarea
                id="post-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={t('pages.newPost.contentPlaceholder')}
                rows={8}
                className="w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-text-title)]"
              />

              {mediaType && (
                <div
                  className="mt-3 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-4 py-6 text-center"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {mediaType === 'photo' ? t('pages.newPost.dropPhoto') : t('pages.newPost.dropVideo')}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {mediaType === 'photo' ? t('pages.newPost.dropHintPhoto') : t('pages.newPost.dropHintVideo')}
                  </p>
                  {selectedFile && (
                    <p className="mt-3 text-xs font-medium text-[var(--color-text-title)]">
                      {t('pages.newPost.selectedFile')} {selectedFile.name}
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
                {t('pages.newPost.photo')}
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
                {t('pages.newPost.video')}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <p className={`text-xs ${content.length > MAX_LENGTH ? 'text-rose-500' : 'text-[var(--color-text-secondary)]'}`}>
                {content.length}/{MAX_LENGTH}
              </p>
              <Button onClick={handlePublish} disabled={!canPublish || loading}>
                {loading ? t('pages.newPost.publishing') : t('pages.newPost.publish')}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}