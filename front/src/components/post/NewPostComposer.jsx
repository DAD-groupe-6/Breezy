"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiImage, FiVideo, FiX } from 'react-icons/fi'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/hooks/useToast'
import { useCurrentProfile } from '@/providers/CurrentProfileProvider'
import { useAuth } from '@/providers/AuthProvider'
import Avatar from '@/components/user/Avatar'
import Button from '@/components/ui/Button'

const MAX_LENGTH = 300
const MAX_IMAGES = 4

export default function NewPostComposer() {
  const router = useRouter()
  const { t } = useTranslation()
  const toast = useToast()
  const { profile } = useCurrentProfile()
  const { hasPermission } = useAuth()
  const canAddImages = hasPermission('add_images')
  const canAddVideos = hasPermission('add_videos')
  const [content, setContent] = useState('')
  const [mediaType, setMediaType] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // Aperçus locaux des fichiers choisis (avant upload). On libère les URLs au changement.
  const previews = useMemo(
    () => selectedFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [selectedFiles]
  )
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews])

  const canPublish = useMemo(
    () =>
      (content.trim().length > 0 || selectedFiles.length > 0) &&
      content.length <= MAX_LENGTH,
    [content, selectedFiles]
  )

  async function handlePublish() {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      // On uploade chaque média au service Media, puis on rattache les URLs au post.
      let images = []
      let video = null
      if (mediaType === 'photo' && selectedFiles.length) {
        images = await Promise.all(
          selectedFiles.map((file) => {
            const formData = new FormData()
            formData.append('image', file)
            return api.post('/media', formData).then((res) => res.data.url)
          })
        )
      } else if (mediaType === 'video' && selectedFiles.length) {
        const formData = new FormData()
        formData.append('image', selectedFiles[0])
        const { data } = await api.post('/media', formData)
        video = data.url
      }
      await api.post('/post', { content, images, video })
      toast.success(t('toasts.postCreated'))
      setContent('')
      setMediaType(null)
      setSelectedFiles([])
    } catch (err) {
      toast.error(err.response?.data?.message || t('toasts.postCreateError'))
    } finally {
      setLoading(false)
    }
  }

  const addImages = (files) =>
    setSelectedFiles((prev) => [...prev, ...files].slice(0, MAX_IMAGES))

  const handleDrop = (event) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files || [])
    if (mediaType === 'photo') {
      const imgs = files.filter((f) => f.type.startsWith('image/'))
      if (imgs.length) addImages(imgs)
    } else if (mediaType === 'video') {
      const vid = files.find((f) => f.type.startsWith('video/'))
      if (vid) setSelectedFiles([vid])
    }
  }

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    if (mediaType === 'video') {
      setSelectedFiles(files.slice(0, 1))
    } else {
      addImages(files)
    }
    event.target.value = '' // permet de re-sélectionner le même fichier ensuite
  }

  const removeImage = (index) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))

  const activatePhoto = () => {
    if (mediaType !== 'photo') setSelectedFiles([])
    setMediaType('photo')
    imageInputRef.current?.click()
  }

  const activateVideo = () => {
    setMediaType('video')
    setSelectedFiles([])
    videoInputRef.current?.click()
  }

  return (
    <main className="min-h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <Avatar imageUrl={profile?.img_profile || null} size={44} />
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

                  {mediaType === 'photo' && previews.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {previews.map((preview, index) => (
                        <div
                          key={preview.url}
                          className="relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--color-border)]"
                        >
                          <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            aria-label={t('pages.newPost.removeImage')}
                            className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      {previews.length < MAX_IMAGES && (
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-2xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-title)]"
                          aria-label={t('pages.newPost.addImage')}
                        >
                          +
                        </button>
                      )}
                    </div>
                  )}

                  {mediaType === 'video' && selectedFiles[0] && (
                    <p className="mt-3 text-xs font-medium text-[var(--color-text-title)]">
                      {t('pages.newPost.selectedFile')} {selectedFiles[0].name}
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
                multiple
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

              {canAddImages && (
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
              )}
              {canAddVideos && (
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
              )}
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
