'use client'

import { useTranslation } from '@/hooks/useTranslation'
import SettingsCard from '@/components/settings/SettingsCard'
import LanguageSelector from '@/components/settings/LanguageSelector'
import AccountActions from '@/components/settings/AccountActions'

export default function SettingsPage() {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] px-4 py-8">
            <div
                className="mx-auto w-full max-w-2xl rounded-2xl border p-6"
                style={{
                    backgroundColor: 'var(--color-bg-surface)',
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