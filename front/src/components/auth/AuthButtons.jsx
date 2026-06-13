'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { getToken, clearToken } from '@/utils/cookie'

export default function AuthButtons() {
    const [isLogged, setIsLogged] = useState(false)
    const router = useRouter()
    const { t } = useTranslation()

    useEffect(() => {
        setIsLogged(!!getToken())
    }, [])

    function handleLogout() {
        clearToken()
        setIsLogged(false)
        router.push('/login')
    }

    if (isLogged) {
        return (
            <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full border border-[var(--color-text-title)] text-[var(--color-text-title)] text-sm font-semibold hover:bg-[var(--color-text-title)] hover:text-[var(--color-bg-surface)] transition-colors duration-200"
            >
                {t('auth.buttons.logout')}
            </button>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href="/login"
                className="px-4 py-2 rounded-full border border-[var(--color-text-title)] text-[var(--color-text-title)] text-sm font-semibold hover:bg-[var(--color-text-title)] hover:text-[var(--color-bg-surface)] transition-colors duration-200"
            >
                {t('auth.buttons.login')}
            </Link>
            <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-[var(--color-text-title)] text-[var(--color-bg-surface)] text-sm font-semibold hover:opacity-90 transition-opacity duration-200"
            >
                {t('auth.buttons.register')}
            </Link>
        </div>
    )
}