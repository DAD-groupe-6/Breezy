'use client';

import { useState, useRef, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import { useTranslation } from '@/hooks/useTranslation';

export default function PostMenu({ isMine, onViewProfile, onReport, onDelete }) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || !ref.current) return;

    const triggerRect = ref.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 170;
    const spaceBelow = window.innerHeight - triggerRect.bottom;

    setOpenUpward(spaceBelow < menuHeight + 12);
  }, [open, isMine]);

  const itemClass =
    'w-full text-left px-4 py-3 hover:bg-[var(--color-bg-surface-2)] text-sm font-medium transition-colors';

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-title)] hover:bg-[var(--color-bg-surface-2)] rounded-full p-2 transition-colors"
        aria-label={t('post.optionsAria')}
      >
        <FaEllipsisH size={14} />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={`absolute right-0 w-44 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-20 overflow-hidden ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`}
        >
          <button
            className={`${itemClass} text-[var(--color-text-primary)]`}
            onClick={() => { setOpen(false); onViewProfile?.(); }}
          >
            {t('post.viewProfile')}
          </button>
          <button
            className={`${itemClass} text-rose-600 border-t border-[var(--color-border)]`}
            onClick={() => { setOpen(false); onReport?.(); }}
          >
            {t('post.report')}
          </button>
          {isMine && (
            <button
              className={`${itemClass} text-rose-600 border-t border-[var(--color-border)]`}
              onClick={() => { setOpen(false); onDelete?.(); }}
            >
              {t('post.delete')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
