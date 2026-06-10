'use client';

import { useState, useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaRetweet, FaEllipsisH } from 'react-icons/fa';
import UserInfo from './UserInfo';

export default function Post({
  displayName = 'John Doe',
  username = 'johndoe',
  imageUrl = null,
  timestamp = '2h',
  content = '',
  image = null,
  video = null,
  likes = 0,
  comments = 0,
  replies = 0,
  onLike,
  onComment,
  onReply,
  onViewProfile,
  onReport,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    onLike?.();
  };

  const formatCount = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n;
  };

  return (
    <article className="flex w-full cursor-pointer gap-3 border-b border-[var(--color-bg-surface-2)] px-4 py-4 transition-colors hover:bg-[var(--color-bg-surface-2)]">
      {/* Colonne avatar */}
      <div className="shrink-0">
        <UserInfo
          displayName={displayName}
          username={username}
          imageUrl={imageUrl}
          avatarSize={44}
          avatarOnly
        />
      </div>

      {/* Colonne contenu */}
      <div className="flex-1 min-w-0">
        {/* Header : nom + handle + timestamp + menu */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-wrap">
            <span className="truncate text-sm font-bold text-[var(--color-text-primary)] sm:text-base">{displayName}</span>
            <span className="truncate text-xs text-[var(--color-text-secondary)] sm:text-sm">@{username}</span>
            <span className="text-xs text-[var(--color-text-secondary)] sm:text-sm">·</span>
            <span className="whitespace-nowrap text-xs text-[var(--color-text-secondary)] sm:text-sm">{timestamp}</span>
          </div>

          {/* Menu 3 points */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-2)] hover:text-[var(--color-text-title)]"
              aria-label="Plus d'options"
            >
              <FaEllipsisH size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-surface)] shadow-lg">
                <button
                  className="w-full px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface-2)]"
                  onClick={() => { setShowMenu(false); onViewProfile?.(); }}
                >
                  Voir le profil
                </button>
                <button
                  className="w-full border-t border-[var(--color-bg-surface-2)] px-4 py-3 text-left text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
                  onClick={() => { setShowMenu(false); onReport?.(); }}
                >
                  Signaler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenu textuel */}
        {content && (
          <p className="mb-2 break-words text-sm leading-relaxed text-[var(--color-text-primary)] sm:text-base">{content}</p>
        )}

        {/* Image */}
        {image && (
          <div className="mb-2 w-full overflow-hidden rounded-2xl border border-[var(--color-bg-surface-2)]">
            <img
              src={image}
              alt="Contenu du post"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {/* Vidéo */}
        {video && (
          <div className="mb-2 w-full overflow-hidden rounded-2xl border border-[var(--color-bg-surface-2)]">
            <video
              src={video}
              controls
              className="w-full h-auto max-h-96"
            />
          </div>
        )}

        {/* Barre d'actions */}
        <div className="mt-2 flex items-center gap-4 text-[var(--color-text-secondary)]">
          {/* Commentaire */}
          <button
            onClick={(e) => { e.stopPropagation(); onComment?.(); }}
            className="group flex items-center gap-0.5 transition-colors hover:text-[var(--color-text-title)]"
            aria-label="Commenter"
          >
            <div className="rounded-full p-1.5 transition-colors group-hover:bg-[var(--color-bg-surface-2)]">
              <FaRegComment size={16} />
            </div>
            <span className="text-xs sm:text-sm">{formatCount(comments)}</span>
          </button>

          {/* Repost / Reply */}
          <button
            onClick={(e) => { e.stopPropagation(); onReply?.(); }}
            className="group flex items-center gap-0.5 transition-colors hover:text-[var(--color-text-title)]"
            aria-label="Reposter"
          >
            <div className="rounded-full p-1.5 transition-colors group-hover:bg-[var(--color-bg-surface-2)]">
              <FaRetweet size={17} />
            </div>
            <span className="text-xs sm:text-sm">{formatCount(replies)}</span>
          </button>

          {/* Like */}
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className={`flex items-center gap-0.5 group transition-colors ${isLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}
            aria-label="Aimer"
          >
            <div className={`rounded-full p-1.5 transition-colors ${isLiked ? 'bg-rose-500/10' : 'group-hover:bg-rose-500/10'}`}>
              {isLiked ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
            </div>
            <span className="text-xs sm:text-sm">{formatCount(likeCount)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
