import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, getI18n, readStoredMessage } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { locale, t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");
  if (!user.pharmacyId) redirect("/dashboard/sem-farmacia");

  const notifications = await prisma.notification.findMany({
    where: { pharmacyId: user.pharmacyId },
    orderBy: { createdAt: "desc" },
  });

  // Marca todas como lidas ao abrir a página.
  await prisma.notification.updateMany({
    where: { pharmacyId: user.pharmacyId, isRead: false },
    data: { isRead: true },
  });

  return (
    <>
      <h1 className="h4 fw-bold mb-1">{t("notifications")}</h1>
      <p className="text-secondary small mb-4">
        {t("dash.notificationsSubtitle")}
      </p>

      {notifications.length === 0 ? (
        <div className="card border-0 rounded-4 shadow-sm bg-white">
          <div className="card-body text-center py-5 text-secondary">
            <i className="bi bi-bell-slash fs-1 d-block mb-2"></i>
            {t("dash.noNotifications")}
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notifications.map((n) => (
            <div key={n.id} className="card border-0 rounded-4 shadow-sm bg-white">
              <div className="card-body d-flex gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 42, height: 42, backgroundColor: "#e0f2fe" }}
                >
                  <i className="bi bi-bell" style={{ color: "#0369a1" }}></i>
                </div>
                <div>
                  <p className="mb-1">{readStoredMessage(t, n.message)}</p>
                  <small className="text-secondary">
                    {formatDateTime(locale, n.createdAt)}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}