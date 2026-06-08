"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser } from "react-icons/fa";

const navItems = [
  { href: "/", icon: FaHome, label: "Accueil" },
  { href: "/search", icon: FaSearch, label: "Recherche" },
  { href: "/notifications", icon: FaBell, label: "Notifications" },
  { href: "/messages", icon: FaEnvelope, label: "Messages" },
  { href: "/profile", icon: FaUser, label: "Profil" },
];

export default function NavbarMobile() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-gray-200 h-16 md:hidden">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isActive ? "text-blue-500" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon size={24} />
            <span className="text-xs">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
