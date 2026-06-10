'use client';

import { useState, useRef, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import Avatar from '../Avatar';
import Button from '../ui/Button';

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
    <div
      className="w-full"
      style={{ backgroundColor: 'var(--color-light-bg-surface)' }}
    >
      {/* Section profil */}
      <div className="px-4 pt-4 pb-4" style={{ borderBottom: '1px solid var(--color-light-border)' }}>
        {/* Ligne avatar + actions */}
        <div className="flex items-start justify-between gap-4 mb-3">
          {/* Avatar */}
          <div className="ring-4 ring-white rounded-full shrink-0">
            <Avatar imageUrl={imageUrl} size={96} />
          </div>

          {/* Zone actions */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              /* Menu 3 points pour le propriétaire */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors cursor-pointer"
                  style={{
                    borderColor: 'var(--color-light-border)',
                    color: 'var(--color-light-text-secondary)',
                  }}
                  aria-label="Options du profil"
                >
                  <FaEllipsisH size={15} />
                </button>

                {showMenu && (
                  <div
                    className="absolute right-0 mt-1 w-52 rounded-xl shadow-lg z-20 overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-light-bg-surface)',
                      border: '1px solid var(--color-light-border)',
                    }}
                  >
                    <button
                      className="w-full text-left px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
                      style={{ color: 'var(--color-light-text-primary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-light-bg-surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => { setShowMenu(false); onEditProfile?.(); }}
                    >
                      Modifier le profil
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
                      style={{
                        color: 'var(--color-light-text-primary)',
                        borderTop: '1px solid var(--color-light-border)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-light-bg-surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => { setShowMenu(false); }}
                    >
                      Changer la photo de profil
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Bouton Suivre pour le visiteur */
              <Button variant="primary" onClick={onFollow}>
                Suivre
              </Button>
            )}
          </div>
        </div>

        {/* Infos textuelles */}
        <div className="mt-3 space-y-2">
          {/* Nom + username */}
          <div>
            <p
              className="text-lg font-bold leading-tight"
              style={{ color: 'var(--color-light-text-primary)' }}
            >
              {displayName}
            </p>
            <p
              className="text-sm"
              style={{ color: 'var(--color-light-text-secondary)' }}
            >
              @{username}
            </p>
          </div>

          {/* Bio */}
          {bio && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-light-text-primary)' }}
            >
              {bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 pt-1">
            <StatItem value={formatCount(postsCount)} label="Posts" />
            <StatItem value={formatCount(followingCount)} label="Suivis" />
            <StatItem value={formatCount(followersCount)} label="Followers" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        className="text-sm font-bold"
        style={{ color: 'var(--color-light-text-primary)' }}
      >
        {value}
      </span>
      <span
        className="text-sm"
        style={{ color: 'var(--color-light-text-secondary)' }}
      >
        {label}
      </span>
    </div>
  );
}
