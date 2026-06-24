'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/providers/AuthProvider'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function AccountActions() {
    const { t } = useTranslation()
    const router = useRouter()
    const { logout } = useAuth()
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const handleDelete = async () => {
        // À brancher plus tard sur l'API de suppression de compte.
        logout()
        router.push('/register')
    }

    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={() => setLogoutOpen(true)}
                className="w-full py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer"
                style={{
                    backgroundColor: 'transparent',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                }}
            >
                {t('pages.settings.logout')}
            </button>
            <button
                onClick={() => setDeleteOpen(true)}
                className="w-full py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer text-rose-600"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'transparent' }}
            >
                {t('pages.settings.deleteAccount')}
            </button>

            <ConfirmDialog
                isOpen={logoutOpen}
                title={t('pages.settings.logoutConfirm.title')}
                message={t('pages.settings.logoutConfirm.message')}
                confirmLabel={t('pages.settings.logoutConfirm.confirm')}
                cancelLabel={t('pages.settings.logoutConfirm.cancel')}
                onConfirm={handleLogout}
                onClose={() => setLogoutOpen(false)}
            />

            <ConfirmDialog
                isOpen={deleteOpen}
                title={t('pages.settings.deleteAccountConfirm.title')}
                message={t('pages.settings.deleteAccountConfirm.message')}
                confirmLabel={t('pages.settings.deleteAccountConfirm.confirm')}
                cancelLabel={t('pages.settings.deleteAccountConfirm.cancel')}
                onConfirm={handleDelete}
                onClose={() => setDeleteOpen(false)}
                danger
            />
        </div>
    )
}
