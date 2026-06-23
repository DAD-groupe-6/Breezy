'use client'

import { useEffect, useState } from 'react'
import { FiX, FiSearch } from 'react-icons/fi'
import { jwtDecode } from 'jwt-decode'
import api from '@/utils/api'
import { getToken } from '@/utils/cookie'
import { useTranslation } from '@/hooks/useTranslation'
import Avatar from '@/components/user/Avatar'

export default function NewConversationModal({ isOpen, onClose, onSelectUser }) {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setSearchQuery('')

    const token = getToken()
    const myId = token ? String(jwtDecode(token).id) : null
    if (!myId) return

    setLoading(true)
    Promise.all([
      api.get(`/user/${myId}/following`),
      api.get(`/user/${myId}/followers`),
    ])
      .then(async ([followingRes, followersRes]) => {
        const following = new Set((followingRes.data.following || []).map(String))
        const followers = new Set((followersRes.data.followers_list || []).map(String))
        const mutualIds = [...following].filter((id) => followers.has(id))

        const profiles = await Promise.all(
          mutualIds.map((id) =>
            api.get(`/user/${id}`)
              .then((r) => r.data)
              .catch(() => null)
          )
        )
        setUsers(profiles.filter(Boolean))
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  const filtered = users.filter((u) =>
    `${u.pseudo} ${u.pseudo_uniq}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-md)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t('pages.messages.newConversation')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-2)] hover:text-[var(--color-text-primary)]"
          >
            <FiX />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[var(--color-border)] px-3 py-2">
          <div className="flex items-center gap-2 rounded-full bg-[var(--color-bg-surface-2)] px-3 py-2">
            <FiSearch className="shrink-0 text-[var(--color-text-secondary)]" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pages.messages.searchPlaceholder')}
              className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
              autoFocus
            />
          </div>
        </div>

        {/* User list */}
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
              {t('common.loading')}
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
              {t('pages.messages.noMutualFollowers')}
            </p>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id_user}
                type="button"
                onClick={() => { onSelectUser(user.id_user); onClose() }}
                className="flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--color-bg-surface-2)]"
              >
                <Avatar imageUrl={user.img_profile} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{user.pseudo}</p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">@{user.pseudo_uniq}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
