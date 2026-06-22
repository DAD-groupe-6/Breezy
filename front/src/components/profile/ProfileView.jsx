'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import ProfileHeader from '@/components/profil/ProfileHeader'
import EditProfileModal from '@/components/profil/EditProfilModal'
import FollowListModal from '@/components/profil/FollowListModal'
import Post from '@/components/post/Post'
import LoadMoreButton from '@/components/post/LoadMoreButton'
import { useUserPosts } from '@/hooks/useUserPosts'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/hooks/useToast'

export default function ProfileView({ userId, isOwnProfile }) {
    const router = useRouter()
    const { t } = useTranslation()
    const toast = useToast()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followPending, setFollowPending] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [followModalTab, setFollowModalTab] = useState(null)
    const { posts, hasMore, loading: postsLoading, loadMore, removePost } = useUserPosts(userId)

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
        api.get(`/user/${userId}/following`)
            .then(res => setFollowingCount((res.data.following || []).length))
            .catch(() => setFollowingCount(0))
    }, [userId])

    // Détermine si l'utilisateur connecté suit déjà ce profil
    useEffect(() => {
        if (isOwnProfile || !myId) return
        api.get(`/user/${myId}/following`)
            .then(res => {
                const list = res.data.following || []
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
            toast.error(t('toasts.followError'))
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
                        onEditProfile={() => setEditOpen(true)}
                        onShowFollowers={() => setFollowModalTab('followers')}
                        onShowFollowing={() => setFollowModalTab('following')}
                    />

                    <div className="px-[var(--space-md)] py-[var(--space-md)] md:px-[var(--space-lg)]">
                        <h2 className="text-lg text-[var(--color-text-primary)] [font-weight:var(--font-weight-display)] [letter-spacing:var(--tracking-title)]">
                            {t('pages.profil.postsSection')}
                        </h2>
                    </div>

                    <div>
                        {posts.map((post) => (
                            <Post
                                key={post.postId}
                                {...post}
                                onViewProfile={() => router.push(`/profil/${post.authorId}`)}
                                onDelete={removePost}
                            />
                        ))}

                        {!postsLoading && posts.length === 0 && (
                            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                                {t('pages.profil.noPosts')}
                            </p>
                        )}

                        {hasMore && <LoadMoreButton onClick={loadMore} />}
                    </div>
                </div>
            </div>

            {/* Modale d'édition (uniquement pour son propre profil) */}
            {isOwnProfile && (
                <EditProfileModal
                    isOpen={editOpen}
                    onClose={() => setEditOpen(false)}
                    user={user}
                    onSaved={(updated) => setUser(updated)}
                />
            )}

            <FollowListModal
                isOpen={followModalTab !== null}
                initialTab={followModalTab || 'followers'}
                onClose={() => setFollowModalTab(null)}
                userId={userId}
            />
        </div>
    )
}