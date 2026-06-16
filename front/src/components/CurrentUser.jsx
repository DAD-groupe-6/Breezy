'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import api from '@/utils/api'
import UserInfo from './UserInfo'
import { useTranslation } from '@/hooks/useTranslation'
import { getToken } from '@/utils/cookie'

export default function CurrentUser() {
    const [profile, setProfile] = useState(null)
    const router = useRouter()
    const { t } = useTranslation()

    useEffect(() => {
        const token = getToken()
        if (!token) return

        const { id } = jwtDecode(token)

        api.get(`/user/${id}`)
            .then(res => setProfile(res.data))
            .catch(() => setProfile(null))
    }, [])

    if (!profile) {
        return (
            <button onClick={() => router.push('/login')} className="w-full cursor-pointer rounded-[var(--radius-lg)] text-left focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]">
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
        <button onClick={() => router.push('/profil')} className="w-full cursor-pointer rounded-[var(--radius-lg)] text-left focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]">
            <UserInfo
                displayName={profile.pseudo}
                username={profile.pseudo_uniq}
                imageUrl={profile.img_profile}
                avatarSize={40}
            />
        </button>
    )
}