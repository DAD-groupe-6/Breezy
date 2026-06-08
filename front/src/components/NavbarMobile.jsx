"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaCompass, FaBell, FaEnvelope, FaUser, FaPlus } from "react-icons/fa";
import Avatar from "@/components/Avatar";

const navItems = [
  { href: "/", icon: FaHome, label: "Accueil" },
  { href: "/explorer", icon: FaCompass, label: "Explorer" },
  { href: "/notifications", icon: FaBell, label: "Notifications" },
  { href: "/messages", icon: FaEnvelope, label: "Messages" },
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

      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={24} />
          </Link>
        );
      })}
    </nav>
  );
}
