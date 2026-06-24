'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserInfo from '@/components/user/UserInfo';
import PostMenu from './PostMenu';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import CommentSection from './CommentSection';
import ConfirmDialog from '../ui/ConfirmDialog';
import api from '@/utils/api';
import { deleteMedia } from '@/utils/media';
import { getCurrentUserId } from '@/utils/auth';
import { usePostLikes } from '@/hooks/usePostLikes';
import { useComments } from '@/hooks/useComments';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/providers/AuthProvider';
import { inferSearchKind } from '@/utils/search';
import BanModal from '@/components/moderation/BanModal';

const TOKEN_REGEX = /[#@][A-Za-z0-9_]+/g;

function renderContentWithTokens(text, onTokenClick) {
  const parts = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(TOKEN_REGEX)) {
    const token = match[0];
    const start = match.index ?? 0;
    const previousChar = start > 0 ? text[start - 1] : '';

    // Evite de transformer des sous-chaînes comme l'intérieur d'un email.
    if (previousChar && /[A-Za-z0-9_]/.test(previousChar)) continue;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    parts.push(
      <button
        key={`token-${key}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTokenClick(token);
        }}
        className="mx-0 inline cursor-pointer rounded-sm border-0 bg-transparent p-0 font-semibold text-[var(--color-text-title)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text-title)] focus-visible:ring-offset-1"
      >
        {token}
      </button>
    );

    key += 1;
    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function Post({
  postId,
  authorId,
  displayName,
  username,
  imageUrl = null,
  timestamp,
  content = '',
  images = [],
  video = null,
  likes = 0,
  liked = false,
  comments = 0,
  onViewProfile,
  onReport,
  onDelete,
}) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banPending, setBanPending] = useState(false);
  const [isAuthorBanned, setIsAuthorBanned] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();

  const postLikes = usePostLikes(postId, liked, likes);
  const commentsHook = useComments(postId, comments);
  const isMine = String(authorId) === String(getCurrentUserId());
  const canModerate = hasPermission('moderate_users');

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/post/${postId}`);
      // Le post est supprimé : on nettoie ses médias rattachés (sinon orphelins).
      deleteMedia([...images, video]);
      toast.success(t('toasts.postDeleted'));
      setConfirmOpen(false);
      onDelete?.(postId);
    } catch (err) {
      toast.error(t('toasts.postDeleteError'));
      console.error('[Post] Échec de la suppression du post', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmReport = async () => {
    setReporting(true);
    try {
      const { data } = await api.post(`/post/${postId}/report`);
      setReported(true);
      setReportOpen(false);
      if (data?.deleted) {
        onReport?.(postId);
        onDelete?.(postId);
      } else {
        toast.success(t('toasts.postReported'));
      }
    } catch (err) {
      if (err.response?.data?.message === 'Already reported') {
        setReported(true);
        setReportOpen(false);
        toast.info(t('toasts.alreadyReported'));
      } else {
        toast.error(t('toasts.reportError'));
      }
      console.error('[Post] Failed to report post', err);
    } finally {
      setReporting(false);
    }
  };

  const handleBanAuthor = async (durationDays) => {
    setBanPending(true);
    try {
      await api.post(`/user/${authorId}/ban`, { durationDays });
      setIsAuthorBanned(true);
      toast.success(t('toasts.banSuccess'));
      setBanModalOpen(false);
    } catch {
      toast.error(t('toasts.banError'));
    } finally {
      setBanPending(false);
    }
  };

  const handleUnbanAuthor = async () => {
    try {
      await api.post(`/user/${authorId}/unban`);
      setIsAuthorBanned(false);
      toast.success(t('toasts.unbanSuccess'));
    } catch {
      toast.error(t('toasts.unbanError'));
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    const next = !showComments;
    setShowComments(next);
    if (next) commentsHook.load();
  };

  const handleTokenClick = (token) => {
    const kind = inferSearchKind(token) || 'content';
    const params = new URLSearchParams({ q: token, kind, nav: String(Date.now()) });
    router.push(`/explorer?${params.toString()}`);
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
            canModerate={canModerate}
            isAuthorBanned={isAuthorBanned}
            onViewProfile={onViewProfile}
            alreadyReported={reported}
            onReport={() => setReportOpen(true)}
            onDelete={() => setConfirmOpen(true)}
            onBanAuthor={() => setBanModalOpen(true)}
            onUnbanAuthor={handleUnbanAuthor}
          />
        </div>

        {content && (
          <p className="text-[var(--color-text-primary)] text-sm sm:text-base leading-relaxed mb-2 break-words">
            {renderContentWithTokens(content, handleTokenClick)}
          </p>
        )}

        <PostMedia images={images} />

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
            hasMore={commentsHook.hasMore}
            onLoadMore={commentsHook.loadMore}
            onAddComment={commentsHook.add}
            onDelete={commentsHook.remove}
            onLike={commentsHook.like}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('post.deleteConfirm.title')}
        message={t('post.deleteConfirm.message')}
        confirmLabel={deleting ? t('post.deleteConfirm.deleting') : t('post.deleteConfirm.confirm')}
        cancelLabel={t('post.deleteConfirm.cancel')}
        onConfirm={handleConfirmDelete}
        onClose={() => { if (!deleting) setConfirmOpen(false); }}
        loading={deleting}
        danger
      />

      <ConfirmDialog
        isOpen={reportOpen}
        title={t('post.reportConfirm.title')}
        message={t('post.reportConfirm.message')}
        confirmLabel={t('post.reportConfirm.confirm')}
        cancelLabel={t('post.reportConfirm.cancel')}
        onConfirm={handleConfirmReport}
        onClose={() => { if (!reporting) setReportOpen(false); }}
        loading={reporting}
        danger
      />

      <BanModal
        isOpen={banModalOpen}
        onConfirm={handleBanAuthor}
        onClose={() => setBanModalOpen(false)}
        loading={banPending}
      />
    </article>
  );
}
