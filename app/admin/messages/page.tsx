import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, getI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const { locale, t } = await getI18n();
  await requireAdmin();

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Marca tudo como lido ao abrir a página, tal como nas notificações.
  await prisma.contactMessage.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  const unread = messages.filter((message) => !message.isRead).length;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">{t("admin.messages")}</h1>
          <p className="text-muted small m-0">{t("admin.messagesSubtitle")}</p>
        </div>
        <span className="badge bg-light text-dark border">{messages.length}</span>
      </div>

      {unread > 0 && (
        <div className="alert alert-info rounded-4 small mb-3" role="status">
          <i className="bi bi-bell me-1"></i>
          {t("admin.messagesNew", { count: unread })}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="card border-0 rounded-4 shadow-sm bg-white">
          <div className="card-body text-center py-5 text-secondary">
            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
            {t("admin.messagesEmpty")}
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`card border-0 rounded-4 shadow-sm bg-white ${
                message.isRead ? "" : "border-start border-4 border-primary"
              }`}
            >
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <div className="fw-bold">{message.name}</div>
                  <small className="text-secondary">
                    {formatDateTime(locale, message.createdAt)}
                  </small>
                </div>

                {(message.email || message.phone) && (
                  <div className="d-flex flex-wrap gap-3 small mb-2">
                    {message.email && (
                      <a href={`mailto:${message.email}`} className="text-decoration-none">
                        <i className="bi bi-envelope me-1"></i>
                        {message.email}
                      </a>
                    )}
                    {message.phone && (
                      <a href={`tel:${message.phone}`} className="text-decoration-none">
                        <i className="bi bi-telephone me-1"></i>
                        {message.phone}
                      </a>
                    )}
                  </div>
                )}

                {message.subject && (
                  <p className="fw-semibold mb-1">{message.subject}</p>
                )}

                <p className="mb-0 text-break" style={{ whiteSpace: "pre-wrap" }}>
                  {message.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}