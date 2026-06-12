'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import UserInfo from './UserInfo'
import { useTranslation } from '@/hooks/useTranslation'
import { getToken } from '@/utils/cookie'

export default function CurrentUser() {
    const [user, setUser] = useState(null)
    const router = useRouter()
    const { t } = useTranslation()

    useEffect(() => {
        const token = getToken()
        if (token) setUser(jwtDecode(token))
    }, [])

    if (!user) {
        return (
            <button onClick={() => router.push('/login')} className="w-full cursor-pointer text-left">
                <UserInfo
                    displayName={t('auth.currentUser.signIn')}
                    username={t('auth.currentUser.signInUsername')}
                    imageUrl={null}
                    avatarSize={40}
                />
            </button>
        )
    }

    return (
        <UserInfo
            displayName={user.displayName}
            username={user.username}
            imageUrl={null}
            avatarSize={40}
        />
    )
}