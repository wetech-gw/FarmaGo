import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { dateInDays, daysUntil } from "@/lib/dates";
import { formatCurrency, formatDate, formatNumber, getI18n } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n-core";

export const dynamic = "force-dynamic";

const CATEGORY_KEYS = {
  infraestrutura: "expense.categoryInfra",
  pessoal: "expense.categoryStaff",
  stock: "expense.categoryStock",
  outros: "expense.categoryOther",
} as const satisfies Record<string, TKey>;

export default async function AdminAnalysesPage() {
  const { locale, t } = await getI18n();
  await requireAdmin();

  // Despesas agrupadas por mês e categoria (equivale ao SELECT no teu SQL)
  const expenses = await prisma.expense.findMany({
    include: { pharmacy: { select: { name: true } } },
    orderBy: { expenseDate: "desc" },
  });

  // Agrupar por mês
  const byMonth: Record<string, { total: number; byCategory: Record<string, number> }> = {};
  for (const e of expenses) {
    const mes = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale === "fr" ? "fr-FR" : "pt-PT", {
      year: "numeric",
      month: "long",
    }).format(new Date(e.expenseDate));
    if (!byMonth[mes]) byMonth[mes] = { total: 0, byCategory: {} };
    byMonth[mes].total += Number(e.amount);
    byMonth[mes].byCategory[e.category] = (byMonth[mes].byCategory[e.category] ?? 0) + Number(e.amount);
  }

  // Stock a caducar (equivale ao segundo SELECT do teu SQL)
  const ninetyDays = dateInDays(90);
  const expiringStock = await prisma.pharmacyStock.findMany({
    where: { expiryDate: { lte: ninetyDays } },
    include: {
      pharmacy:   { select: { name: true } },
      medication: { select: { name: true, dosage: true } },
    },
    orderBy: { expiryDate: "asc" },
  });

  // Top farmácias por stock (equivale ao quarto SELECT do teu SQL)
  const pharmacyStats = await prisma.pharmacy.findMany({
    include: {
      owner:  { select: { name: true, email: true } },
      _count: { select: { stocks: true } },
    },
    orderBy: { id: "asc" },
  });

  // Totais gerais
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalStock    = await prisma.pharmacyStock.aggregate({ _sum: { quantity: true } });
  const totalQty      = totalStock._sum.quantity ?? 0;

  const categoryColors: Record<string, string> = {
    infraestrutura: "#3730a3",
    pessoal:        "#9d174d",
    stock:          "#15803d",
    outros:         "#374151",
  };

  const kpis = [
    { label: t("admin.totalExpenses"), value: formatCurrency(locale, totalExpenses), color: undefined },
    { label: t("admin.unitsInStock"), value: formatNumber(locale, totalQty), color: undefined },
    { label: t("admin.expiring90"), value: expiringStock.length, color: "#ea580c" },
    { label: t("admin.activePharmacies"), value: pharmacyStats.filter((p) => p.isOpen).length, color: undefined },
  ];

  return (
    <>
      <div className="mb-4">
        <h1 className="fw-bold m-0 fs-2">{t("admin.analysesTitle")}</h1>
        <p className="text-muted small m-0">{t("admin.analysesSubtitle")}</p>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-5">
        {kpis.map((kpi) => (
          <div className="col-6 col-xl-3" key={kpi.label}>
            <div className="card border-0 rounded-4 p-4 shadow-sm bg-white text-center">
              <p className="text-secondary small fw-medium mb-1">{kpi.label}</p>
              <h4 className="fw-bold text-dark m-0" style={kpi.color ? { color: kpi.color } : undefined}>
                {kpi.value}
              </h4>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Despesas por mês */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h6 className="fw-bold m-0">{t("admin.expensesByMonth")}</h6>
            </div>
            <div className="card-body">
              {Object.entries(byMonth).length === 0 ? (
                <p className="text-muted small text-center mt-4">{t("dash.noExpenses")}</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {Object.entries(byMonth).map(([mes, data]) => (
                    <div key={mes}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold text-dark small text-capitalize">{mes}</span>
                        <span className="fw-bold small">{formatCurrency(locale, data.total)}</span>
                      </div>
                      {/* Barras por categoria */}
                      <div className="d-flex gap-1" style={{ height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                        {Object.entries(data.byCategory).map(([cat, val]) => (
                          <div
                            key={cat}
                            title={`${cat}: ${formatNumber(locale, val)}`}
                            style={{
                              width: `${(val / data.total) * 100}%`,
                              backgroundColor: categoryColors[cat] ?? "#94a3b8",
                              borderRadius: "2px",
                            }}
                          />
                        ))}
                      </div>
                      {/* Legenda */}
                      <div className="d-flex gap-3 mt-2 flex-wrap">
                        {Object.entries(data.byCategory).map(([cat, val]) => (
                          <span key={cat} className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "0.75rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: categoryColors[cat] ?? "#94a3b8", display: "inline-block" }}></span>
                            <span className="text-capitalize">
                              {cat in CATEGORY_KEYS ? t(CATEGORY_KEYS[cat as keyof typeof CATEGORY_KEYS]) : cat}
                            </span>
                            <span className="fw-semibold text-dark">{formatCurrency(locale, val)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock a caducar */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h6 className="fw-bold m-0">
                <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                {t("admin.expiringSoonTitle")}
              </h6>
            </div>
            <div className="card-body">
              {expiringStock.length === 0 ? (
                <p className="text-muted small text-center mt-4">{t("admin.noExpiringSoon")}</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm mb-0" style={{ fontSize: "0.85rem" }}>
                    <thead className="border-bottom">
                      <tr className="text-secondary">
                        <th className="fw-medium py-2">{t("common.pharmacy")}</th>
                        <th className="fw-medium py-2">{t("common.medication")}</th>
                        <th className="fw-medium py-2 text-center">{t("admin.thDays")}</th>
                        <th className="fw-medium py-2">{t("common.expiry")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringStock.map((s) => {
                        const daysLeft = daysUntil(s.expiryDate);
                        const isUrgent = daysLeft <= 30;
                        return (
                          <tr key={s.id}>
                            <td className="py-2 text-dark fw-medium"
                              style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {s.pharmacy.name}
                            </td>
                            <td className="py-2">{s.medication.name} <span className="text-muted">{s.medication.dosage}</span></td>
                            <td className="py-2 text-center">
                              <span className="fw-bold small" style={{ color: isUrgent ? "#dc2626" : "#a16207" }}>
                                {daysLeft}
                              </span>
                            </td>
                            <td className="py-2 text-muted">{formatDate(locale, s.expiryDate)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ranking de farmácias por stock */}
      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h6 className="fw-bold m-0">{t("admin.pharmacyStockOwner")}</h6>
        </div>
        <div className="card-body px-0 pb-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
              <thead className="border-bottom">
                <tr className="text-secondary">
                  <th className="fw-medium ps-4 py-3">{t("common.pharmacy")}</th>
                  <th className="fw-medium py-3">{t("common.owner")}</th>
                  <th className="fw-medium py-3">{t("admin.thEmail")}</th>
                  <th className="fw-medium py-3 text-center">{t("admin.thProducts")}</th>
                  <th className="fw-medium py-3 text-center pe-4">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyStats.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4 py-3 fw-semibold text-dark">{p.name}</td>
                    <td className="py-3">{p.owner.name}</td>
                    <td className="py-3 text-muted">{p.owner.email}</td>
                    <td className="py-3 text-center">
                      <span className="badge bg-light text-dark border">{p._count.stocks}</span>
                    </td>
                    <td className="py-3 text-center pe-4">
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
    </>
  );
}