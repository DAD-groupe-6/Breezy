'use client';

import { useState, useRef, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';

export default function PostMenu({ isMine, onViewProfile, onReport, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const itemClass =
    'w-full text-left px-4 py-3 hover:bg-[var(--color-bg-surface-2)] text-sm font-medium transition-colors';

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-title)] hover:bg-[var(--color-bg-surface-2)] rounded-full p-2 transition-colors"
        aria-label="Plus d'options"
      >
        <FaEllipsisH size={14} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-20 overflow-hidden">
          <button
            className={`${itemClass} text-[var(--color-text-primary)]`}
            onClick={() => { setOpen(false); onViewProfile?.(); }}
          >
            Voir le profil
          </button>
          <button
            className={`${itemClass} text-rose-600 border-t border-[var(--color-border)]`}
            onClick={() => { setOpen(false); onReport?.(); }}
          >
            Signaler
          </button>
          {isMine && (
            <button
              className={`${itemClass} text-rose-600 border-t border-[var(--color-border)]`}
              onClick={() => { setOpen(false); onDelete?.(); }}
            >
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
