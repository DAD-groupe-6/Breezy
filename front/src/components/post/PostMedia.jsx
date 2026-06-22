"use client"

import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useTranslation } from '@/hooks/useTranslation'
import ImageLightbox from './ImageLightbox'

export default function PostMedia({ images = [] }) {
  const { t } = useTranslation()
  const list = (images || []).filter(Boolean).slice(0, 4)
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (list.length === 0) return null

  const safeIndex = Math.min(current, list.length - 1)
  const multi = list.length > 1

  const go = (e, dir) => {
    e.stopPropagation()
    setCurrent((c) => (c + dir + list.length) % list.length)
  }

  return (
    <>
      <div className="relative mb-2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black/5">
        <img
          src={list[safeIndex]}
          alt={t('post.imageAlt')}
          onClick={(e) => {
            e.stopPropagation()
            setLightboxOpen(true)
          }}
          className="mx-auto max-h-[28rem] w-auto max-w-full cursor-zoom-in object-contain"
        />

        {multi && (
          <>
            <button
              type="button"
              onClick={(e) => go(e, -1)}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => go(e, 1)}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <FiChevronRight size={20} />
            </button>

            <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {safeIndex + 1}/{list.length}
            </span>

            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === safeIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={list}
          index={safeIndex}
          onChange={setCurrent}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
