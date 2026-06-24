'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/providers/AuthProvider'
import SettingsCard from '@/components/settings/SettingsCard'
import LanguageSelector from '@/components/settings/LanguageSelector'
import ThemeSelector from '@/components/settings/ThemeSelector'
import AccountActions from '@/components/settings/AccountActions'
import Button from '@/components/ui/Button'

export default function SettingsPage() {
    const { t } = useTranslation()
    const { hasPermission } = useAuth()

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
                    {hasPermission('multi_language') && (
                        <SettingsCard
                            title={t('pages.settings.languageSection')}
                            description={t('pages.settings.languageDescription')}
                        >
                            <LanguageSelector />
                        </SettingsCard>
                    )}

                    {hasPermission('custom_theme') && (
                        <SettingsCard
                            title={t('pages.settings.themeSection')}
                            description={t('pages.settings.themeDescription')}
                        >
                            <ThemeSelector />
                        </SettingsCard>
                    )}

                    {hasPermission('manage_roles') && (
                        <SettingsCard
                            title={t('pages.settings.adminSection')}
                            description={t('pages.settings.adminDescription')}
                        >
                            <Link href="/admin">
                                <Button>{t('pages.settings.adminLink')}</Button>
                            </Link>
                        </SettingsCard>
                    )}

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