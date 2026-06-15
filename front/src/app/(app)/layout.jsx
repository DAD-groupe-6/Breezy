import Sidebar from "@/components/Sidebar";
import NavbarMobile from "@/components/NavbarMobile";
import AppTopNavbar from "@/components/TopNavbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex text-[var(--color-text-primary)] bg-[var(--color-light-primary)]">
      <Sidebar />
      <main className="flex flex-1 flex-col bg-[var(--color-bg-surface)] pb-16 md:pb-0">
        <AppTopNavbar />
        <div className="flex-1">{children}</div>
      </main>
      <NavbarMobile />
    </div>
  );
}
