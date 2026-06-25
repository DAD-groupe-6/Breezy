'use client'

import { FiCheck, FiX, FiInfo } from 'react-icons/fi'
import { useTranslation } from '@/hooks/useTranslation'

const TYPES = {
  success: { Icon: FiCheck, titleKey: 'common.success', color: 'var(--color-status-success)' },
  error: { Icon: FiX, titleKey: 'common.error', color: 'var(--color-status-error)' },
  info: { Icon: FiInfo, titleKey: 'common.info', color: 'var(--color-status-info)' },
}

function ToastItem({ toast, onClose }) {
  const { t } = useTranslation()
  const { Icon, titleKey, color } = TYPES[toast.type] ?? TYPES.info
  const title = t(titleKey)

  return (
    <div
      role="status"
      className="flex items-center gap-[var(--space-md)] min-w-[320px] max-w-[420px] pl-[var(--space-sm)] pr-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-lg)]"
    >
      <span
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
        style={{ backgroundColor: color }}
      >
        <Icon size={22} strokeWidth={3} color="var(--color-status-on-status)" />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-base font-[var(--font-weight-bold)]" style={{ color }}>
          {title}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label={t('common.close')}
        className="shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
      >
        <FiX size={20} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed bottom-[var(--space-lg)] right-[var(--space-lg)] z-50 flex flex-col gap-[var(--space-sm)]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}
