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
                className="rounded-[var(--radius-pill)] border border-[var(--color-text-title)] px-[var(--space-md)] py-[10px] text-sm text-[var(--color-text-title)] shadow-[var(--shadow-sm)] transition-[background-color,color,box-shadow,transform] duration-200 [font-weight:var(--font-weight-title)] hover:bg-[var(--color-text-title)] hover:text-[var(--color-bg-surface)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:scale-[0.99]"
            >
                {t('auth.buttons.logout')}
            </button>
        )
    }

    return (
        <div className="flex items-center gap-[var(--space-xs)]">
            <Link
                href="/login"
                className="rounded-[var(--radius-pill)] border border-[var(--color-text-title)] px-[var(--space-md)] py-[10px] text-sm text-[var(--color-text-title)] shadow-[var(--shadow-sm)] transition-[background-color,color,box-shadow,transform] duration-200 [font-weight:var(--font-weight-title)] hover:bg-[var(--color-text-title)] hover:text-[var(--color-bg-surface)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:scale-[0.99]"
            >
                {t('auth.buttons.login')}
            </Link>
            <Link
                href="/register"
                className="rounded-[var(--radius-pill)] border border-transparent bg-[var(--color-text-title)] px-[var(--space-md)] py-[10px] text-sm text-[var(--color-bg-surface)] shadow-[var(--shadow-sm)] transition-[background-color,box-shadow,transform] duration-200 [font-weight:var(--font-weight-title)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:scale-[0.99]"
            >
                {t('auth.buttons.register')}
            </Link>
        </div>
    )
}