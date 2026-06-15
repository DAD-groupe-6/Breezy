'use client';

import { useState, useRef, useEffect } from 'react';
import { FaRegComment, FaRetweet, FaEllipsisH } from 'react-icons/fa';
import UserInfo from './UserInfo';
import CommentSection from './CommentSection';
import LikeButton from './LikeButton';
import api from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import { formatCount } from '@/utils/format';
import { usePostLikes } from '@/hooks/usePostLikes';
import { useComments } from '@/hooks/useComments';

export default function Post({
  postId,
  authorId,
  displayName,
  username,
  imageUrl = null,
  timestamp,
  content = '',
  image = null,
  video = null,
  likes = 0,
  liked = false,
  comments = 0,
  replies = 0,
  onReply,
  onViewProfile,
  onReport,
  onDelete,
}) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const postLikes = usePostLikes(postId, liked, likes);
  const commentsHook = useComments(postId, comments);
  const isMine = authorId === getCurrentUserId();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeletePost = async () => {
    setShowMenu(false);
    try {
      await api.delete(`/post/${postId}`);
      onDelete?.(postId);
    } catch {
      // ignore
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    const next = !showComments;
    setShowComments(next);
    if (next) commentsHook.load();
  };

  return (
    <article className="flex gap-3 border-b border-[var(--color-border)] px-4 py-4 hover:bg-[var(--color-bg-surface-2)] transition-colors cursor-pointer w-full">
      <div className="shrink-0">
        <UserInfo
          displayName={displayName}
          username={username}
          imageUrl={imageUrl}
          avatarSize={44}
          avatarOnly
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-wrap">
            <span className="font-bold text-[var(--color-text-primary)] text-sm sm:text-base truncate">{displayName}</span>
            <span className="text-[var(--color-text-secondary)] text-xs sm:text-sm truncate">@{username}</span>
            <span className="text-[var(--color-text-secondary)] text-xs sm:text-sm">·</span>
            <span className="text-[var(--color-text-secondary)] text-xs sm:text-sm whitespace-nowrap">{timestamp}</span>
          </div>

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
                {isMine && (
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-[var(--color-bg-surface-2)] text-rose-600 text-sm font-medium transition-colors border-t border-[var(--color-border)]"
                    onClick={handleDeletePost}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {content && (
          <p className="text-[var(--color-text-primary)] text-sm sm:text-base leading-relaxed mb-2 break-words">{content}</p>
        )}

        {image && (
          <div className="mb-2 rounded-2xl overflow-hidden border border-[var(--color-border)] w-full">
            <img src={image} alt="Contenu du post" className="w-full h-auto object-cover max-h-96" />
          </div>
        )}

        {video && (
          <div className="mb-2 rounded-2xl overflow-hidden border border-[var(--color-border)] w-full">
            <video src={video} controls className="w-full h-auto max-h-96" />
          </div>
        )}

        <div className="flex items-center gap-4 text-[var(--color-text-secondary)] mt-2">
          <button
            onClick={handleCommentClick}
            className="group flex items-center gap-0.5 transition-colors hover:text-[var(--color-text-title)]"
            aria-label="Commenter"
          >
            <div className="group-hover:bg-[var(--color-bg-surface-2)] rounded-full p-1.5 transition-colors">
              <FaRegComment size={16} />
            </div>
            <span className="text-xs sm:text-sm">{formatCount(commentsHook.count)}</span>
          </button>

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

          <LikeButton
            liked={postLikes.liked}
            count={postLikes.count}
            onClick={(e) => { e.stopPropagation(); postLikes.toggle(); }}
            size={16}
            withWrapper
            label="Aimer"
          />
        </div>

        {showComments && (
          <CommentSection
            comments={commentsHook.list}
            onAddComment={commentsHook.add}
            onDelete={commentsHook.remove}
            onLike={commentsHook.like}
          />
        )}
      </div>
    </article>
  );
}
