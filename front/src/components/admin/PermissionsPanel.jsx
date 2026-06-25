'use client'

import { useTranslation } from '@/hooks/useTranslation'

// Les permissions (droits) sont définies par le code (seed Auth) : ce panneau est en
// lecture seule. La modification / suppression a été retirée volontairement.
export default function PermissionsPanel({ permissions }) {
    const { t } = useTranslation()

    return (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
            <h2 className="mb-4 text-lg text-[var(--color-text-title)] [font-weight:var(--font-weight-display)]">
                {t('pages.admin.permissionsTitle')}
            </h2>

            {permissions.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)]">{t('pages.admin.noPermissions')}</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {permissions.map((permission) => (
                        <div
                            key={permission.id}
                            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-2"
                        >
                            <p className="text-sm text-[var(--color-text-primary)]">{permission.name}</p>
                            {permission.description && (
                                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{permission.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
