'use client'

import { useParams } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { getToken } from '@/utils/cookie'
import ProfileView from '@/components/profil/ProfileView'

export default function UserProfilPage() {
    const params = useParams()
    const profileId = params.id

    let isOwnProfile = false
    const token = getToken()
    if (token) {
        const { id } = jwtDecode(token)
        isOwnProfile = String(id) === String(profileId)
    }

    return <ProfileView userId={profileId} isOwnProfile={isOwnProfile} />
}