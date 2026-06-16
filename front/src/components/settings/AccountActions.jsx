'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { clearToken } from '@/utils/cookie'

export default function AccountActions() {
    const { t } = useTranslation()
    const router = useRouter()

    const handleLogout = () => {
        clearToken()
        router.push('/login')
    }

    const handleDelete = async () => {
        // À brancher plus tard sur l'API de suppression
        if (confirm(t('pages.settings.deleteConfirm'))) {
            // await api.delete('/user/me') etc.
            clearToken()
            router.push('/register')
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={handleLogout}
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
                onClick={handleDelete}
                className="w-full py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer text-rose-600"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'transparent' }}
            >
                {t('pages.settings.deleteAccount')}
            </button>
        </div>
    )
}