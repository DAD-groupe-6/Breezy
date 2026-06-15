"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaHome, FaCompass, FaBell, FaEnvelope, FaUser, FaPlus } from "react-icons/fa";
import Badge from "@/components/ui/Badge";
import { useTranslation } from "@/hooks/useTranslation";

export default function NavbarMobile() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const accumulatedDown = useRef(0);

  const navItems = [
    { href: "/", icon: FaHome, labelKey: "nav.home" },
    { href: "/explorer", icon: FaCompass, labelKey: "nav.explorer" },
    { href: "/notifications", icon: FaBell, labelKey: "nav.notifications"},
    { href: "/messages", icon: FaEnvelope, labelKey: "nav.messages"},
    { href: "/profil", icon: FaUser, labelKey: "nav.profil" },
  ];

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

      <Link
        href="/nouvelle-publication"
        aria-label={t('nav.createPost')}
        className="flex h-full flex-1 flex-col items-center justify-center rounded-[var(--radius-pill)] text-[var(--color-text-secondary)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-title)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
      >
        <FaPlus size={24} />
      </Link>
    </nav>
  );
}
