'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { getToken } from '@/utils/cookie'
import ProfileView from '@/components/profil/ProfileView'

export default function MyProfilPage() {
  const router = useRouter()
  const [myId, setMyId] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    const { id } = jwtDecode(token)
    setMyId(id)
  }, [])

  if (loading) {
    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">Chargement...</p>
        </div>
    )
  }

  if (!user) {
    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">Profil introuvable</p>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-transparent">
        <div
            className="md:max-w-2xl md:mx-auto md:my-4 md:rounded-2xl md:shadow-sm overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <ProfileHeader
              displayName={user.pseudo}
              username={user.pseudo_uniq}
              bio={user.bio}
              imageUrl={user.img_profile}
              followersCount={user.nb_followers}
              isOwnProfile={true}
          />

          <div className="px-4 py-4">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              {t('pages.profil.postsSection')}
            </h2>
          </div>

          <div>
            {MOCK_POSTS.map((post) => (
                <Post key={post.id} {...post} />
            ))}
          </div>
        </div>
      </div>
  );
}