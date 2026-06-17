'use client'

import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import ProfileHeader from '@/components/profil/ProfileHeader'
import Post from '@/components/post/Post'
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
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followPending, setFollowPending] = useState(false)

    // Id de l'utilisateur connecté (depuis le JWT)
    const token = getToken()
    const myId = token ? String(jwtDecode(token).id) : null

    useEffect(() => {
        api.get(`/user/${userId}`)
            .then(res => {
                setUser(res.data)
                setFollowersCount(res.data.nb_followers ?? 0)
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [userId])

    // Nombre d'abonnements (suivis) du profil affiché
    useEffect(() => {
        api.get(`/user/following/${userId}`)
            .then(res => setFollowingCount(res.data.following_count ?? 0))
            .catch(() => setFollowingCount(0))
    }, [userId])

    // Détermine si l'utilisateur connecté suit déjà ce profil
    useEffect(() => {
        if (isOwnProfile || !myId) return
        api.get(`/user/following/${myId}`)
            .then(res => {
                const list = res.data.following_list || []
                setIsFollowing(list.map(String).includes(String(userId)))
            })
            .catch(() => setIsFollowing(false))
    }, [userId, myId, isOwnProfile])

    async function handleFollow() {
        if (!myId || followPending) return
        setFollowPending(true)
        const endpoint = isFollowing ? '/user/follow/remove' : '/user/follow/add'
        try {
            await api.post(endpoint, { follower_id: myId, following_id: String(userId) })
            setIsFollowing(prev => !prev)
            setFollowersCount(prev => Math.max(0, prev + (isFollowing ? -1 : 1)))
        } catch (err) {
            // En cas d'échec, on laisse l'état inchangé
        } finally {
            setFollowPending(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <p className="text-[var(--color-text-secondary)]">{t('pages.profil.loading')}</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <p className="text-[var(--color-text-secondary)]">{t('pages.profil.notFound')}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            <div className="mx-auto w-full max-w-3xl px-4 py-4">
                <div
                    className="overflow-hidden bg-[var(--color-bg-surface)] md:mx-auto md:max-w-2xl md:rounded-[var(--radius-xl)] md:border md:border-[var(--color-border)] md:shadow-[var(--shadow-md)]"
                >
                <ProfileHeader
                    displayName={user.pseudo}
                    username={user.pseudo_uniq}
                    bio={user.bio}
                    imageUrl={user.img_profile}
                    followersCount={followersCount}
                    followingCount={followingCount}
                    isOwnProfile={isOwnProfile}
                    isFollowing={isFollowing}
                    followPending={followPending}
                    onFollow={handleFollow}
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
        </div>
    )
}