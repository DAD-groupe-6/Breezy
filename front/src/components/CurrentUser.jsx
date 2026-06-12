'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import UserInfo from './UserInfo'

export default function CurrentUser() {
    const [profile, setProfile] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        const { id } = jwtDecode(token)

        axios.get(`/api/v1/user/${id}`)
            .then(res => setProfile(res.data))
            .catch(() => setProfile(null))
    }, [])

    if (!profile) {
        return (
            <button onClick={() => router.push('/login')} className="w-full cursor-pointer text-left">
                <UserInfo displayName="Se connecter" username="connexion" imageUrl={null} avatarSize={40} />
            </button>
        )
    }

    return (
        <UserInfo
            displayName={profile.pseudo}
            username={profile.pseudo_uniq}
            imageUrl={profile.img_profile}
            avatarSize={40}
        />
    )
}