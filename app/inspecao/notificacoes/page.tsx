import { prisma } from "@/lib/prisma";
import { requireInspector } from "@/lib/auth";
import { formatDateTime, getI18n, readStoredMessage } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function InspecaoNotificacoesPage() {
  const { locale, t } = await getI18n();
  await requireInspector();

  const notifications = await prisma.notification.findMany({
    include: { pharmacy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Marca como revistas ao abrir a página.
  await prisma.notification.updateMany({
    where: { reviewedAt: null },
    data: { reviewedAt: new Date() },
  });

  return (
    <>
      <h1 className="h4 fw-bold mb-1">{t("insp.notificationsTitle")}</h1>
      <p className="text-secondary small mb-4">{t("insp.notificationsSubtitle")}</p>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          {notifications.length === 0 ? (
            <p className="text-secondary small mb-0 text-center py-4">{t("insp.noNotifications")}</p>
          ) : (
            <ul className="list-unstyled mb-0">
              {notifications.map((n) => (
                <li key={n.id} className="py-3 border-bottom">
                  <div className="fw-semibold">{n.pharmacy.name}</div>
                  <div className="text-secondary small">{readStoredMessage(t, n.message)}</div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {formatDateTime(locale, n.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}