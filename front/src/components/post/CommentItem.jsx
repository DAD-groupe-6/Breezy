'use client';

import { useState } from 'react';
import { FiTrash2, FiCornerDownRight } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import LikeButton from './LikeButton';
import RepliesThread from './RepliesThread';

// comment : objet mappé par useComments
// isReply : true si c'est une réponse (pas de sous-niveau, affiche "↳ @pseudo")
// onReply : callback appelé sur "Répondre" (les réponses l'utilisent pour cibler @pseudo)
export default function CommentItem({ comment, onDelete, onLike, isReply = false, onReply }) {
  const { t } = useTranslation();
  const [showReplies, setShowReplies] = useState(false);
  const [autoFocusReply, setAutoFocusReply] = useState(false);

  const handleReplyClick = () => {
    if (isReply) {
      onReply?.(comment);         
    } else {
      setShowReplies(true);       
      setAutoFocusReply(true);    
    }
  };

  return (
    <div className="rounded-lg border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-surface)] px-3 py-2">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-text-primary)]">{comment.displayName}</span>
          <span className="text-[var(--color-text-secondary)]">@{comment.username}</span>
          <span className="text-[var(--color-text-secondary)]">{comment.timestamp}</span>
        </div>
        {comment.canDelete && (
          <button
            type="button"
            onClick={() => onDelete?.(comment.id)}
            className="shrink-0 text-[var(--color-text-secondary)] transition-colors hover:text-rose-500"
            aria-label={t('comments.deleteAria')}
          >
            <FiTrash2 size={13} />
          </button>
        )}
      </div>

      {/* Flèche "↳ @pseudo" : à qui répond cette réponse */}
      {comment.replyToName && (
        <p className="mb-1 flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
          <FiCornerDownRight size={12} />
          <span className="font-medium text-[var(--color-text-title)]">@{comment.replyToName}</span>
        </p>
      )}

      <p className="text-sm text-[var(--color-text-primary)]">{comment.content}</p>

      <div className="mt-1.5 flex items-center gap-3">
        <LikeButton
          liked={comment.liked}
          count={comment.likesCount}
          onClick={() => onLike?.(comment.id)}
          size={12}
          hideZero
          label={t('comments.likeAria')}
        />
        <button
          type="button"
          onClick={handleReplyClick}
          className="text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-title)]"
        >
          {t('comments.reply')}
        </button>
      </div>

      {/* Toggle "Voir les N réponses" + sous-conversation (commentaires racine uniquement) */}
      {!isReply && (
        <>
          {comment.repliesCount > 0 && !showReplies && (
            <button
              type="button"
              onClick={() => { setShowReplies(true); setAutoFocusReply(false); }}
              className="mt-2 text-xs font-semibold text-[var(--color-text-title)] hover:underline"
            >
              {t('comments.viewRepliesBefore')} {comment.repliesCount} {t('comments.viewRepliesAfter')}
            </button>
          )}
          {showReplies && (
            <>
              <RepliesThread commentId={comment.id} autoFocus={autoFocusReply} />
              <button
                type="button"
                onClick={() => setShowReplies(false)}
                className="mt-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:underline"
              >
                {t('comments.hideReplies')}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
