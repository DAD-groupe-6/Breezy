'use client';

import { useState, useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaRetweet, FaEllipsisH } from 'react-icons/fa';
import UserInfo from './UserInfo';
import CommentSection from './CommentSection';

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
  initialComments = [],
  onLike,
  onComment,
  onReply,
  onViewProfile,
  onReport,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments);
  const [postComments, setPostComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
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

  const handleCommentClick = (e) => {
    e.stopPropagation(); // Évite de propager le clic à la carte parente
    setShowComments((prev) => !prev);
    onComment?.();
  };

  const handleAddComment = (content) => {
    const nextComment = {
      id: Date.now(),
      displayName: 'Vous',
      username: 'you',
      timestamp: "à l'instant",
      content,
    };

    setPostComments((prev) => [nextComment, ...prev]);
    setCommentCount((prev) => prev + 1);
  };

  return (
    <article className="flex gap-3 border-b border-[var(--color-border)] px-4 py-4 hover:bg-[var(--color-bg-surface-2)] transition-colors cursor-pointer w-full">
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
            <span className="font-bold text-[var(--color-text-primary)] text-sm sm:text-base truncate">{displayName}</span>
            <span className="text-[var(--color-text-secondary)] text-xs sm:text-sm truncate">@{username}</span>
            <span className="text-[var(--color-text-secondary)] text-xs sm:text-sm">·</span>
            <span className="text-[var(--color-text-secondary)] text-xs sm:text-sm whitespace-nowrap">{timestamp}</span>
          </div>

          {/* Menu 3 points */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-title)] hover:bg-[var(--color-bg-surface-2)] rounded-full p-2 transition-colors"
              aria-label="Plus d'options"
            >
              <FaEllipsisH size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 hover:bg-[var(--color-bg-surface-2)] text-[var(--color-text-primary)] text-sm font-medium transition-colors"
                  onClick={() => { setShowMenu(false); onViewProfile?.(); }}
                >
                  Voir le profil
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-[var(--color-bg-surface-2)] text-rose-600 text-sm font-medium transition-colors border-t border-[var(--color-border)]"
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
          <p className="text-[var(--color-text-primary)] text-sm sm:text-base leading-relaxed mb-2 break-words">{content}</p>
        )}

        {/* Image */}
        {image && (
          <div className="mb-2 rounded-2xl overflow-hidden border border-[var(--color-border)] w-full">
            <img
              src={image}
              alt="Contenu du post"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {/* Vidéo */}
        {video && (
          <div className="mb-2 rounded-2xl overflow-hidden border border-[var(--color-border)] w-full">
            <video
              src={video}
              controls
              className="w-full h-auto max-h-96"
            />
          </div>
        )}

        {/* Barre d'actions */}
        <div className="flex items-center gap-4 text-[var(--color-text-secondary)] mt-2">
          {/* Commentaire */}
          <button
            onClick={handleCommentClick}
            className="group flex items-center gap-0.5 transition-colors hover:text-[var(--color-text-title)]"
            aria-label="Commenter"
          >
            <div className="group-hover:bg-[var(--color-bg-surface-2)] rounded-full p-1.5 transition-colors">
              <FaRegComment size={16} />
            </div>
            <span className="text-xs sm:text-sm">{formatCount(commentCount)}</span>
          </button>

          {/* Repost / Reply */}
          <button
            onClick={(e) => { e.stopPropagation(); onReply?.(); }}
            className="flex items-center gap-0.5 group hover:text-[var(--color-text-title)] transition-colors"
            aria-label="Reposter"
          >
            <div className="group-hover:bg-[var(--color-bg-surface-2)] rounded-full p-1.5 transition-colors">
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
            <div className={`rounded-full p-1.5 transition-colors ${isLiked ? 'bg-rose-100/60' : 'group-hover:bg-rose-100/60'}`}>
              {isLiked ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
            </div>
            <span className="text-xs sm:text-sm">{formatCount(likeCount)}</span>
          </button>
        </div>

        {showComments && (
          <CommentSection comments={postComments} onAddComment={handleAddComment} />
        )}
      </div>
    </article>
  );
}