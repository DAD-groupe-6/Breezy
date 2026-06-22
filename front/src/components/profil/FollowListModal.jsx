'use client'

import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import api from '@/utils/api'
import ProfileCard from '@/components/profil/ProfileCard'
import { getCurrentUserId } from '@/utils/auth'
import { useTranslation } from '@/hooks/useTranslation'

export default function FollowListModal({ isOpen, onClose, userId, initialTab = 'followers' }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [users, setUsers] = useState([])
  const [myFollowing, setMyFollowing] = useState(() => new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const myId = getCurrentUserId()

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab)
  }, [isOpen, initialTab])

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setUsers([])
      try {
        const endpoint =
          activeTab === 'followers'
            ? `/user/${userId}/followers`
            : `/user/${userId}/following`

        const [listRes, myFollowingRes] = await Promise.all([
          api.get(endpoint),
          myId
            ? api.get(`/user/${myId}/following`)
            : Promise.resolve({ data: { following: [] } }),
        ])

        const ids =
          activeTab === 'followers'
            ? listRes.data.followers_list || []
            : listRes.data.following || []

        const followingSet = new Set((myFollowingRes.data.following || []).map(String))

        const profiles = await Promise.all(
          ids.map((id) =>
            api
              .get(`/user/${id}`)
              .then((r) => r.data)
              .catch(() => null)
          )
        )

        if (!cancelled) {
          setMyFollowing(followingSet)
          setUsers(profiles.filter(Boolean))
        }
      } catch (err) {
        console.error('[FollowListModal] Erreur de chargement:', err)
        if (!cancelled) setError(t('profile.followModal.loadError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isOpen, activeTab, userId, myId])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl"
        style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête : onglets + fermeture */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex gap-2">
            <TabButton active={activeTab === 'followers'} onClick={() => setActiveTab('followers')}>
              {t('profile.followModal.followers')}
            </TabButton>
            <TabButton active={activeTab === 'following'} onClick={() => setActiveTab('following')}>
              {t('profile.followModal.following')}
            </TabButton>
          </div>
          <button
            onClick={onClose}
            aria-label={t('profile.followModal.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-2)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="min-h-[120px] overflow-y-auto">
          {loading && (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              {t('profile.followModal.loading')}
            </p>
          )}

          {!loading && error && (
            <p className="px-4 py-6 text-center text-sm text-rose-500">{error}</p>
          )}

          {!loading && !error && users.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              {t('profile.followModal.empty')}
            </p>
          )}

          {!loading &&
            !error &&
            users.map((u) => (
              <ProfileCard
                key={u.id_user}
                userId={u.id_user}
                displayName={u.pseudo}
                username={u.pseudo_uniq}
                imageUrl={u.img_profile}
                bio={u.bio}
                initialFollowing={myFollowing.has(String(u.id_user))}
                onViewProfile={onClose}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-bold transition-colors cursor-pointer ${
        active
          ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-2)]'
      }`}
    >
      {children}
    </button>
  )
}
