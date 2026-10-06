import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { logoutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: user.pharmacyId ?? -1 },
    select: { id: true, name: true, status: true, isOpen: true, rejectionReason: true },
  });
  const unreadNotifications = user.pharmacyId
    ? await prisma.notification.count({ where: { pharmacyId: user.pharmacyId, isRead: false } })
    : 0;

  return (
    <div className="d-flex flex-column flex-lg-row bg-light min-vh-100">
      <DashboardSidebar
        user={user}
        pharmacy={pharmacy}
        logoutAction={logoutAction}
        unreadNotifications={unreadNotifications}
      />

      <main className="flex-grow-1 p-4 p-lg-5 overflow-auto">{children}</main>
    </div>
  );
}