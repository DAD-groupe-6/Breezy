'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserInfo from '../UserInfo';
import api from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfileCard({
  userId,
  displayName,
  username,
  imageUrl = null,
  bio = '',
  initialFollowing = false,
  onFollowChange,
  onViewProfile,
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const currentUserId = getCurrentUserId();
  const isOwnProfile = String(userId) === String(currentUserId);

  const handleFollow = async () => {
    if (!currentUserId || pending) return;
    setPending(true);
    const endpoint = isFollowing ? '/user/follow/remove' : '/user/follow/add';
    try {
      await api.post(endpoint, {
        follower_id: String(currentUserId),
        following_id: String(userId),
      });
      const next = !isFollowing;
      setIsFollowing(next);
      onFollowChange?.(userId, next);
    } catch (err) {
      console.error('[ProfileCard] Erreur lors du suivi', err);
    } finally {
      setPending(false);
    }
  };

  const handleViewProfile = () => {
    router.push(`/profil/${userId}`);
    onViewProfile?.();
  };

  return (
    <article className="flex gap-3 border-b border-[var(--color-border)] px-4 py-4 hover:bg-[var(--color-bg-surface-2)] transition-colors w-full cursor-pointer"
      onClick={handleViewProfile}
    >
      <div className="shrink-0">
        <UserInfo
          displayName={displayName}
          username={username}
          imageUrl={imageUrl}
          avatarSize={44}
          avatarOnly
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <span className="font-bold text-[var(--color-text-primary)] text-sm sm:text-base truncate">
              {displayName}
            </span>
            <span className="text-[var(--color-text-secondary)] text-xs sm:text-sm truncate">
              @{username}
            </span>
          </div>

          {!isOwnProfile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}
              disabled={pending}
              className={`px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap transition-colors disabled:opacity-50 ${
                isFollowing
                  ? 'border border-[var(--color-text-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                  : 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] hover:opacity-80'
              }`}
            >
              {isFollowing ? t('profile.following') : t('profile.follow')}
            </button>
          )}
        </div>

        {bio && (
          <p className="text-[var(--color-text-primary)] text-sm leading-relaxed break-words mt-2">
            {bio}
          </p>
        )}
      </div>
    </article>
  );
}
