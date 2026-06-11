'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import UserInfo from './UserInfo'

export default function CurrentUser() {
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) setUser(jwtDecode(token))
    }, [])

    if (!user) {
        return (
            <button onClick={() => router.push('/login')} className="w-full cursor-pointer text-left">
                <UserInfo
                    displayName="Se connecter"
                    username="connexion"
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