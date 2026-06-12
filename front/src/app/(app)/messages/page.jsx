'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function MessagesPage() {
  const { t } = useTranslation()
  return (
    <div className="p-6 text-[var(--color-text-primary)]">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('pages.messages.title')}</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">{t('pages.messages.empty')}</p>
    </div>
  )
}
