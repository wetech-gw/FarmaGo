import { prisma } from "@/lib/prisma";
import AdminPharmacyMap from "@/components/admin/AdminPharmacyMap";
import { requireAdmin } from "@/lib/auth";
import { formatNumber, getI18n } from "@/lib/i18n";
import type { PharmacySpot } from "@/types/pharmacy";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { locale, t } = await getI18n();
  await requireAdmin();

  const pharmacies = await prisma.pharmacy.findMany({
    where: { status: "approved", isActive: true },
    include: {
      owner: { select: { name: true, email: true } },
      stocks: {
        include: {
          medication: { select: { name: true, dosage: true } },
        },
        orderBy: { expiryDate: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const spots: PharmacySpot[] = pharmacies.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    address: String(p.address),
    phone: p.phone,
    schedule: p.schedule,
    hours: p.hours,
    latitude: p.latitude,
    longitude: p.longitude,
    isOpen: p.isOpen,
    isGuard: p.isGuard,
    medications: p.stocks.map((s) => ({
      id: s.id,
      name: s.medication.name,
      dosage: s.medication.dosage,
      image: null,
      quantity: s.quantity,
      expiryDate: s.expiryDate.toISOString(),
      price: Number(s.unitPrice),
    })),
  }));

  const totalMedications = pharmacies.reduce((sum, p) => sum + p.stocks.length, 0);
  const totalUnits = pharmacies.reduce(
    (sum, p) => sum + p.stocks.reduce((s, stock) => s + stock.quantity, 0),
    0
  );

  return (
    <>
      <div className="mb-4">
        <h1 className="fw-bold m-0 fs-2">{t("admin.validatedPharmacies")}</h1>
        <p className="text-muted small m-0">
          {t("admin.statsLine", {
            pharmacies: pharmacies.length,
            medications: totalMedications,
            units: formatNumber(locale, totalUnits),
          })}
        </p>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold m-0">
            <i className="bi bi-geo-alt me-2" style={{ color: "#dc2626" }}></i>
            {t("admin.mapTitle")}
          </h6>
        </div>
        <div className="card-body" style={{ height: "400px" }}>
          <AdminPharmacyMap spots={spots} />
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">{t("common.pharmacy")}</th>
                <th className="fw-medium py-3">{t("common.owner")}</th>
                <th className="fw-medium py-3">{t("admin.thContact")}</th>
                <th className="fw-medium py-3">{t("medications")}</th>
                <th className="fw-medium py-3 text-center">{t("stock")}</th>
                <th className="fw-medium py-3 text-center pe-4">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map((p) => {
                const uniqueMeds = [...new Set(p.stocks.map((s) => s.medication.name))];
                const totalQty = p.stocks.reduce((sum, s) => sum + s.quantity, 0);

                return (
                  <tr key={p.id}>
                    <td className="ps-4 py-3">
                      <div className="fw-semibold text-dark">{p.name}</div>
                      <div className="text-muted small" style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {String(p.address)}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="fw-medium">{p.owner?.name ?? "—"}</div>
                      <div className="text-muted small">{p.owner?.email ?? ""}</div>
                    </td>
                    <td className="py-3 text-muted">{p.phone}</td>
                    <td className="py-3">
                      {uniqueMeds.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {uniqueMeds.slice(0, 3).map((name) => (
                            <span key={name} className="badge bg-light text-dark border" style={{ fontSize: "0.75rem" }}>
                              {name}
                            </span>
                          ))}
                          {uniqueMeds.length > 3 && (
                            <span className="badge bg-light text-secondary border" style={{ fontSize: "0.75rem" }}>
                              +{uniqueMeds.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted small">{t("admin.noStockShort")}</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge bg-light text-dark border">
                        {t("admin.unitsShort", { count: formatNumber(locale, totalQty) })}
                      </span>
                    </td>
                    <td className="py-3 text-center pe-4">
                      {p.isOpen
                        ? <span className="badge rounded-pill" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>{t("common.openBadge")}</span>
                        : <span className="badge rounded-pill" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>{t("common.closedBadge")}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}