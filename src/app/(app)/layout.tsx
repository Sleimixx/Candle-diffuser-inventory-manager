import NavSidebar from "./NavSidebar";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen md:flex">
      <NavSidebar username={user.username} shopName={user.shopName || user.username} />
      <main className="flex-1 p-4 md:p-8 pt-18 md:pt-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
