'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

const DURATIONS = [
  { labelKey: 'duration1d', value: 1 },
  { labelKey: 'duration7d', value: 7 },
  { labelKey: 'duration30d', value: 30 },
  { labelKey: 'duration90d', value: 90 },
  { labelKey: 'permanent', value: null },
]

export default function BanModal({ isOpen, onConfirm, onClose, loading = false }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(7)

  useEffect(() => {
    if (!isOpen) return
    setSelected(7)
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-title)' }}>
          {t('moderation.banUser')}
        </h2>

        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          {t('moderation.selectDuration')}
        </p>

        <div className="flex flex-col gap-2 mb-6">
          {DURATIONS.map(({ labelKey, value }) => (
            <button
              key={labelKey}
              type="button"
              onClick={() => setSelected(value)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer"
              style={{
                borderColor: selected === value ? 'var(--color-text-title)' : 'var(--color-border)',
                backgroundColor: selected === value ? 'var(--color-accent-soft)' : 'transparent',
                color: 'var(--color-text-primary)',
              }}
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                style={{ borderColor: selected === value ? 'var(--color-text-title)' : 'var(--color-border)' }}
              >
                {selected === value && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--color-text-title)' }}
                  />
                )}
              </span>
              {t(`moderation.${labelKey}`)}
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-full border text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            {t('moderation.cancel')}
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={loading}
            className="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            {loading ? t('moderation.banning') : t('moderation.banConfirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
