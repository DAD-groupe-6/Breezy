import Sidebar from "@/components/Sidebar";
import NavbarMobile from "@/components/NavbarMobile";
import AppTopNavbar from "@/components/TopNavbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Sidebar />
      <main className="flex flex-1 flex-col bg-[var(--color-bg-surface)] pb-16 md:pb-0">
        <AppTopNavbar />
        <div className="flex-1">{children}</div>
      </main>
      <NavbarMobile />
    </div>
  );
}
