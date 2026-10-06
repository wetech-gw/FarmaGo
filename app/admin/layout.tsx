import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { logoutAction } from "@/app/login/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const unreadMessages = await prisma.contactMessage.count({ where: { isRead: false } });

  return (
    <div className="d-flex flex-column flex-lg-row bg-light min-vh-100">
      <AdminSidebar
        user={user}
        logoutAction={logoutAction}
        unreadMessages={unreadMessages}
      />

      <main className="flex-grow-1 p-4 p-lg-5 overflow-auto">{children}</main>
    </div>
  );
}