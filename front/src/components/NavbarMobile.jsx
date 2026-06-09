"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaCompass, FaBell, FaEnvelope, FaUser, FaPlus } from "react-icons/fa";
import Badge from "@/components/ui/Badge";

const navItems = [
  { href: "/", icon: FaHome, label: "Accueil" },
  { href: "/explorer", icon: FaCompass, label: "Explorer" },
  { href: "/notifications", icon: FaBell, label: "Notifications", badge: 3 },
  { href: "/messages", icon: FaEnvelope, label: "Messages", badge: 2 },
  { href: "/profil", icon: FaUser, label: "Profil" },
];

export default function NavbarMobile() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-gray-100 h-16 md:hidden">
      <button
        aria-label="Créer un post"
        className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <FaPlus size={24} />
      </button>

      {navItems.map(({ href, icon: Icon, label, badge }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="relative inline-flex items-center justify-center w-6 h-6">
              <Icon size={20} />
              {badge > 0 && (
                <span className="absolute -top-2 left-3"><Badge count={badge} /></span>
              )}
            </span>
            <span className="text-xs">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
