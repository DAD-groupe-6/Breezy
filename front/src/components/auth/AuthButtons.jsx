'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AuthButtons() {
    const [isLogged, setIsLogged] = useState(false)

    useEffect(() => {
        setIsLogged(!!localStorage.getItem('token'))
    }, [])

    if (isLogged) return null

    return (
        <div className="flex items-center gap-2">
            <Link
                href="/login"
                className="px-4 py-2 rounded-full border border-[var(--color-text-title)] text-[var(--color-text-title)] text-sm font-semibold hover:bg-[var(--color-text-title)] hover:text-[var(--color-bg-surface)] transition-colors duration-200"
            >
                Se connecter
            </Link>
            <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-[var(--color-text-title)] text-[var(--color-bg-surface)] text-sm font-semibold hover:opacity-90 transition-opacity duration-200"
            >
                S'inscrire
            </Link>
        </div>
    )
}