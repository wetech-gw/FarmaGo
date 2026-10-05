import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { logoutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="d-flex bg-light min-vh-100">
      <AdminSidebar user={user} logoutAction={logoutAction} />

      <main className="flex-grow-1 p-4 p-lg-5 overflow-auto">{children}</main>
    </div>
  );
}