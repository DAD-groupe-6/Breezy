'use client';

import { FiEdit3 } from 'react-icons/fi';
import Avatar from '@/components/user/Avatar';
import Button from '../ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfileHeader({
  displayName = 'Utilisateur',
  username = 'utilisateur',
  bio = '',
  imageUrl = null,
  postsCount = 0,
  followersCount = 0,
  followingCount = 0,
  isOwnProfile = false,
  isFollowing = false,
  followPending = false,
  onFollow,
  onEditProfile,
  onShowFollowers,
  onShowFollowing,
}) {
  const { t } = useTranslation();

  const formatCount = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n;
  };

  return (
    <div className="w-full bg-[var(--color-bg-surface)]">
      {/* Section profil */}
      <div className="border-b border-[var(--color-border)] px-[var(--space-md)] pb-[var(--space-md)] pt-[var(--space-md)] md:px-[var(--space-lg)]">
        {/* Ligne avatar + actions */}
        <div className="mb-[var(--space-sm)] flex items-start justify-between gap-[var(--space-md)]">
          {/* Avatar */}
          <div className="shrink-0 rounded-[var(--radius-pill)] ring-4 ring-[var(--color-bg-surface)] shadow-[var(--shadow-sm)]">
            <Avatar imageUrl={imageUrl} size={96} />
          </div>

          {/* Zone actions */}
          <div className="flex items-center gap-[var(--space-xs)]">
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
                aria-label={t('profile.editProfile')}
              >
                <FiEdit3 size={16} />
              </button>
            ) : (
              /* Bouton Suivre pour le visiteur */
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                onClick={onFollow}
                disabled={followPending}
              >
                {isFollowing ? t('profile.following') : t('profile.follow')}
              </Button>
            )}
          </div>
        </div>

        {/* Infos textuelles */}
        <div className="mt-[var(--space-sm)] space-y-[var(--space-xs)]">
          {/* Nom + username */}
          <div>
            <p className="text-lg leading-tight text-[var(--color-text-primary)] [font-weight:var(--font-weight-display)] [letter-spacing:var(--tracking-title)]">
              {displayName}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] [font-weight:var(--font-weight-regular)]">
              @{username}
            </p>
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
              {bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[var(--space-xs)] pt-[var(--space-2xs)]">
            <StatItem value={formatCount(postsCount)} label={t('profile.statPosts')} />
            <StatItem value={formatCount(followingCount)} label={t('profile.statFollowing')} onClick={onShowFollowing} />
            <StatItem value={formatCount(followersCount)} label={t('profile.statFollowers')} onClick={onShowFollowers} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label, onClick }) {
  const baseClass =
    'flex items-baseline gap-[4px] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface-2)] px-[10px] py-[4px]';

  const content = (
    <>
      <span className="text-sm text-[var(--color-text-primary)] [font-weight:var(--font-weight-display)]">
        {value}
      </span>
      <span className="text-sm text-[var(--color-text-secondary)] [font-weight:var(--font-weight-regular)]">
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} cursor-pointer transition-colors hover:bg-[var(--color-border)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]`}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
