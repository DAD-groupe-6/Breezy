'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <div className="min-h-full bg-transparent p-6 text-[var(--color-text-primary)]">
      <h1 className="text-2xl font-bold text-[var(--color-text-title)] mb-6">
        {t('pages.settings.title')}
      </h1>

      <div
        className="max-w-lg rounded-2xl border p-6"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2
          className="text-base font-semibold mb-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t('pages.settings.languageSection')}
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t('pages.settings.languageDescription')}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setLocale('fr')}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer"
            style={
              locale === 'fr'
                ? {
                    backgroundColor: 'var(--color-text-title)',
                    borderColor: 'var(--color-text-title)',
                    color: 'var(--color-bg-surface)',
                  }
                : {
                    backgroundColor: 'transparent',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }
            }
          >
            {t('pages.settings.langFr')}
          </button>

          <button
            onClick={() => setLocale('en')}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer"
            style={
              locale === 'en'
                ? {
                    backgroundColor: 'var(--color-text-title)',
                    borderColor: 'var(--color-text-title)',
                    color: 'var(--color-bg-surface)',
                  }
                : {
                    backgroundColor: 'transparent',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }
            }
          >
            {t('pages.settings.langEn')}
          </button>
        </div>
      </div>
    </div>
  )
}
