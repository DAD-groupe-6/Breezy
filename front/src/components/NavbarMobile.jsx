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
    { href: "/notifications", icon: FaBell, labelKey: "nav.notifications", badge: 3 },
    { href: "/messages", icon: FaEnvelope, labelKey: "nav.messages", badge: 2 },
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
    <nav className={`fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around bg-[var(--color-bg-surface)]/60 backdrop-blur-md border border-[var(--color-border)]/80 h-16 sm:hidden rounded-full shadow-lg shadow-black/20 transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-32"}`}>
      {navItems.map(({ href, icon: Icon, labelKey, badge }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={t(labelKey)}
            className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isActive ? "text-[var(--color-text-title)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <span className="relative inline-flex items-center justify-center w-6 h-6">
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
        className="flex flex-col items-center justify-center flex-1 h-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-title)] transition-colors"
      >
        <FaPlus size={24} />
      </Link>
    </nav>
  );
}
