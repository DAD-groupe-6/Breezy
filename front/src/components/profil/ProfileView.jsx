'use client'

import { useState, useEffect } from 'react'
import api from '@/utils/api'
import ProfileHeader from '@/components/profil/ProfileHeader'
import Post from '@/components/Post'
import { useTranslation } from '@/hooks/useTranslation'

const MOCK_POSTS = [
    {
        id: 1,
        displayName: 'Lucas Martin',
        username: 'lucas_m',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        timestamp: '2h',
        content: "Je viens de déployer ma première app Next.js en prod 🚀 C'est une fierté incroyable. Merci à toute l'équipe !",
        likes: 87,
        comments: 14,
        replies: 5,
    },
    {
        id: 2,
        displayName: 'Lucas Martin',
        username: 'lucas_m',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        timestamp: '1j',
        content: "Le CSS c'est de l'art. Vous ne me convaincrez jamais du contraire. 🎨\n\n(dit celui qui passe 3h à centrer une div)",
        likes: 204,
        comments: 32,
        replies: 18,
    },
    {
        id: 3,
        displayName: 'Lucas Martin',
        username: 'lucas_m',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        timestamp: '3j',
        content: "Hot take : les microservices c'est fantastique jusqu'au moment où vous devez les déboguer à 2h du matin.",
        likes: 511,
        comments: 67,
        replies: 43,
    },
    {
        id: 4,
        displayName: 'Lucas Martin',
        username: 'lucas_m',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        timestamp: '1 sem',
        content: 'Petite question : vous préférez travailler en remote complet, hybride ou full présentiel ? (je collecte des données non-représentatives)',
        likes: 138,
        comments: 89,
        replies: 12,
    },
    {
        id: 5,
        displayName: 'Lucas Martin',
        username: 'lucas_m',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        timestamp: '2 sem',
        content: 'Premier commit de 2026 ✅\nDernier commit de 2026 : probablement "fix typo" à 23h58.',
        likes: 760,
        comments: 45,
        replies: 30,
    },
];

export default function ProfileView({ userId, isOwnProfile }) {
    const { t } = useTranslation()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/user/${userId}`)
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [userId])

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <p className="text-[var(--color-text-secondary)]">Chargement...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <p className="text-[var(--color-text-secondary)]">Profil introuvable</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            <div
                className="overflow-hidden bg-[var(--color-bg-surface)] md:mx-auto md:max-w-2xl md:rounded-[var(--radius-xl)] md:border md:border-[var(--color-border)] md:shadow-[var(--shadow-md)]"
            >
                <ProfileHeader
                    displayName={user.pseudo}
                    username={user.pseudo_uniq}
                    bio={user.bio}
                    imageUrl={user.img_profile}
                    followersCount={user.nb_followers}
                    isOwnProfile={isOwnProfile}
                />

                <div className="px-[var(--space-md)] py-[var(--space-md)] md:px-[var(--space-lg)]">
                    <h2 className="text-lg text-[var(--color-text-primary)] [font-weight:var(--font-weight-display)] [letter-spacing:var(--tracking-title)]">
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
    )
}