'use client';

import { useEffect, useRef, useState } from 'react';
import { useComments } from '@/hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import LoadMoreButton from './LoadMoreButton';

// Sous-conversation d'un commentaire : réutilise useComments(commentId).
// Toutes les réponses sont à plat ici (le serveur ré-ancre sur ce commentaire).
export default function RepliesThread({ commentId, autoFocus = false }) {
  // order 'asc' : les réponses sont chronologiques, les nouvelles apparaissent en bas.
  const replies = useComments(commentId, undefined, { order: 'asc' });
  // Cible "↳ @pseudo" du prochain envoi : null = réponse au commentaire lui-même.
  const [target, setTarget] = useState(null);
  const inputRef = useRef(null);

  // Charge la 1re tranche de réponses au montage (à l'ouverture du fil).
  const { load } = replies;
  useEffect(() => {
    load();
  }, [load]);

  // Place le curseur dans la zone de texte quand le fil s'ouvre via "Répondre".
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Cible une réponse précise + place le curseur prêt à écrire.
  const handleReplyTo = (reply) => {
    setTarget({ id: reply.id, username: reply.username });
    inputRef.current?.focus();
  };

  const handleSubmit = (value) => {
    replies.add(value, target?.id ?? commentId);
    setTarget(null);
  };

  return (
    <div className="mt-2 space-y-2 border-l-2 border-[var(--color-bg-surface-2)] pl-3">
      {replies.list.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isReply
          onReply={() => handleReplyTo(reply)}
          onDelete={replies.remove}
          onLike={replies.like}
        />
      ))}

      {replies.hasMore && <LoadMoreButton onClick={replies.loadMore} />}

      <CommentForm
        onSubmit={handleSubmit}
        replyTarget={target}
        onCancelTarget={() => setTarget(null)}
        inputRef={inputRef}
      />
    </div>
  );
}
