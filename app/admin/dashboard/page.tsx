import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { dateInDays, exactDaysUntil } from "@/lib/dates";
import { formatDate, formatNumber, getI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { locale, t } = await getI18n();
  await requireAdmin();

  // Dados reais da BD
  const [
    totalPharmacies,
    totalGuards,
    totalMedications,
    totalUsers,
    totalStock,
    expiringStock,
    pharmaciesWithOwners,
  ] = await Promise.all([
    prisma.pharmacy.count({ where: { isGuard: false } }),
    prisma.pharmacy.count({ where: { isGuard: true  } }),
    prisma.medication.count(),
    prisma.user.count(),
    prisma.pharmacyStock.aggregate({ _sum: { quantity: true } }),
    // Stock a caducar nos próximos 90 dias
    prisma.pharmacyStock.findMany({
      where: { expiryDate: { lte: dateInDays(90) } },
      include: { pharmacy: true, medication: true },
      orderBy: { expiryDate: "asc" },
      take: 5,
    }),
    // Farmácias com proprietários e contagem de stock
    prisma.pharmacy.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { stocks: true } },
      },
      orderBy: { id: "asc" },
      take: 8,
    }),
  ]);

  const totalQuantidade = totalStock._sum.quantity ?? 0;

  // Farmácias registadas pelo público que ainda esperam visita presencial
  const pendingCount = await prisma.pharmacy.count({ where: { status: "pending" } });

  const cards = [
    {
      label: t("pharmacies"),
      value: totalPharmacies,
      sub: t("admin.seeAll"),
      href: "/admin/pharmacies",
      icon: "bi-building-add",
      iconBg: "#fdf2f8",
      iconColor: "#db2777",
    },
    {
      label: t("medications"),
      value: totalMedications,
      sub: t("admin.dashUnitsInStock", { count: formatNumber(locale, totalQuantidade) }),
      href: "/admin/medications",
      icon: "bi-capsule",
      iconBg: "#e0e7ff",
      iconColor: "#4f46e5",
    },
    {
      label: t("guard"),
      value: totalGuards,
      sub: t("admin.dashGuardSeeAll"),
      href: "/admin/pharmacies?type=guard",
      icon: "bi-clock",
      iconBg: "#e0f2fe",
      iconColor: "#0891b2",
    },
    {
      label: t("users"),
      value: totalUsers,
      sub: t("admin.dashUsersSeeAll"),
      href: "/admin/users",
      icon: "bi-people",
      iconBg: "#ffedd5",
      iconColor: "#ea580c",
    },
  ];

  return (
    <>
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <h1 className="fw-bold m-0 fs-2">{t("dashboard")}</h1>
          <i className="bi bi-speedometer2 text-dark fs-3"></i>
        </div>
        <div className="d-flex gap-2">
          {pendingCount > 0 && (
            <Link
              href="/admin/validations?tab=pending"
              className="btn rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2 small text-white"
              style={{ backgroundColor: "#ea580c", borderColor: "#ea580c" }}
            >
              <i className="bi bi-patch-check small"></i>
              {t("admin.dashValidate", { count: pendingCount })}
            </Link>
          )}
        </div>
      </div>

      {/* 4 Cards de Stats */}
      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div key={card.label} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 rounded-4 px-3 py-3 shadow-sm bg-white h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary mb-1 fw-medium" style={{ fontSize: "0.78rem" }}>{card.label}</p>
                  <h4 className="fw-bold text-dark m-0 fs-3">{card.value}</h4>
                </div>
                <span className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "38px", height: "38px", backgroundColor: card.iconBg }}>
                  <i className={`bi ${card.icon}`} style={{ color: card.iconColor, fontSize: "1rem" }}></i>
                </span>
              </div>
              <div className="mt-2">
                <Link href={card.href} className="text-muted text-decoration-none" style={{ fontSize: "0.78rem" }}>
                  {card.sub}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de Farmácias + Stock a Caducar */}
      <div className="row g-4 mb-4">

        {/* Tabela: Farmácias com proprietário */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 rounded-4 shadow-sm bg-white">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0">{t("admin.dashRegisteredPharmacies")}</h6>
              <Link href="/admin/pharmacies" className="text-primary small text-decoration-none">{t("admin.seeAll")}</Link>
            </div>
            <div className="card-body px-0 pb-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
                  <thead className="border-bottom">
                    <tr className="text-secondary">
                      <th className="fw-medium ps-4 py-3">{t("common.pharmacy")}</th>
                      <th className="fw-medium py-3">{t("common.owner")}</th>
                      <th className="fw-medium py-3 text-center">{t("stock")}</th>
                      <th className="fw-medium py-3 text-center">{t("guard")}</th>
                      <th className="fw-medium py-3 text-center">{t("common.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmaciesWithOwners.map((p) => (
                      <tr key={p.id}>
                        <td className="ps-4 py-3">
                          <div className="fw-semibold text-dark" style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name}
                          </div>
                          <div className="text-muted small">{p.phone}</div>
                        </td>
                        <td className="py-3">
                          <div className="fw-medium">{p.owner.name}</div>
                          <div className="text-muted small">{p.owner.email}</div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge bg-light text-dark border">
                            {t("admin.itemsBadge", { count: p._count.stocks })}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {p.isGuard
                            ? <span className="badge rounded-pill" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>{t("common.yes")}</span>
                            : <span className="badge rounded-pill bg-light text-secondary">{t("common.no")}</span>
                          }
                        </td>
                        <td className="py-3 text-center">
                          {p.isOpen
                            ? <span className="badge rounded-pill" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>{t("common.openBadge")}</span>
                            : <span className="badge rounded-pill" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>{t("common.closedBadge")}</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Stock a Caducar */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0">
                <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                {t("admin.dashExpiringSoon")}
              </h6>
              <Link href="/admin/stock" className="text-primary small text-decoration-none">{t("admin.seeEverything")}</Link>
            </div>
            <div className="card-body">
              {expiringStock.length === 0 ? (
                <p className="text-muted small text-center mt-4">{t("admin.dashNoExpiring")}</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {expiringStock.map((s) => {
                    const daysLeft = Math.ceil(
                      exactDaysUntil(s.expiryDate)
                    );
                    const isUrgent = daysLeft <= 30;
                    return (
                      <div key={s.id} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ backgroundColor: isUrgent ? "#fff7ed" : "#f8fafc" }}>
                        <div>
                          <div className="fw-semibold text-dark small">{s.medication.name} <span className="text-muted fw-normal">{s.medication.dosage}</span></div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>{s.pharmacy.name}</div>
                        </div>
                        <div className="text-end">
                          <div className={`fw-bold small ${isUrgent ? "text-danger" : "text-warning"}`}>
                            {t("common.daysCount", { count: daysLeft })}
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {formatDate(locale, s.expiryDate)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}