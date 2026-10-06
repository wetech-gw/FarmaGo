import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveExpense, deleteExpense } from "../actions";
import { formatDate, formatNumber, getI18n } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n-core";

export const dynamic = "force-dynamic";

const CATEGORY_KEYS = {
  infraestrutura: "expense.categoryInfra",
  pessoal: "expense.categoryStaff",
  stock: "expense.categoryStock",
  outros: "expense.categoryOther",
} as const satisfies Record<string, TKey>;

export default async function DashboardExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const { locale, t } = await getI18n();
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin/dashboard");

  const pharmacyId = user.pharmacyId;
  if (!pharmacyId) redirect("/dashboard/sem-farmacia");

  const expenses = await prisma.expense.findMany({
    where: { pharmacyId },
    orderBy: { expenseDate: "desc" },
  });

  const editingId = edit ? Number(edit) : null;
  const editing = editingId ? expenses.find((expense) => expense.id === editingId) : null;
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const categories = (Object.keys(CATEGORY_KEYS) as (keyof typeof CATEGORY_KEYS)[]).map(
    (value) => ({ value, label: t(CATEGORY_KEYS[value]) }),
  );

  return (
    <>
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-1">{t("dash.expensesTitle")}</h1>
        <p className="text-secondary small mb-0">
          {t("dash.expensesSubtitle", { total: formatNumber(locale, total, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
        </p>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
        <div className="card-body">
          <h2 className="h6 fw-bold mb-3">
            <i className={`bi ${editing ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
              style={{ color: editing ? "#ea580c" : "#10b981" }}></i>
            {editing ? t("dash.editPrefix", { name: editing.title }) : t("dash.newExpense")}
          </h2>

          <form action={saveExpense} className="row g-3 align-items-end">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div className="col-12 col-md-4">
              <label className="form-label small fw-medium text-secondary" htmlFor="ex-title">
                {t("common.description")}
              </label>
              <input
                id="ex-title"
                name="title"
                type="text"
                className="form-control rounded-3"
                defaultValue={editing?.title ?? ""}
                required
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-medium text-secondary" htmlFor="ex-cat">
                {t("common.category")}
              </label>
              <select
                id="ex-cat"
                name="category"
                className="form-select rounded-3"
                defaultValue={editing?.category ?? "outros"}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-medium text-secondary" htmlFor="ex-amount">
                {t("common.price")}
              </label>
              <input
                id="ex-amount"
                name="amount"
                type="text"
                inputMode="decimal"
                className="form-control rounded-3"
                defaultValue={editing ? Number(editing.amount).toFixed(2) : ""}
                required
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-medium text-secondary" htmlFor="ex-date">
                {t("common.date")}
              </label>
              <input
                id="ex-date"
                name="expenseDate"
                type="date"
                className="form-control rounded-3"
                defaultValue={
                  editing ? editing.expenseDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
                }
                required
              />
            </div>

            <div className="col-6 col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-success rounded-3 px-3 py-2 w-100" aria-label={t("common.save")}>
                <i className="bi bi-check-lg"></i>
              </button>
              {editing && (
                <Link
                  href="/dashboard/expenses"
                  className="btn btn-outline-secondary rounded-3 px-3 py-2"
                  aria-label={t("common.cancel")}
                >
                  <i className="bi bi-x-lg"></i>
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow-sm bg-white">
        <div className="card-body">
          {expenses.length === 0 ? (
            <p className="text-secondary small mb-0">{t("dash.noExpenses")}</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-secondary">
                    <th>{t("common.description")}</th>
                    <th>{t("common.category")}</th>
                    <th>{t("common.date")}</th>
                    <th className="text-end">{t("common.price")}</th>
                    <th style={{ width: 120 }} />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="fw-semibold">{expense.title}</td>
                      <td className="small text-secondary">
                        {expense.category in CATEGORY_KEYS
                          ? t(CATEGORY_KEYS[expense.category as keyof typeof CATEGORY_KEYS])
                          : expense.category}
                      </td>
                      <td className="small">
                        {formatDate(locale, expense.expenseDate)}
                      </td>
                      <td className="text-end fw-bold">
                        {formatNumber(locale, Number(expense.amount), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-end">
                        <Link
                          href={`/dashboard/expenses?edit=${expense.id}`}
                          className="btn btn-sm btn-outline-success rounded-3 me-1"
                          aria-label={t("common.edit")}
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <form action={deleteExpense} className="d-inline">
                          <input type="hidden" name="id" value={expense.id} />
                          <button
                            type="submit"
                            className="btn btn-sm btn-outline-danger rounded-3"
                            aria-label={t("common.remove")}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}