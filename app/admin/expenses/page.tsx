import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate, getI18n } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n-core";

export const dynamic = "force-dynamic";

const CATEGORY_KEYS = {
  infraestrutura: "expense.categoryInfra",
  pessoal: "expense.categoryStaff",
  stock: "expense.categoryStock",
  outros: "expense.categoryOther",
} as const satisfies Record<string, TKey>;

const categoryColors: Record<string, { bg: string; text: string }> = {
  infraestrutura: { bg: "#e0e7ff", text: "#3730a3" },
  pessoal:        { bg: "#fce7f3", text: "#9d174d" },
  stock:          { bg: "#dcfce7", text: "#15803d" },
  outros:         { bg: "#f3f4f6", text: "#374151" },
};

export default async function AdminExpensesPage() {
  const { locale, t } = await getI18n();
  await requireAdmin();

  const expenses = await prisma.expense.findMany({
    include: { pharmacy: { select: { name: true } } },
    orderBy: { expenseDate: "desc" },
  });

  // Totais por categoria
  const totals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 fs-2">{t("dash.expensesTitle")}</h1>
          <p className="text-muted small m-0">
            {t("admin.expensesSubtitle", { count: expenses.length })}
          </p>
        </div>
      </div>

      {/* Cards de totais por categoria */}
      <div className="row g-3 mb-4">
        {Object.entries(totals).map(([cat, total]) => {
          const colors = categoryColors[cat] ?? categoryColors.outros;
          return (
            <div key={cat} className="col-6 col-xl-3">
              <div className="card border-0 rounded-4 p-3 shadow-sm bg-white">
                <p className="text-secondary small mb-1 text-capitalize fw-medium">
                  {cat in CATEGORY_KEYS ? t(CATEGORY_KEYS[cat as keyof typeof CATEGORY_KEYS]) : cat}
                </p>
                <h5 className="fw-bold m-0">{formatCurrency(locale, total)}</h5>
                <div className="mt-2">
                  <span className="badge rounded-pill" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {t("admin.percentOfTotal", { percent: ((total / grandTotal) * 100).toFixed(0) })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="border-bottom">
              <tr className="text-secondary">
                <th className="fw-medium ps-4 py-3">{t("common.description")}</th>
                <th className="fw-medium py-3">{t("common.pharmacy")}</th>
                <th className="fw-medium py-3">{t("common.category")}</th>
                <th className="fw-medium py-3">{t("common.date")}</th>
                <th className="fw-medium py-3 text-end pe-4">{t("common.price")}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => {
                const colors = categoryColors[e.category] ?? categoryColors.outros;
                return (
                  <tr key={e.id}>
                    <td className="ps-4 py-3 fw-medium text-dark">{e.title}</td>
                    <td className="py-3 text-muted">{e.pharmacy.name}</td>
                    <td className="py-3">
                      <span className="badge rounded-pill text-capitalize" style={{ backgroundColor: colors.bg, color: colors.text }}>
                        {e.category in CATEGORY_KEYS ? t(CATEGORY_KEYS[e.category as keyof typeof CATEGORY_KEYS]) : e.category}
                      </span>
                    </td>
                    <td className="py-3 text-muted">
                      {formatDate(locale, e.expenseDate)}
                    </td>
                    <td className="py-3 text-end pe-4 fw-semibold">
                      {formatCurrency(locale, Number(e.amount))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-top">
              <tr>
                <td colSpan={4} className="ps-4 py-3 fw-bold text-dark">{t("admin.grandTotal")}</td>
                <td className="py-3 text-end pe-4 fw-bold text-dark">
                  {formatCurrency(locale, grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}