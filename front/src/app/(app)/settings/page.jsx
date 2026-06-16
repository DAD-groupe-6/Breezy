'use client'

import { useTranslation } from '@/hooks/useTranslation'
import SettingsCard from '@/components/settings/SettingsCard'
import LanguageSelector from '@/components/settings/LanguageSelector'
import AccountActions from '@/components/settings/AccountActions'

export default function SettingsPage() {
    const { t } = useTranslation()

<<<<<<< HEAD
  return (
    <div className="min-h-full bg-transparent p-6 text-[var(--color-text-primary)]">
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
=======
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] px-4 py-8">
            <div
                className="mx-auto w-full max-w-2xl rounded-2xl border p-6"
                style={{
                    backgroundColor: 'var(--color-bg-surface)',
>>>>>>> origin/dev
                    borderColor: 'var(--color-border)',
                }}
            >
                <div className="flex flex-col gap-5">
                    <SettingsCard
                        title={t('pages.settings.languageSection')}
                        description={t('pages.settings.languageDescription')}
                    >
                        <LanguageSelector />
                    </SettingsCard>

                    <SettingsCard
                        title={t('pages.settings.accountSection')}
                        description={t('pages.settings.accountDescription')}
                    >
                        <AccountActions />
                    </SettingsCard>
                </div>
            </div>
        </div>
    )
}