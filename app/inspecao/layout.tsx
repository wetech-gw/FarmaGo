import { requireInspector } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import InspecaoSidebar from "@/components/inspecao/InspecaoSidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InspecaoLayout({ children }: { children: React.ReactNode }) {
  const user = await requireInspector();
  const unreviewedNotifications = await prisma.notification.count({ where: { reviewedAt: null } });

  return (
    <div className="d-flex flex-column flex-lg-row bg-light min-vh-100">
      <InspecaoSidebar user={user} logoutAction={logoutAction} unreviewedNotifications={unreviewedNotifications} />
      <main className="flex-grow-1 p-4 p-lg-5 overflow-auto">{children}</main>
    </div>
  );
}
