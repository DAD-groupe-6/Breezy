'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function LanguageSelector() {
    const { t, locale, setLocale } = useTranslation()

    const activeStyle = {
        backgroundColor: 'var(--color-text-title)',
        borderColor: 'var(--color-text-title)',
        color: 'var(--color-bg-surface)',
    }
    const inactiveStyle = {
        backgroundColor: 'transparent',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-secondary)',
    }

    return (
        <div className="flex gap-3">
            <button
                onClick={() => setLocale('fr')}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer"
                style={locale === 'fr' ? activeStyle : inactiveStyle}
            >
                {t('pages.settings.langFr')}
            </button>
            <button
                onClick={() => setLocale('en')}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer"
                style={locale === 'en' ? activeStyle : inactiveStyle}
            >
                {t('pages.settings.langEn')}
            </button>
        </div>
    )
}