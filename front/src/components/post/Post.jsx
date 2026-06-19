'use client';

import { useState } from 'react';
import UserInfo from '../UserInfo';
import PostMenu from './PostMenu';
import PostActions from './PostActions';
import CommentSection from './CommentSection';
import api from '@/utils/api';
import { getCurrentUserId } from '@/utils/auth';
import { usePostLikes } from '@/hooks/usePostLikes';
import { useComments } from '@/hooks/useComments';
import { useTranslation } from '@/hooks/useTranslation';

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
  onViewProfile,
  onReport,
  onDelete,
}) {
  const [showComments, setShowComments] = useState(false);
  const { t } = useTranslation();

  const postLikes = usePostLikes(postId, liked, likes);
  const commentsHook = useComments(postId, comments);
  const isMine = String(authorId) === String(getCurrentUserId());

  const handleDeletePost = async () => {
    try {
      await api.delete(`/post/${postId}`);
      onDelete?.(postId);
    } catch (err) {
      console.error('[Post] Failed to delete post', err);
    }
  };

  const handleReportPost = async () => {
    try {
      const { data } = await api.post(`/post/${postId}/report`);
      if (data?.deleted) {
        onReport?.(postId);
        onDelete?.(postId);
      }
    } catch (err) {
      console.error('[Post] Failed to report post', err);
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

          <PostMenu
            isMine={isMine}
            onViewProfile={onViewProfile}
            onReport={handleReportPost}
            onDelete={handleDeletePost}
          />
        </div>

        {content && (
          <p className="text-[var(--color-text-primary)] text-sm sm:text-base leading-relaxed mb-2 break-words">{content}</p>
        )}

        {image && (
          <div className="mb-2 rounded-2xl overflow-hidden border border-[var(--color-border)] w-full">
            <img src={image} alt={t('post.imageAlt')} className="w-full h-auto object-cover max-h-96" />
          </div>
        )}

        {video && (
          <div className="mb-2 rounded-2xl overflow-hidden border border-[var(--color-border)] w-full">
            <video src={video} controls className="w-full h-auto max-h-96" />
          </div>
        )}

        <PostActions
          commentCount={commentsHook.count}
          liked={postLikes.liked}
          likeCount={postLikes.count}
          onComment={handleCommentClick}
          onLike={(e) => { e.stopPropagation(); postLikes.toggle(); }}
        />

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
