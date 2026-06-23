'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import ProfileHeader from '@/components/profile/ProfileHeader'
import EditProfileModal from '@/components/profile/EditProfileModal'
import FollowListModal from '@/components/profile/FollowListModal'
import Post from '@/components/post/Post'
import ScrollToTopButton from '@/components/post/ScrollToTopButton'
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
    const { posts, hasMore, loading: postsLoading, loadMore, reset: resetPosts, removePost, total: postsCount } = useUserPosts(userId)
    const sentinelRef = useRef(null)

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting && hasMore && !postsLoading) loadMore() },
            { threshold: 0.1 }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, postsLoading, loadMore])

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
                        postsCount={postsCount}
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

                        <div ref={sentinelRef} className="py-2 text-center text-sm text-[var(--color-text-secondary)]">
                            {postsLoading && t('common.loading')}
                        </div>
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

            <ScrollToTopButton onReset={resetPosts} />

            <FollowListModal
                isOpen={followModalTab !== null}
                initialTab={followModalTab || 'followers'}
                onClose={() => setFollowModalTab(null)}
                userId={userId}
            />
        </div>
    )
}