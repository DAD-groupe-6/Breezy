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
import { cacheAuthor } from '@/utils/authors'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/hooks/useToast'
import { useCurrentProfile } from '@/providers/CurrentProfileProvider'
import { useAuth } from '@/providers/AuthProvider'
import BanModal from '@/components/moderation/BanModal'

export default function ProfileView({ userId, isOwnProfile }) {
    const router = useRouter()
    const { t } = useTranslation()
    const toast = useToast()
    const { setProfile } = useCurrentProfile()
    const { hasPermission } = useAuth()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)
    const [isMutualFollow, setIsMutualFollow] = useState(false)
    const [followPending, setFollowPending] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [followModalTab, setFollowModalTab] = useState(null)
    const [banModalOpen, setBanModalOpen] = useState(false)
    const [banPending, setBanPending] = useState(false)
    // Un utilisateur standard ne voit les posts que sur son propre profil ;
    // consulter ceux d'un autre profil requiert la permission `list_others_posts`.
    const canViewPosts = isOwnProfile || hasPermission('list_others_posts')
    const { posts, hasMore, loading: postsLoading, loadMore, reset: resetPosts, removePost, total: postsCount } = useUserPosts(userId, canViewPosts)
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

    useEffect(() => {
        if (!isOwnProfile) return
        const params = new URLSearchParams(window.location.search)
        if (params.get('onboarding')) {
            setEditOpen(true)
            window.history.replaceState(null, '', '/profil')
        }
    }, [isOwnProfile])

    // Id de l'utilisateur connecté (depuis le JWT)
    const token = getToken()
    const myId = token ? String(jwtDecode(token).id) : null

    const canModerate = hasPermission('moderate_users')
    const canFollow = hasPermission('follow_user')
    const isBanned = Boolean(user?.banned_until && new Date(user.banned_until) > new Date())

    useEffect(() => {
        api.get(`/user/${userId}`)
            .then(res => {
                setUser(res.data)
                setFollowersCount(res.data.nb_followers ?? 0)
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [userId])

    // Nombre d'abonnements (suivis) du profil affiché + check follow mutuel
    useEffect(() => {
        api.get(`/user/${userId}/following`)
            .then(res => {
                const list = res.data.following || []
                setFollowingCount(list.length)
                if (myId) setIsMutualFollow(list.map(String).includes(String(myId)))
            })
            .catch(() => setFollowingCount(0))
    }, [userId, myId])

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

    async function handleBan(durationDays) {
        setBanPending(true)
        try {
            await api.post(`/user/${userId}/ban`, { durationDays })
            const bannedUntil = durationDays === null
                ? new Date('9999-12-31')
                : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
            setUser(prev => ({ ...prev, banned_until: bannedUntil }))
            toast.success(t('toasts.banSuccess'))
            setBanModalOpen(false)
        } catch {
            toast.error(t('toasts.banError'))
        } finally {
            setBanPending(false)
        }
    }

    async function handleUnban() {
        try {
            await api.post(`/user/${userId}/unban`)
            setUser(prev => ({ ...prev, banned_until: null }))
            toast.success(t('toasts.unbanSuccess'))
        } catch {
            toast.error(t('toasts.unbanError'))
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
                    className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-md)] md:mx-auto md:max-w-2xl"
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
                        canModerate={canModerate && !isOwnProfile}
                        canFollow={canFollow}
                        isBanned={isBanned}
                        onFollow={handleFollow}
                        canMessage={!isOwnProfile && isFollowing && isMutualFollow && hasPermission('private_messages')}
                        onMessage={() => router.push(`/messages?with=${userId}`)}
                        onEditProfile={() => setEditOpen(true)}
                        onShowFollowers={() => setFollowModalTab('followers')}
                        onShowFollowing={() => setFollowModalTab('following')}
                        onBan={() => setBanModalOpen(true)}
                        onUnban={handleUnban}
                    />

                    <div className="px-[var(--space-md)] py-[var(--space-md)] md:px-[var(--space-lg)]">
                        <h2 className="text-lg text-[var(--color-text-primary)] [font-weight:var(--font-weight-display)] [letter-spacing:var(--tracking-title)]">
                            {t('pages.profil.postsSection')}
                        </h2>
                    </div>

                    {canViewPosts ? (
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

                            {(postsLoading || hasMore) && (
                                <div
                                    ref={sentinelRef}
                                    className={`${postsLoading ? 'py-2' : 'h-px'} text-center text-sm text-[var(--color-text-secondary)]`}
                                    aria-hidden={!postsLoading}
                                >
                                    {postsLoading ? t('common.loading') : null}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                            {t('pages.profil.postsHidden')}
                        </p>
                    )}
                </div>
            </div>

            {/* Modale d'édition (uniquement pour son propre profil) */}
            {isOwnProfile && (
                <EditProfileModal
                    isOpen={editOpen}
                    onClose={() => setEditOpen(false)}
                    user={user}
                    onSaved={(updated) => {
                        setUser(updated)
                        if (isOwnProfile) setProfile(updated)
                        cacheAuthor(updated.id_user, updated)
                        resetPosts()
                    }}
                />
            )}

            <ScrollToTopButton onReset={resetPosts} />

            <BanModal
                isOpen={banModalOpen}
                onConfirm={handleBan}
                onClose={() => setBanModalOpen(false)}
                loading={banPending}
            />

            <FollowListModal
                isOpen={followModalTab !== null}
                initialTab={followModalTab || 'followers'}
                onClose={() => setFollowModalTab(null)}
                userId={userId}
            />
        </div>
    )
}