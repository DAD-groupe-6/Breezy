import Sidebar from "@/components/navigation/Sidebar";
import NavbarMobile from "@/components/navigation/NavbarMobile";
import AppTopNavbar from "@/components/navigation/TopNavbar";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { MessagesProvider } from "@/providers/MessagesProvider";

export default function AppLayout({ children }) {
  return (
    <NotificationsProvider>
      <MessagesProvider>
        <div className="flex min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
          <Sidebar />
          <main className="flex flex-1 flex-col bg-[var(--color-bg-primary)] pb-16 md:pb-0">
            <AppTopNavbar />
            <div className="min-h-0 flex-1">{children}</div>
          </main>
          <NavbarMobile />
        </div>
      </MessagesProvider>
    </NotificationsProvider>
  );
}
