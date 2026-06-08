import Sidebar from "@/components/Sidebar";
import NavbarMobile from "@/components/NavbarMobile";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-white text-gray-900">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <NavbarMobile />
    </div>
  );
}
