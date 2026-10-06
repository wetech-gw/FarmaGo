import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { daysUntil } from "@/lib/dates";
import { formatDate, formatNumber, getI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ pharmacy?: string }>;
}) {
  const { locale, t } = await getI18n();
  await requireAdmin();

  const { pharmacy } = await searchParams;
  const pharmacyId = pharmacy ? parseInt(pharmacy) : undefined;

  const [stocks, pharmacies] = await Promise.all([
    prisma.pharmacyStock.findMany({
      where: pharmacyId ? { pharmacyId } : {},
      include: {
        pharmacy:   { select: { name: true } },
        medication: { select: { name: true, dosage: true } },
      },
      orderBy: { expiryDate: "asc" },
    }),
    prisma.pharmacy.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const hasUrgent = stocks.some((s) => {
    const days = daysUntil(s.expiryDate);
    return days >= 0 && days <= 30;
  });

  const totalUnits = stocks.reduce((sum, s) => sum + s.quantity, 0);

  const totalByPharmacy = pharmacies.map((p) => {
    const items = stocks.filter((s) => s.pharmacyId === p.id);
    return {
      id:    p.id,
      name:  p.name,
      total: items.reduce((sum, s) => sum + s.quantity, 0),
      count: items.length,
    };
  }).filter((p) => p.count > 0);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">{t("admin.stockTitle")}</h1>
          <p className="text-muted small m-0">
            {t("admin.stockSubtitle", {
              entries: formatNumber(locale, stocks.length),
              units: formatNumber(locale, totalUnits),
            })}
          </p>
        </div>
      </div>

      {hasUrgent && (
        <div className="alert border-0 rounded-3 mb-4 d-flex align-items-center gap-3"
          style={{ backgroundColor: "#fff7ed", color: "#9a3412" }}>
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <span className="fw-medium small">{t("admin.stockUrgentWarning")}</span>
        </div>
      )}

      {totalByPharmacy.length > 0 && (
        <div className="d-flex gap-3 mb-4 flex-wrap">
          {totalByPharmacy.map((p) => (
            <a key={p.id} href={`/admin/stock?pharmacy=${p.id}`}
              className={`card border-0 rounded-3 p-3 text-decoration-none shadow-sm ${pharmacyId === p.id ? "border border-dark" : ""}`}
              style={{ minWidth: "160px", backgroundColor: pharmacyId === p.id ? "#f0fdf4" : "#fff" }}>
              <div className="fw-semibold text-dark small"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                {p.name}
              </div>
              <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                {t("admin.stockPerPharmacy", {
                  count: formatNumber(locale, p.count),
                  units: formatNumber(locale, p.total),
                })}
              </div>
            </a>
          ))}
          {pharmacyId && (
            <a href="/admin/stock"
              className="btn btn-sm btn-outline-secondary rounded-3 align-self-center px-3">
              {t("admin.seeEverything")}
            </a>
          )}
        </div>
      )}

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold m-0">
            {pharmacyId
              ? t("admin.stockFor", { name: pharmacies.find((p) => p.id === pharmacyId)?.name ?? "" })
              : t("admin.allStockEntries")}
          </h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">{t("common.pharmacy")}</th>
                <th className="fw-medium py-3">{t("common.medication")}</th>
                <th className="fw-medium py-3 text-center">{t("common.quantity")}</th>
                <th className="fw-medium py-3">{t("common.batch")}</th>
                <th className="fw-medium py-3">{t("common.expiry")}</th>
                <th className="fw-medium py-3 text-center">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted">{t("admin.noStockFound")}</td></tr>
              ) : stocks.map((s) => {
                const daysLeft  = daysUntil(s.expiryDate);
                const isExpired = daysLeft < 0;
                const isUrgent  = !isExpired && daysLeft <= 30;
                const isWarning = !isExpired && daysLeft <= 90 && daysLeft > 30;

                return (
                  <tr key={s.id}>
                    <td className="ps-4 py-3 fw-medium text-dark"
                      style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.pharmacy.name}
                    </td>
                    <td className="py-3 fw-semibold">
                      {s.medication.name}
                      <span className="text-muted fw-normal ms-1 small">{s.medication.dosage}</span>
                    </td>
                    <td className="py-3 text-center fw-bold">{formatNumber(locale, s.quantity)}</td>
                    <td className="py-3 text-muted">{s.batchNumber ?? t("common.notAvailableYet")}</td>
                    <td className="py-3 text-muted">{formatDate(locale, s.expiryDate)}</td>
                    <td className="py-3 text-center">
                      {isExpired
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>{t("admin.expired")}</span>
                        : isUrgent
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#ffedd5", color: "#ea580c" }}>{t("admin.daysLeft", { count: daysLeft })}</span>
                        : isWarning
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#fef9c3", color: "#a16207" }}>{t("admin.daysLeft", { count: daysLeft })}</span>
                        : <span className="badge rounded-pill" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>{t("admin.ok")}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {stocks.length > 0 && (
              <tfoot className="border-top">
                <tr>
                  <td colSpan={2} className="ps-4 py-3 text-muted small fw-medium">{t("common.total")}</td>
                  <td className="py-3 text-center fw-bold">{formatNumber(locale, totalUnits)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}