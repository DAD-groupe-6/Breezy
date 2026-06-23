'use client';

import { useState, useRef, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/hooks/useTranslation';

export default function PostMenu({ isMine, canModerate, isAuthorBanned, onViewProfile, onReport, onDelete, onBanAuthor, onUnbanAuthor }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!open) return;

      const clickedTrigger = ref.current?.contains(e.target);
      const clickedMenu = menuRef.current?.contains(e.target);
      if (!clickedTrigger && !clickedMenu) setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !ref.current) return;

    const updateMenuPosition = () => {
      const triggerRect = ref.current.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight ?? 170;
      const menuWidth = menuRef.current?.offsetWidth ?? 176;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const shouldOpenUpward = spaceBelow < menuHeight + 12;

      let top = shouldOpenUpward
        ? triggerRect.top - menuHeight - 4
        : triggerRect.bottom + 4;
      let left = triggerRect.right - menuWidth;

      top = Math.max(8, Math.min(top, window.innerHeight - menuHeight - 8));
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

      setOpenUpward(shouldOpenUpward);
      setMenuPosition({ top, left });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
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

      {open && mounted && createPortal(
        <div
          ref={menuRef}
          className={`fixed w-44 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 overflow-hidden ${openUpward ? 'origin-bottom-right' : 'origin-top-right'}`}
          style={{ top: menuPosition.top, left: menuPosition.left }}
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
          {canModerate && !isMine && (
            isAuthorBanned ? (
              <button
                className={`${itemClass} font-semibold border-t border-[var(--color-border)] text-rose-600 hover:bg-[var(--color-bg-surface-2)]`}
                onClick={() => { setOpen(false); onUnbanAuthor?.(); }}
              >
                {t('moderation.unban')}
              </button>
            ) : (
              <button
                className={`${itemClass} font-semibold border-t border-[var(--color-border)] bg-rose-600 text-white hover:bg-rose-700`}
                onClick={() => { setOpen(false); onBanAuthor?.(); }}
              >
                {t('moderation.banAuthor')}
              </button>
            )
          )}
          {isMine && (
            <button
              className={`${itemClass} text-rose-600 border-t border-[var(--color-border)]`}
              onClick={() => { setOpen(false); onDelete?.(); }}
            >
              {t('post.delete')}
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
