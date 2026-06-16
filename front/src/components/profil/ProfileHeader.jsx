'use client';

import { useState, useRef, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import Avatar from '../Avatar';
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
  onFollow,
  onEditProfile,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              /* Menu 3 points pour le propriétaire */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
                  aria-label={t('profile.optionsAriaLabel')}
                >
                  <FaEllipsisH size={15} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 z-20 mt-[var(--space-2xs)] w-52 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-md)]">
                    <button
                      className="w-full cursor-pointer px-[var(--space-md)] py-[12px] text-left text-sm text-[var(--color-text-primary)] transition-[background-color,color] duration-200 [font-weight:var(--font-weight-label)] hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-focus-ring)]"
                      onClick={() => { setShowMenu(false); onEditProfile?.(); }}
                    >
                      {t('profile.editProfile')}
                    </button>
                    <button
                      className="w-full cursor-pointer border-t border-[var(--color-border)] px-[var(--space-md)] py-[12px] text-left text-sm text-[var(--color-text-primary)] transition-[background-color,color] duration-200 [font-weight:var(--font-weight-label)] hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-focus-ring)]"
                      onClick={() => { setShowMenu(false); }}
                    >
                      {t('profile.changePhoto')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Bouton Suivre pour le visiteur */
              <Button variant="primary" onClick={onFollow}>
                {t('profile.follow')}
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
            <StatItem value={formatCount(followingCount)} label={t('profile.statFollowing')} />
            <StatItem value={formatCount(followersCount)} label={t('profile.statFollowers')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }) {
  return (
    <div className="flex items-baseline gap-[4px] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface-2)] px-[10px] py-[4px]">
      <span className="text-sm text-[var(--color-text-primary)] [font-weight:var(--font-weight-display)]">
        {value}
      </span>
      <span className="text-sm text-[var(--color-text-secondary)] [font-weight:var(--font-weight-regular)]">
        {label}
      </span>
    </div>
  );
}
