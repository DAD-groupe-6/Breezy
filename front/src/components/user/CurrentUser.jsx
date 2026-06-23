'use client'

import { useRouter } from 'next/navigation'
import UserInfo from './UserInfo'
import { useTranslation } from '@/hooks/useTranslation'
import { useCurrentProfile } from '@/providers/CurrentProfileProvider'

export default function CurrentUser() {
    const router = useRouter()
    const { t } = useTranslation()
    const { profile } = useCurrentProfile()

    if (!profile) {
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
        <button onClick={() => router.push('/profil')} className="w-full cursor-pointer text-left">
            <UserInfo
                displayName={profile.pseudo}
                username={profile.pseudo_uniq}
                imageUrl={profile.img_profile}
                avatarSize={40}
            />
        </button>
    )
}