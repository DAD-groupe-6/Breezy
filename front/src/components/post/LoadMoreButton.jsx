'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function LoadMoreButton({ onClick }) {
    const { t } = useTranslation()

    return (
        <div className="px-4 py-4 flex justify-center">
            <button
                type="button"
                onClick={onClick}
                className="rounded-full border border-[var(--color-border)] px-6 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)] transition-colors"
            >
                {t('pages.profil.loadMore')}
            </button>
        </div>
    )
}
