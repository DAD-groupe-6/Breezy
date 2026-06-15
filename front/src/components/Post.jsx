'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '@/utils/api';
import { FaHeart, FaRegHeart, FaRegComment, FaRetweet, FaEllipsisH } from 'react-icons/fa';
import UserInfo from './UserInfo';
import CommentSection from './CommentSection';
import { getToken } from '@/utils/cookie';
import { resolveAuthor } from '@/utils/authors';
import { timeAgo } from '@/utils/time';

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
  onLike,
  onComment,
  onReply,
  onViewProfile,
  onReport,
  onDelete,
}) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(comments);
  const [commentList, setCommentList] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const currentUserId = useMemo(() => {
    const token = getToken();
    return token ? jwtDecode(token).id : null;
  }, []);

  const isMine = String(authorId) === String(currentUserId);

  const handleDeletePost = async () => {
    setShowMenu(false);
    try {
      await api.delete(`/post/${postId}`);
      onDelete?.(postId);
    } catch {
      alert('Impossible de supprimer ce post. Réessaie.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      const { data } = isLiked
        ? await api.delete(`/post/${postId}/like`)
        : await api.post(`/post/${postId}/like`);

      setIsLiked(data.likedByMe);
      setLikeCount(data.nb_like);
      onLike?.();
    } catch {
    } finally {
      setLikeLoading(false);
    }
  };

  const formatCount = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n;
  };

  const mapComment = async (c) => {
    const author = await resolveAuthor(c.id_user);
    return {
      id: c._id,
      displayName: author?.pseudo || 'Utilisateur inconnu',
      username: author?.pseudo_uniq || 'inconnu',
      timestamp: timeAgo(c.createdAt),
      content: c.content,
      canDelete: String(c.id_user) === String(currentUserId),
      nb_like: c.nb_like,
      liked: c.likedByMe,
    };
  };

  const loadComments = async () => {
    try {
      const { data } = await api.get(`/post/${postId}/comments`);
      const mapped = await Promise.all(data.map(mapComment));
      setCommentList(mapped);
      setCommentsLoaded(true);
    } catch {
      // ignore
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    const next = !showComments;
    setShowComments(next);
    if (next && !commentsLoaded) loadComments();
    onComment?.();
  };

  const handleAddComment = async (value) => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    try {
      const { data } = await api.post(`/post/${postId}/comments`, { content: value });
      const mapped = await mapComment(data);
      setCommentList((prev) => [mapped, ...prev]);
      setCommentCount((prev) => prev + 1);
    } catch {
      // ignore
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/post/${postId}/comments/${commentId}`);
      setCommentList((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    const target = commentList.find((c) => c.id === commentId);
    if (!target) return;
    try {
      const { data } = target.liked
        ? await api.delete(`/post/${postId}/comments/${commentId}/like`)
        : await api.post(`/post/${postId}/comments/${commentId}/like`);
      setCommentList((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, liked: data.likedByMe, nb_like: data.nb_like }
            : c
        )
      );
    } catch {
      // ignore
    }
  };

  return (
    <article className="flex w-full cursor-pointer gap-[var(--space-sm)] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-[var(--space-md)] py-[var(--space-md)] shadow-[var(--shadow-sm)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[var(--color-bg-surface-2)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[1px]">
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
              className="rounded-[var(--radius-pill)] p-[var(--space-xs)] text-[var(--color-text-secondary)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
              aria-label="Plus d'options"
            >
              <FaEllipsisH size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 z-20 mt-[var(--space-2xs)] w-44 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-md)]">
                <button
                    className="w-full px-[var(--space-md)] py-[12px] text-left text-sm font-medium text-[var(--color-text-primary)] transition-[background-color,color] duration-200 hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-focus-ring)]"
                    onClick={() => { setShowMenu(false); router.push(`/profil/${authorId}`); }}
                >
                  Voir le profil
                </button>
                <button
                  className="w-full border-t border-[var(--color-border)] px-[var(--space-md)] py-[12px] text-left text-sm font-medium text-rose-600 transition-[background-color,color] duration-200 hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-focus-ring)]"
                  onClick={() => { setShowMenu(false); onReport?.(); }}
                >
                  Signaler
                </button>
                {isMine && (
                  <button
                    className="w-full border-t border-[var(--color-border)] px-[var(--space-md)] py-[12px] text-left text-sm font-medium text-rose-600 transition-[background-color,color] duration-200 hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-focus-ring)]"
                    onClick={handleDeletePost}
                  >
                    Supprimer
                  </button>
                )}
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
          <div className="mb-[var(--space-xs)] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <img
              src={image}
              alt="Contenu du post"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {/* Vidéo */}
        {video && (
          <div className="mb-[var(--space-xs)] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <video
              src={video}
              controls
              className="w-full h-auto max-h-96"
            />
          </div>
        )}

        {/* Barre d'actions */}
        <div className="mt-[var(--space-xs)] flex items-center gap-[var(--space-md)] text-[var(--color-text-secondary)]">
          {/* Commentaire */}
          <button
            onClick={handleCommentClick}
            className="group flex items-center gap-[4px] rounded-[var(--radius-pill)] px-[6px] py-[4px] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
            aria-label="Commenter"
          >
            <div className="rounded-[var(--radius-pill)] p-[6px] transition-colors group-hover:bg-[var(--color-bg-surface)]">
              <FaRegComment size={16} />
            </div>
            <span className="text-xs sm:text-sm">{formatCount(commentCount)}</span>
          </button>

          {/* Repost / Reply */}
          <button
            onClick={(e) => { e.stopPropagation(); onReply?.(); }}
            className="group flex items-center gap-[4px] rounded-[var(--radius-pill)] px-[6px] py-[4px] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
            aria-label="Reposter"
          >
            <div className="rounded-[var(--radius-pill)] p-[6px] transition-colors group-hover:bg-[var(--color-bg-surface)]">
              <FaRetweet size={17} />
            </div>
            <span className="text-xs sm:text-sm">{formatCount(replies)}</span>
          </button>

          {/* Like */}
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className={`group flex items-center gap-[4px] rounded-[var(--radius-pill)] px-[6px] py-[4px] transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] ${isLiked ? 'bg-rose-50 text-rose-500' : 'hover:bg-rose-50 hover:text-rose-500'}`}
            aria-label="Aimer"
          >
            <div className={`rounded-[var(--radius-pill)] p-[6px] transition-colors ${isLiked ? 'bg-rose-100/60' : 'group-hover:bg-rose-100/60'}`}>
              {isLiked ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
            </div>
            <span className="text-xs sm:text-sm">{formatCount(likeCount)}</span>
          </button>
        </div>

        {showComments && (
          <CommentSection
            comments={commentList}
            onAddComment={handleAddComment}
            onDelete={handleDeleteComment}
            onLike={handleLikeComment}
          />
        )}
      </div>
    </article>
  );
}
