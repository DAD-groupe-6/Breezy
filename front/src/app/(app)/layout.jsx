import Sidebar from "@/components/Sidebar";
import NavbarMobile from "@/components/NavbarMobile";
import AppTopNavbar from "@/components/TopNavbar";

export default function AppLayout({ children }) {
  return (
<<<<<<< HEAD
    <div className="flex min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Sidebar />
      <main className="flex flex-1 flex-col bg-[var(--color-bg-primary)] pb-16 md:pb-0">
=======
    <div className="min-h-screen flex text-[var(--color-text-primary)] bg-[var(--color-bg-primary)]">
      <Sidebar />
      <main className="flex flex-1 flex-col pb-16 md:pb-0">
>>>>>>> origin/dev
        <AppTopNavbar />
        <div className="flex-1">{children}</div>
      </main>
      <NavbarMobile />
    </div>
  );
}
