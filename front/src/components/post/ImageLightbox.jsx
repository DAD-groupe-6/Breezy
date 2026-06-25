"use client"

import { useEffect, useCallback } from 'react'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useTranslation } from '@/hooks/useTranslation'

export default function ImageLightbox({ images, index, onChange, onClose }) {
  const { t } = useTranslation()
  const count = images.length

  const goPrev = useCallback(
    (e) => {
      e?.stopPropagation()
      onChange((index - 1 + count) % count)
    },
    [index, count, onChange]
  )

  const goNext = useCallback(
    (e) => {
      e?.stopPropagation()
      onChange((index + 1) % count)
    },
    [index, count, onChange]
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('post.lightbox.close')}
        className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        <FiX size={24} />
      </button>

      {count > 1 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label={t('post.lightbox.prev')}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          <FiChevronLeft size={28} />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
      />

      {count > 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label={t('post.lightbox.next')}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          <FiChevronRight size={28} />
        </button>
      )}

      {count > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
