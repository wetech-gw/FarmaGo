import { prisma } from "@/lib/prisma";
import { requireInspector } from "@/lib/auth";
import AdminPharmacyMap from "@/components/admin/AdminPharmacyMap";
import { getT } from "@/lib/i18n";
import type { PharmacySpot } from "@/types/pharmacy";

export const dynamic = "force-dynamic";

export default async function InspecaoPage() {
  const t = await getT();
  await requireInspector();

  const [total, guards, pending, pharmacies] = await Promise.all([
    prisma.pharmacy.count({ where: { status: "approved" } }),
    prisma.pharmacy.count({ where: { status: "approved", isGuard: true } }),
    prisma.pharmacy.count({ where: { status: "pending" } }),
    prisma.pharmacy.findMany({
      where: { status: "approved", isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

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
    medications: [],
  }));

  const kpis = [
    { label: t("insp.approved"), value: total, icon: "bi-building-add", color: "#4f46e5" },
    { label: t("insp.onDuty"), value: guards, icon: "bi-clock-history", color: "#0891b2" },
    { label: t("insp.pending"), value: pending, icon: "bi-hourglass-split", color: "#ea580c" },
  ];

  return (
    <>
      <h1 className="h4 fw-bold mb-1">{t("insp.dashboardTitle")}</h1>
      <p className="text-secondary small mb-4">{t("insp.dashboardSubtitle")}</p>

      <div className="row g-3 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="col-12 col-md-4">
            <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-secondary small mb-1">{k.label}</p>
                  <h4 className="fw-bold m-0">{k.value}</h4>
                </div>
                <i className={`bi ${k.icon} fs-2`} style={{ color: k.color }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
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
    </>
  );
}