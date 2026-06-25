"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaHome, FaCompass, FaBell, FaEnvelope, FaUser, FaPlus, FaCog } from "react-icons/fa";
import Badge from "@/components/ui/Badge";
import { useTranslation } from "@/hooks/useTranslation";
import { useNotifications } from "@/providers/NotificationsProvider";
import { useMessagesBadge } from "@/providers/MessagesProvider";
import { useAuth } from "@/providers/AuthProvider";

export default function NavbarMobile({ forceShow = false }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  const { unreadCount: messagesUnread } = useMessagesBadge();
  const { hasPermission, permsLoaded } = useAuth();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const accumulatedDown = useRef(0);

  // Visible tant que les permissions ne sont pas chargées (évite un flash) ou si accordée.
  const canSee = (permission) => !permission || !permsLoaded || hasPermission(permission);

  const navItems = [
    { href: "/", icon: FaHome, labelKey: "nav.home", permission: "view_feed" },
    { href: "/explorer", icon: FaCompass, labelKey: "nav.explorer", permission: "search" },
    { href: "/notifications", icon: FaBell, labelKey: "nav.notifications", badge: unreadCount, permission: "receive_notifications" },
    { href: "/messages", icon: FaEnvelope, labelKey: "nav.messages", badge: messagesUnread, permission: "send_messages" },
    { href: "/profil", icon: FaUser, labelKey: "nav.profil" },
  ].filter((item) => canSee(item.permission));

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (delta > 0) {
        accumulatedDown.current += delta;
        if (accumulatedDown.current > 80) {
          setVisible(false);
        }
      } else if (delta < 0) {
        accumulatedDown.current = 0;
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sur /messages la barre est rendue depuis la liste des conversations
  // (avec forceShow) pour ne pas l'afficher par-dessus le fil de discussion.
  if (!forceShow && pathname === '/messages') return null

  return (
    <nav className={`fixed bottom-[var(--space-md)] left-[var(--space-md)] right-[var(--space-md)] z-50 flex h-16 items-center justify-around rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-surface)_78%,transparent)] shadow-[var(--shadow-lg)] backdrop-blur-xl transition-transform duration-300 sm:hidden ${visible ? "translate-y-0" : "translate-y-32"}`}>
      {navItems.map(({ href, icon: Icon, labelKey, badge }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={t(labelKey)}
            className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius-pill)] transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] ${
              isActive ? "bg-[var(--color-accent-soft)] text-[var(--color-text-title)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <span className="relative inline-flex h-6 w-6 items-center justify-center">
              <Icon size={20} />
              {badge > 0 && (
                <span className="absolute -top-2 left-3"><Badge count={badge} /></span>
              )}
            </span>
          </Link>
        );
      })}

      {canSee('publish_post') && (
        <Link
          href="/nouvelle-publication"
          aria-label={t('nav.createPost')}
          className="flex h-full flex-1 flex-col items-center justify-center rounded-[var(--radius-pill)] text-[var(--color-text-secondary)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          <FaPlus size={24} />
        </Link>
      )}

      <Link
        href="/settings"
        aria-label={t('nav.settings')}
        className="flex h-full flex-1 flex-col items-center justify-center rounded-[var(--radius-pill)] text-[var(--color-text-secondary)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
      >
        <FaCog size={22} />
      </Link>
    </nav>
  );
}
